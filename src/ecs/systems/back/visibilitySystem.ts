import {Component, POSITION_TYPE, PositionComponent, MultiComponent, SHARED_TYPE} from "../../component";
import {Aabb} from "../../../geometry/aabb";
import {MultiEcsStorage, SingleEcsStorage} from "../../storage";
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
import * as PIXI from "pixi.js";
import { GameClockResource, GAME_CLOCK_TYPE } from "./pixiBoardSystem";

// This system uses a reuqest-response pattern
// Where there are multiple "requests" for visibility but a single answer, let's make an example.
// If a player has a light with range 5 but the player can see 10 then it would be really inefficient to
//   compute two different visibility polygons, what we do instead is to compute only one polygon for the
//   bigger range, then check the range to see if they're visible for both the player or the light
//   or the player only


export const VISIBILITY_TYPE = 'visibility';
export type VISIBILITY_TYPE = typeof VISIBILITY_TYPE;
export interface VisibilityComponent extends MultiComponent {
    type: VISIBILITY_TYPE;
    requester: string;// light or player usually
    range: number;// In grids (by default 1 grid = 128 pixels)
    trackWalls: boolean;
    isBeingRemoved: boolean;// true
}

export const VISIBILITY_DETAILS_TYPE = 'visibility_details';
export type VISIBILITY_DETAILS_TYPE = typeof VISIBILITY_DETAILS_TYPE;
export interface VisibilityDetailsComponent extends Component {
    type: VISIBILITY_DETAILS_TYPE;
    range: number;
    trackWalls: boolean;
    // polygon is only computed on an Axis-Aligned Square where the length of the
    // side is at least as much as the diameter
    polygon?: number[];
    aabb?: Aabb;
    _aabbTreeId?: number;
    _blockersUsed: number[];
    _canSee: {[id: number]: Array<number>};// Visibility aware components _canSee[whoIsSeen] = Array<whocanseeit (multiid)>
    _canSeeWalls?: {[id: number]: Array<number>};
}

