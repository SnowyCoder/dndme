import {Component, PositionComponent} from "../component";
import {Aabb} from "../../geometry/aabb";
import {SingleEcsStorage} from "../storage";
import {DynamicTree} from "../../geometry/dynamicTree";
import {World} from "../ecs";
import {Line} from "../../geometry/line";
import {computeViewport} from "../../geometry/visibilityPolygon";
import {System} from "../system";
import {EditMapPhase} from "../../phase/editMap/editMapPhase";
import {
    InteractionComponent,
    InteractionSystem,
    LineShape,
    shapeAabb,
    shapeToAabb,
    ShapeType
} from "./interactionSystem";

export interface VisibilityComponent extends Component {
    type: "visibility";
    range: number;// In grids (by default 1 grid = 50 pixels)
    trackWalls: boolean;
    polygon?: number[];
    aabb?: Aabb;
    _aabbTreeId?: number;
    _canSee: number[];// Visibility aware components
    _canSeeWalls?: number[];
}

export interface VisibilityBlocker extends Component {
    type: "visibility_blocker";
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
    ecs: World;
    storage = new SingleEcsStorage<VisibilityComponent>("visibility", false, false);
    blockerStorage = new SingleEcsStorage<VisibilityBlocker>("visibility_blocker", false, false);

    interactionSystem: InteractionSystem;
    aabbTree = new DynamicTree<VisibilityComponent>();

    constructor(ecs: World, phase: EditMapPhase) {
        this.ecs = ecs;
        this.interactionSystem = phase.interactionSystem;

        ecs.addStorage(this.storage);
        ecs.addStorage(this.blockerStorage);
        ecs.events.on('component_add', this.onComponentAdd, this);
        ecs.events.on('component_edited', this.onComponentEdited, this);
        ecs.events.on('component_removed', this.onComponentRemoved, this);
    }

    private removeTreePolygon(c: VisibilityComponent): void {
        if (c._aabbTreeId !== undefined) {
            this.aabbTree.destroyProxy(c._aabbTreeId);
            c._aabbTreeId = undefined;
        }
    }

    updatePolygon(c: VisibilityComponent): void {
        let pos = this.ecs.getComponent(c.entity, "position") as PositionComponent;
        if (pos === undefined) return;

        // We will recreate it later (if necessary)
        this.removeTreePolygon(c);

        if (c.range <= 0) {
            this.ecs.editComponent(c.entity, c.type, {
                polygon: undefined,
                polygonAabb: undefined,
                aabb: undefined,
            });
            return;
        }

        let range = c.range * 50;

        let viewport = new Aabb(pos.x - range, pos.y - range, pos.x + range, pos.y + range);

        let lines = new Array<Line>();
        let blockerIds = new Array<number>();

        let query = this.interactionSystem.query(shapeAabb(viewport), c => {
            return this.blockerStorage.getComponent(c.entity) !== undefined;
        });

        for (let entry of query) {
            let s = entry.shape;
            if (s.type !== ShapeType.LINE) throw 'Only line is supported as light blocker shape'
            lines.push((s as LineShape).data);
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

        this.ecs.editComponent(c.entity, c.type, {
            polygon,
            aabb: viewport,
            _canSeeWalls: usedBlockers,
        });

        c._aabbTreeId = this.aabbTree.createProxy(viewport, c);
    }

    private recomputeArea(aabb: Aabb) {
        for (let node of [...this.aabbTree.query(aabb)]) {
            this.updatePolygon(node.tag);
        }
    }

    private onComponentAdd(c: Component): void {
        if (c.type === 'visibility') {
            let v = c as VisibilityComponent;
            v._canSee = [];
            this.updatePolygon(v);
        } else if (c.type === 'visibility_blocker') {
            let cmp = this.ecs.getComponent(c.entity, 'interaction') as InteractionComponent;
            if (cmp !== undefined) {
                this.recomputeArea(shapeToAabb(cmp.shape));
            }
        } else if (c.type === 'interaction' && this.blockerStorage.getComponent(c.entity) !== undefined) {
            this.recomputeArea(shapeToAabb((c as InteractionComponent).shape));
        }
    }

    private onComponentEdited(c: Component, changes: any): void {
        if (c.type === 'visibility') {
            if ('range' in changes) {
                this.updatePolygon(c as VisibilityComponent);
            }
        } else if (c.type === 'position') {
            let vis = this.storage.getComponent(c.entity);
            if (vis !== undefined) {
                this.updatePolygon(vis);
            }
            let blk = this.blockerStorage.getComponent(c.entity);
            if (blk !== undefined) {
                let inter = this.ecs.getComponent(blk.entity,'interaction') as InteractionComponent;
                this.recomputeArea(shapeToAabb(inter.shape));
            }
        }
         else if (c.type === 'interaction' && 'shape' in changes && this.blockerStorage.getComponent(c.entity) !== undefined) {
            let i = c as InteractionComponent;

            this.recomputeArea(shapeToAabb(i.shape));
        }
    }

    private onComponentRemoved(c: Component): void {
        if (c.type === 'visibility') {
            this.removeTreePolygon(c as VisibilityComponent);
        } else if (c.type === 'visibility_blocker') {
            let cmp = this.ecs.getComponent(c.entity, 'interaction') as InteractionComponent;
            if (cmp !== undefined) {
                this.recomputeArea(shapeToAabb(cmp.shape));
            }
        } else if (c.type === 'interaction' && this.blockerStorage.getComponent(c.entity) !== undefined) {
            let i = c as InteractionComponent;

            this.recomputeArea(shapeToAabb(i.shape));
        }
    }

    enable(): void {
        // Nothing to do
    }

    destroy(): void {
    }
}


