import {Component, HOST_HIDDEN_TYPE, POSITION_TYPE, PositionComponent} from "../../component";
import {Aabb} from "../../../geometry/aabb";
import {SingleEcsStorage} from "../../storage";
import {DynamicTree} from "../../../geometry/dynamicTree";
import {World} from "../../world";
import {Line} from "../../../geometry/line";
import {computeViewport} from "../../../geometry/visibilityPolygon";
import {System} from "../../system";
import {
    INTERACTION_TYPE,
    InteractionComponent,
    InteractionSystem,
    LineShape,
    shapeAabb,
    shapeToAabb,
    ShapeType
} from "./interactionSystem";
import {STANDARD_GRID_OPTIONS} from "../../../game/grid";
import {GRID_TYPE} from "../gridSystem";
import {GridResource, Resource} from "../../resource";


export const VISIBILITY_TYPE = 'visibility';
export type VISIBILITY_TYPE = 'visibility';
export interface VisibilityComponent extends Component {
    type: VISIBILITY_TYPE;
    range: number;// In grids (by default 1 grid = 128 pixels)
    trackWalls: boolean;
    polygon?: number[];
    aabb?: Aabb;
    _aabbTreeId?: number;
    _canSee: number[];// Visibility aware components
    _canSeeWalls?: number[];
}

export const VISIBILITY_BLOCKER_TYPE = 'visibility_blocker';
export type VISIBILITY_BLOCKER_TYPE = 'visibility_blocker';
export interface VisibilityBlocker extends Component {
    type: VISIBILITY_BLOCKER_TYPE;
}


/**
 * Please don't stick a visibility component to an entity with a wall component (or vice-versa),
 * they don't go along together too much, for a lot of reasons.
 *
 * This system queries every entity with a VisibilityComponent and keeps it updated, by that I mean:
 * - Recompute the visibility polygon when the range changes
 * - Recompute the visibility polygon when the walls change
 *
 * Little note on visibility polygon algorithms:
 * General polygons are a mess to deal with, but the visibility polygon is a bit easier than most.
 * Since there are no portals nor mirrors in the game (yet!) each point in the polygon is visible from the center.
 * How can this property help in any way? Let me make an example:
 * We can easily compute if a point is inside of this polygon by doing a binary search on the angles, so the algorithm
 * becomes of complexity O(log(n)) where n are the polygon points.
 * Another property that I'm using is that a visibility polygon is much easier to triangulate!
 * Cut off all those ear cutting algorithms, just make triangles starting from the center!
 */
export class VisibilitySystem implements System {
    readonly name = VISIBILITY_TYPE;
    readonly dependencies = [INTERACTION_TYPE];

    readonly world: World;

    storage = new SingleEcsStorage<VisibilityComponent>(VISIBILITY_TYPE, false, false);
    blockerStorage = new SingleEcsStorage<VisibilityBlocker>(VISIBILITY_BLOCKER_TYPE, false, false);

    interactionSystem: InteractionSystem;
    gridSize: number;
    aabbTree = new DynamicTree<VisibilityComponent>();