export const VISIBILITY_BLOCKER_TYPE = 'visibility_blocker';
export type VISIBILITY_BLOCKER_TYPE = typeof VISIBILITY_BLOCKER_TYPE;
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

    storage = new MultiEcsStorage<VisibilityComponent>(VISIBILITY_TYPE, false, false);
    detailsStorage = new SingleEcsStorage<VisibilityDetailsComponent>(VISIBILITY_DETAILS_TYPE, false, false);
    blockerStorage = new SingleEcsStorage<VisibilityBlocker>(VISIBILITY_BLOCKER_TYPE, false, false);

    interactionSystem: InteractionSystem;
    gridSize: number;
    clock: GameClockResource;
    aabbTree = new DynamicTree<VisibilityDetailsComponent>();

    constructor(world: World) {
        this.world = world;
        this.interactionSystem = this.world.systems.get(INTERACTION_TYPE) as InteractionSystem;

        this.clock = this.world.getResource(GAME_CLOCK_TYPE) as GameClockResource;
        this.gridSize = (this.world.getResource(GRID_TYPE) as GridResource ?? STANDARD_GRID_OPTIONS).size;

        world.addStorage(this.storage);
        world.addStorage(this.detailsStorage);
        world.addStorage(this.blockerStorage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('component_removed', this.onComponentRemoved, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
    }

    private removeTreePolygon(c: VisibilityDetailsComponent): void {
        if (c._aabbTreeId !== undefined) {
            this.aabbTree.destroyProxy(c._aabbTreeId);
            c._aabbTreeId = undefined;
        }
    }

    updatePolygon(c: VisibilityDetailsComponent): void {
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
            _blockersUsed: usedBlockers,
        });

        c._aabbTreeId = this.aabbTree.createProxy(viewport, c);
    }

    private recomputeArea(aabb: Aabb) {
        for (let node of [...this.aabbTree.query(aabb)]) {
            this.updatePolygon(node.tag!);
        }
    }

    private recomputeDetails(entity: number) {
        let range = 0;
        let trackWalls = false;

        let isHidden = this.world.getComponent(entity, SHARED_TYPE) === undefined;
        let needsRemoval = !isHidden;
        if (!isHidden) {
            for (let el of this.storage.getComponents(entity)) {
                needsRemoval = false;
                if (el.range > range) {
                    range = el.range;
                }
                trackWalls = trackWalls || el.trackWalls;
            }
        }

        let oldDetails = this.detailsStorage.getComponent(entity);
        if (!needsRemoval) {
            let details;
            if (oldDetails !== undefined) {
                details = oldDetails;
                this.world.editComponent(entity, oldDetails.type, {
                    range, trackWalls,
                }, undefined, false);
            } else {
                details = {
                    entity,
                    type: VISIBILITY_DETAILS_TYPE,
                    range, trackWalls,
                    _canSee: {},
                } as VisibilityDetailsComponent;
                this.world.addComponent(entity, details);
            }
            this.updatePolygon(details);
        } else {
            // Nothing to see here, there are no vis. component or the range is 0 on all.
            if (oldDetails !== undefined) {
                this.removeTreePolygon(oldDetails);
                this.world.removeComponent(oldDetails);
            }
        }
    }

    private onComponentAdd(c: Component): void {
        if (c.type === VISIBILITY_TYPE) {
            let v = c as VisibilityComponent;

            this.recomputeDetails(c.entity);
        } else if (c.type === VISIBILITY_BLOCKER_TYPE) {
            let cmp = this.world.getComponent(c.entity, INTERACTION_TYPE) as InteractionComponent;
            if (cmp !== undefined) {
                this.recomputeArea(shapeToAabb(cmp.shape));
            }
        } else if (c.type === INTERACTION_TYPE && this.blockerStorage.getComponent(c.entity) !== undefined) {
            this.recomputeArea(shapeToAabb((c as InteractionComponent).shape));
        } else if (c.type === SHARED_TYPE) {
            // Welcome to the visible!
            let vis = this.detailsStorage.getComponent(c.entity);
            if (vis !== undefined) {
                this.recomputeDetails(vis.entity);
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

    private onComponentEdited(c: Component, changes: any): void {
        if (!this.world.getComponent(c.entity, SHARED_TYPE)) return;
        if (c.type === VISIBILITY_TYPE) {
            if ('range' in changes) {
                let vc = c as VisibilityComponent;
                if (isNaN(vc.range) || vc.range === undefined) {
                    vc.range = 50;
                }
                this.recomputeDetails(c.entity);
            }
        } else if (c.type === POSITION_TYPE) {
            let vis = this.detailsStorage.getComponent(c.entity);
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

    private onComponentRemove(c: Component): void {
        if (c.type === VISIBILITY_TYPE) {
            (c as VisibilityComponent).isBeingRemoved = true;
            this.recomputeDetails(c.entity);
        }
    }

    private onComponentRemoved(c: Component): void {
        if (c.type === VISIBILITY_BLOCKER_TYPE) {
            this.removeVisibilityBlocker(c as VisibilityBlocker);
        } else if (c.type === INTERACTION_TYPE && this.blockerStorage.getComponent(c.entity) !== undefined) {
            let i = c as InteractionComponent;

            this.recomputeArea(shapeToAabb(i.shape));
        } else if (c.type === SHARED_TYPE) {
            // Component hidden is like component missing, they won't be able to see a thing
            let vis = this.detailsStorage.getComponent(c.entity);
            if (vis !== undefined) {
                this.recomputeDetails(c.entity);
            }

            let blo = this.blockerStorage.getComponent(c.entity);
            if (blo !== undefined) {
                this.removeVisibilityBlocker(blo);
            }
        }
    }

    private onResourceEdited(res: Resource, changed: any) {
        if (res.type === GRID_TYPE && 'size' in changed) {
            let grid = res as GridResource;
            this.gridSize = grid.size;

            // Update everything in the next tick so that everyone sees the changes first
            this.clock.ticker.addOnce(() => {
                for (let c of this.detailsStorage.allComponents()) {
                    this.updatePolygon(c);
                }
            });
        }
    }

    private removeVisibility(c: VisibilityDetailsComponent) {
        this.removeTreePolygon(c);
        this.world.editComponent(c.entity, c.type, {
            polygon: undefined,
            aabb: undefined,
        });
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