    constructor(world: World) {
        this.world = world;
        this.interactionSystem = this.world.systems.get(INTERACTION_TYPE) as InteractionSystem;

        this.gridSize = (this.world.getResource(GRID_TYPE) as GridResource ?? STANDARD_GRID_OPTIONS).size;

        world.addStorage(this.storage);
        world.addStorage(this.blockerStorage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_removed', this.onComponentRemoved, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
    }

    private removeTreePolygon(c: VisibilityComponent): void {
        if (c._aabbTreeId !== undefined) {
            this.aabbTree.destroyProxy(c._aabbTreeId);
            c._aabbTreeId = undefined;
        }
    }

    updatePolygon(c: VisibilityComponent): void {
        // Ignore if it's hidden.
        if (this.world.getComponent(c.entity, HOST_HIDDEN_TYPE)) return;

        let pos = this.world.getComponent(c.entity, POSITION_TYPE) as PositionComponent;
        if (pos === undefined) return;

        // We will recreate it later (if necessary)
        this.removeTreePolygon(c);

        if (c.range <= 0) {
            this.world.editComponent(c.entity, c.type, {
                polygon: undefined,
                polygonAabb: undefined,
                aabb: undefined,
            });
            return;
        }

        let range = c.range * this.gridSize;

        let viewport = new Aabb(pos.x - range, pos.y - range, pos.x + range, pos.y + range);

        let lines = new Array<Line>();
        let blockerIds = new Array<number>();

        let query = this.interactionSystem.query(shapeAabb(viewport), c => {
            return this.blockerStorage.getComponent(c.entity) !== undefined;
        });

        for (let entry of query) {
            let s = entry.shape;
            if (s.type !== ShapeType.LINE) throw new Error('Only line is supported as light blocker shape')
            let lineData = (s as LineShape).data;
            // TODO: check if entity is IN wall.

            lines.push(lineData);
            blockerIds.push(entry.entity);
        }
        let usedBlockers;
        if (c.trackWalls === true) {
            usedBlockers = new Array<number>();
        } else {
            usedBlockers = undefined;
        }
        let polygon = computeViewport(lines, viewport, pos, usedBlockers);

        // Recycle the unused viewport object
        viewport.wrapPolygon(polygon);

        if (usedBlockers !== undefined) {
            for (let i = 0; i < usedBlockers.length; i++) {
                usedBlockers[i] = blockerIds[usedBlockers[i]];
            }
        }

        this.world.editComponent(c.entity, c.type, {
            polygon,
            aabb: viewport,
            _canSeeWalls: usedBlockers,
        });

        c._aabbTreeId = this.aabbTree.createProxy(viewport, c);
    }

    private recomputeArea(aabb: Aabb) {
        for (let node of [...this.aabbTree.query(aabb)]) {
            this.updatePolygon(node.tag!);
        }
    }

    private onComponentAdd(c: Component): void {
        if (c.type === VISIBILITY_TYPE) {
            let v = c as VisibilityComponent;
            v._canSee = [];
            this.updatePolygon(v);
        } else if (c.type === VISIBILITY_BLOCKER_TYPE) {
            let cmp = this.world.getComponent(c.entity, INTERACTION_TYPE) as InteractionComponent;
            if (cmp !== undefined) {
                this.recomputeArea(shapeToAabb(cmp.shape));
            }
        } else if (c.type === INTERACTION_TYPE && this.blockerStorage.getComponent(c.entity) !== undefined) {
            this.recomputeArea(shapeToAabb((c as InteractionComponent).shape));
        } else if (c.type === HOST_HIDDEN_TYPE) {
            // Component hidden is like component missing, they won't be able to see a thing
            let vis = this.storage.getComponent(c.entity);
            if (vis !== undefined) {
                this.removeVisibility(vis);
            }

            let blo = this.blockerStorage.getComponent(c.entity);
            if (blo !== undefined) {
                this.removeVisibilityBlocker(blo);
            }
        }
    }

    private onComponentEdited(c: Component, changes: any): void {
        if (this.world.getComponent(c.entity, HOST_HIDDEN_TYPE)) return;
        if (c.type === VISIBILITY_TYPE) {
            if ('range' in changes) {
                let vc = c as VisibilityComponent;
                if (isNaN(vc.range) || vc.range === undefined) {
                    vc.range = 50;
                }
                this.updatePolygon(c as VisibilityComponent);
            }
        } else if (c.type === POSITION_TYPE) {
            let vis = this.storage.getComponent(c.entity);
            if (vis !== undefined) {
                this.updatePolygon(vis);
            }
            let blk = this.blockerStorage.getComponent(c.entity);
            if (blk !== undefined) {
                let inter = this.world.getComponent(blk.entity,INTERACTION_TYPE) as InteractionComponent;
                this.recomputeArea(shapeToAabb(inter.shape));
            }
        } else if (c.type === INTERACTION_TYPE && 'shape' in changes && this.blockerStorage.getComponent(c.entity) !== undefined) {
            let i = c as InteractionComponent;

            this.recomputeArea(shapeToAabb(i.shape));
        }
    }

    private onComponentRemoved(c: Component): void {
        if (c.type === VISIBILITY_TYPE) {
            this.removeVisibility(c as VisibilityComponent);
        } else if (c.type === VISIBILITY_BLOCKER_TYPE) {
            this.removeVisibilityBlocker(c as VisibilityBlocker);
        } else if (c.type === INTERACTION_TYPE && this.blockerStorage.getComponent(c.entity) !== undefined) {
            let i = c as InteractionComponent;

            this.recomputeArea(shapeToAabb(i.shape));
        } else if (c.type === HOST_HIDDEN_TYPE) {
            // Welcome to the visible!
            let vis = this.storage.getComponent(c.entity);
            if (vis !== undefined) {
                this.updatePolygon(vis);
            }

            let blo = this.blockerStorage.getComponent(c.entity);
            if (blo !== undefined) {
                let cmp = this.world.getComponent(c.entity, INTERACTION_TYPE) as InteractionComponent;
                if (cmp !== undefined) {
                    this.recomputeArea(shapeToAabb(cmp.shape));
                }
            }
        }
    }

    private onResourceEdited(res: Resource, changed: any) {
        if (res.type === GRID_TYPE && 'size' in changed) {
            let grid = res as GridResource;
            this.gridSize = grid.size;

            // Update everything in the next tick so that everyone sees the changes first
            PIXI.Ticker.shared.addOnce(() => {
                for (let c of this.storage.allComponents()) {
                    this.updatePolygon(c);
                }
            });
        }
    }

    private removeVisibility(c: VisibilityComponent) {
        this.removeTreePolygon(c);
    }

    private removeVisibilityBlocker(c: VisibilityBlocker) {
        let cmp = this.world.getComponent(c.entity, INTERACTION_TYPE) as InteractionComponent;
        if (cmp !== undefined) {
            this.recomputeArea(shapeToAabb(cmp.shape));
        }
    }

    enable(): void {
    }

    destroy(): void {
    }
}
