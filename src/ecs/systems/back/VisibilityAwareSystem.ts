import {Component, POSITION_TYPE, PositionComponent} from "../../component";
import {System} from "../../System";
import {World} from "../../World";
import {VISIBILITY_TYPE, VisibilityComponent, VisibilitySystem, VisibilityDetailsComponent, VISIBILITY_DETAILS_TYPE} from "./VisibilitySystem";
import {MultiEcsStorage, SingleEcsStorage} from "../../Storage";
import {arrayRemoveElem} from "../../../util/array";
import {
    INTERACTION_TYPE,
    InteractionComponent,
    InteractionSystem,
    shapeCircle,
    shapeIntersect,
    shapePolygon,
    CircleShape
} from "./InteractionSystem";
import {Aabb} from "../../../geometry/aabb";
import {GRID_TYPE} from "../gridSystem";
import {GridResource, Resource} from "../../resource";
import {STANDARD_GRID_OPTIONS} from "../../../game/grid";
import SafeEventEmitter from "../../../util/safeEventEmitter";


export const VISIBILITY_AWARE_TYPE = 'visibility_aware';
export type VISIBILITY_AWARE_TYPE = 'visibility_aware';
export interface VisibilityAwareComponent extends Component {
    type: VISIBILITY_AWARE_TYPE;
    visibleBy: Array<[number, Array<number>]>;
    isWall: boolean;
}

export function newVisibilityAwareComponent(isWall: boolean = false): VisibilityAwareComponent {
    return {
        type: VISIBILITY_AWARE_TYPE,
        entity: -1,
        visibleBy: [],
        isWall,
    } as VisibilityAwareComponent;
}


export class VisibilityAwareSystem implements System {
    readonly name = VISIBILITY_AWARE_TYPE;
    readonly dependencies = [VISIBILITY_TYPE, INTERACTION_TYPE];
    readonly components?: [VisibilityAwareComponent];

    private world: World;
    private visibilitySys: VisibilitySystem;
    private interactionSys: InteractionSystem;

    private gridSize: number;

    storage = new SingleEcsStorage<VisibilityAwareComponent>(VISIBILITY_AWARE_TYPE, false, false);

    /**
     * Events:
     * aware_update(component, added, removed)
     *   Called when a VisibilityAware entity is updated
     *   why can't we do this with a normal component_edit event?
     *   It's easier not to build component diffs.
     *   If you want to track old values do it on your own.
     *
     *   added/removed: Array<[entityId, multiId]>
     *   (types: list[string] where each string can be of "light" or "player")
     */
    events = new SafeEventEmitter();

    constructor(world: World) {
        this.world = world;

        this.visibilitySys = this.world.requireSystem(VISIBILITY_TYPE);
        this.interactionSys = this.world.requireSystem(INTERACTION_TYPE);
        world.addStorage(this.storage);

        this.gridSize = (this.world.getResource(GRID_TYPE) ?? STANDARD_GRID_OPTIONS).size;

        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
    }

    private awareFind(target: VisibilityAwareComponent, viewerId: number, ensurePresent: boolean): number {
        let index = target.visibleBy.findIndex(x => x[0] == viewerId);
        if (index === -1 && ensurePresent) {
            index = target.visibleBy.length;
            target.visibleBy.push([viewerId, []]);
        }
        return index;
    }

    private awareAddOne(target: VisibilityAwareComponent, viewerId: number, viewerMulti: number) {
        target.visibleBy[this.awareFind(target, viewerId, true)][1].push(viewerMulti);
        this.events.emit('aware_update', target, [[viewerId, viewerMulti]], []);
    }

    private awareRemoveOne(target: VisibilityAwareComponent, viewerId: number, viewerMulti: number) {
        let index = this.awareFind(target, viewerId, false);
        if (index === -1) return;
        let arr = target.visibleBy[index][1];
        if (!arrayRemoveElem(arr, viewerMulti)) return;

        if (arr.length === 0) {
            target.visibleBy.splice(index, 1);
        }
        this.events.emit('aware_update', target, [], [[viewerId, viewerMulti]]);
    }

    private awareRemoveAll(target: VisibilityAwareComponent, viewerId: number) {
        let index = this.awareFind(target, viewerId, false);
        if (index === -1) return;
        let arr = target.visibleBy.splice(index, 1)[0][1];

        let removed: Array<[number, number]> = arr.map(x => [viewerId, x]);
        this.events.emit('aware_update', target, [], removed);
    }

    private visibilityChange(viewer: VisibilityDetailsComponent, polygon: number[] | undefined): void {
        // A Visiblity result is updated, most probably the polygon has changed (can also be something else)
        // We need to update the entities that are aware of their viewers.

        if (polygon === undefined) {
            // Player visibility null
            let oldCanSee = viewer._canSee;
            viewer._canSee = {};
            for (let x in oldCanSee) {
                let target = this.storage.getComponent(Number(x));
                if (target === undefined) continue;
                this.awareRemoveAll(target, viewer.entity);
            }
            return;
        }

        // get possible ranges
        const viewers = [...(this.world.getStorage(VISIBILITY_TYPE) as MultiEcsStorage<VisibilityComponent>).getComponents(viewer.entity)];
        viewers.sort((a, b) => b.range - a.range);// Ascending order by range

        const oldCanSee = viewer._canSee;
        viewer._canSee = {};
        const posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;
        const interStorage = this.world.storages.get(INTERACTION_TYPE) as SingleEcsStorage<InteractionComponent>;
        const viewerPos = posStorage.getComponent(viewer.entity)!;

        const viewerPoly = shapePolygon(polygon);
        const viewerCircles = new Map<number, CircleShape>();// circles by viewer multiId
        viewers.forEach(x => {
            viewerCircles.set(x.multiId, shapeCircle(viewerPos, x.range * this.gridSize));
        });

        // Check if old awares can still be seen
        for (let seen in oldCanSee) {
            const shape = interStorage.getComponent(Number(seen))!.shape;
            const canSee = [];
            const target = this.storage.getComponent(Number(seen))!;
            // An entity was visibile by us previously, there are three cases:
            // - The entity is still visible in the same ranges
            // - The entity moved away, and is visible by less ranges
            // - The entity moved closer, and is visible by more ranges

            // First, if the polygon does not intersect then nothing does, we can finish early
            if (!shapeIntersect(viewerPoly, shape)) {
                // No need to remove target.entity from viewer._canSee as it's already been removed
                // Remove all from this viewer
                this.awareRemoveAll(target, viewer.entity);
                continue;
            }
            // Now we only need to check the circles
            // Let's first ispect the ranges that were already inside
            for (let multiid of oldCanSee[seen]) {
                const circle = viewerCircles.get(multiid);
                if (circle !== undefined && shapeIntersect(circle, shape)) {
                    canSee.push(multiid);
                } else {
                    // No need to remove target.entity from viewer._canSee as it's already been removed
                    this.awareRemoveOne(target, viewer.entity, multiid);
                }
            }
            // Let's then ispect the ranges that were NOT inside
            for (let [multiid, circle] of viewerCircles.entries()) {
                if (oldCanSee[seen].includes(multiid)) {
                    continue;// This was inside
                }
                if (!shapeIntersect(circle, shape)) {
                    // Still outside
                } else {
                    canSee.push(multiid);
                    this.awareAddOne(target, viewer.entity, multiid);
                }
            }
            if (canSee.length > 0) {
                viewer._canSee[seen] = canSee;
            }
        }

        // Check entities that were not previously seen
        const iter = this.interactionSys.query(viewerPoly, c => {
            const target = this.storage.getComponent(c.entity);// Check if it's aware (of being visible)
            // Check also that it's not a blocker, and that it was not previously visible (we've already dealt with those)
            return  target !== undefined && target.isWall !== true && !(c.entity in oldCanSee);
        });
        for (let e of iter) {
            const shape = e.shape;
            // TODO: possible optimization: we could sort ranges by biggest to smallest, then terminate when a range does not intersect
            //   this works since if the player sees to 20 meters and the torch to 10 meters, the things that the torch sees are a strict subset
            //   of the players'.
            // This optimization might not be useful since objects with more than 1 visiblity ranges are quite rare
            let viewersIds = new Array<number>();
            let viewedBy = new Array<[number, number]>();
            for (let [multiid, circle] of viewerCircles.entries()) {
                if (!shapeIntersect(circle, shape)) continue;

                viewersIds.push(multiid);
                viewedBy.push([viewer.entity, multiid]);
            }
            if (viewedBy.length !== 0) {
                let target = this.storage.getComponent(e.entity)!;
                viewer._canSee[e.entity] = viewersIds;
                target.visibleBy.push([viewer.entity, [...viewersIds]]);
                this.events.emit('aware_update', target, viewedBy, []);
            }
        }
    }

    private visibleElementMove(aware: VisibilityAwareComponent): void {
        // An element that is aware of its viewers has moved, we must recompute visibleBy.
        if (aware.isWall === true) return;
        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;
        let visStorage = this.world.storages.get(VISIBILITY_TYPE) as MultiEcsStorage<VisibilityComponent>;
        let visDetStorage = this.world.storages.get(VISIBILITY_DETAILS_TYPE) as SingleEcsStorage<VisibilityDetailsComponent>;

        let pos = posStorage.getComponent(aware.entity)!;
        let shape = this.world.getComponent(aware.entity, INTERACTION_TYPE)!.shape;

        let oldVisibleBy = aware.visibleBy;
        aware.visibleBy = [];

        let added = new Array<[number, number]>();
        let removed = new Array<[number, number]>();

        // Search for new players
        for (let p of this.visibilitySys.aabbTree.query(Aabb.fromPoint(pos))) {
            let entity = p.tag!.entity;
            let visDet = visDetStorage.getComponent(entity);
            if (visDet === undefined || oldVisibleBy.findIndex(x => x[0] == entity) !== -1) continue;

            if (!shapeIntersect(shape, shapePolygon(p.tag?.polygon!))) continue;

            let ppos = posStorage.getComponent(entity)!;
            let multiIds = new Array<number>();
            for (let pvis of visStorage.getComponents(entity)) {
                let range = pvis.range * this.gridSize;
                if (!shapeIntersect(shapeCircle(ppos, range), shape)) continue;

                multiIds.push(pvis.multiId);
                added.push([entity, pvis.multiId]);
            }

            visDet._canSee[aware.entity] = multiIds;
            aware.visibleBy.push([entity, [...multiIds]]);
        }

        // Check for old players
        for (let [entity, multiIds] of oldVisibleBy) {
            let visDet = visDetStorage.getComponent(entity)!;
            if (!shapeIntersect(shape, shapePolygon(visDet.polygon!))) {
                delete visDet._canSee[entity];
                removed.push(...multiIds.map(x => [entity, x] as [number, number]));
                continue;
            }

            let pos = posStorage.getComponent(entity)!;
            let canSee = new Array<number>();
            for (let vis of visStorage.getComponents(entity)) {
                let range = vis.range * this.gridSize;
                if (shapeIntersect(shapeCircle(pos, range), shape)) {
                    canSee.push(vis.multiId);
                    aware.visibleBy[this.awareFind(aware, entity, true)][1].push(vis.multiId);
                    if (!multiIds.includes(vis.multiId)) {
                        added.push([entity, vis.multiId]);
                    }
                }
            }
            //
            visDet._canSee[aware.entity] = canSee;
            if (canSee.length === 0) {
                delete visDet._canSee[aware.entity];
            }

            // No need to remove e._visibleBy as it's already been cleared
            let notInsideAnymore = multiIds.filter(x => !canSee.includes(x));
            removed.push(...notInsideAnymore.map(x => [entity, x] as [number, number]));
        }

        if (added.length + removed.length > 0) {
            this.events.emit('aware_update', aware, added, removed);
        }
    }

    private onViewBlockerEdited(viewer: VisibilityDetailsComponent, blockersUsed: number[]) {
        // Called when a view polygon is recomputed and the entities that are blocking its view change

        const oldWalls = viewer._canSeeWalls || {};
        viewer._canSeeWalls = {};
        const viewRanges = this.world.getStorage(VISIBILITY_TYPE).getComponents(viewer.entity);
        const ranges = [...viewRanges]
                .map(x => [x.range, x.multiId])
                .sort((a, b) => b[0] - a[0]);
        const pos = this.world.getComponent(viewer.entity, POSITION_TYPE)!;

        if (blockersUsed.length === 0) {
            // Player visibility null
            for (let x in oldWalls) {
                let target = this.storage.getComponent(Number(x));
                if (target === undefined) continue;
                this.awareRemoveAll(target, viewer.entity);
            }
            return;
        }

        // Check if old awares can still be seen
        for (let i in oldWalls) {
            let id = Number(i);
            if (blockersUsed.includes(id)) {
                //console.log("| =" + id);
                continue;
            }

            let target = this.storage.getComponent(id);
            if (target === undefined) {
                //console.log("| %" + id);
                continue;
            }
            //console.log("| -" + target.entity);

            // No need to remove from viewer._canSeeWalls
            this.awareRemoveAll(target, viewer.entity);
        }

        for (let e of blockersUsed) {
            let target = this.storage.getComponent(e);
            if (target === undefined) {
                //console.log("| ^" + e);
                continue;
            }
            const blockerShape = this.world.getComponent(e, INTERACTION_TYPE)!.shape;

            let multiIds = [ranges[0][1]];
            for (let i = 1; i < ranges.length; i++) {
                if (!shapeIntersect(shapeCircle(pos, ranges[i][0]), blockerShape)) {
                    break;
                }
                multiIds.push(ranges[i][1]);
            }

            //console.log("| +" + target.entity);
            const index = this.awareFind(target, viewer.entity, true);
            const array = target.visibleBy[index];
            const oldMultiIds = array[1];
            array[1] = multiIds;
            let added = multiIds.filter(x => !oldMultiIds.includes(x)).map(x => [viewer.entity, x]);
            let removed = oldMultiIds.filter(x => !multiIds.includes(x)).map(x => [viewer.entity, x]);

            if (added.length + removed.length !== 0) {
                this.events.emit('aware_update', target, added, removed);
            }
        }
    }

    private onComponentAdd(comp: Component): void {
        if (comp.type === VISIBILITY_AWARE_TYPE) {
            this.visibleElementMove(comp as VisibilityAwareComponent);
        }
    }


    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === VISIBILITY_DETAILS_TYPE) {
            let vis = comp as VisibilityDetailsComponent;

            this.visibilityChange(vis, vis.polygon);
            if ('_blockersUsed' in changed) {
                this.onViewBlockerEdited(vis, vis._blockersUsed);
            }
        } else if (comp.type === POSITION_TYPE) {
            let visAware = this.storage.getComponent(comp.entity);
            if (visAware === undefined) return;

            this.visibleElementMove(visAware);
        }
    }

    private onComponentRemove(comp: Component) {
        if (comp.type === VISIBILITY_DETAILS_TYPE) {
            let vis = comp as VisibilityDetailsComponent;
            this.visibilityChange(vis, undefined);
            this.onViewBlockerEdited(vis, []);
        } else if (comp.type === VISIBILITY_AWARE_TYPE) {
            let va = comp as VisibilityAwareComponent;
            let visStorage = this.world.storages.get(VISIBILITY_DETAILS_TYPE) as SingleEcsStorage<VisibilityDetailsComponent>;
            for (let p of va.visibleBy) {
                let vis = visStorage.getComponent(p[0])!;
                if (va.isWall && vis._canSeeWalls !== undefined) {
                    delete vis._canSeeWalls[va.entity];
                } else {
                    delete vis._canSee[va.entity];
                }
            }
        }
    }


    private onResourceEdited(res: Resource, changed: any) {
        if (res.type === GRID_TYPE && 'size' in changed) {
            let grid = res as GridResource;
            this.gridSize = grid.size;

            // We don't really care, the visibility polygons will change on their own
        }
    }

    manualRecomputeWall(entity: number) {
        /*const c = this.storage.getComponent(entity);
        if (c === undefined || !c.isWall) return;

        const newWalls: number[] = [];

        const inter = this.world.getComponent(c.entity, INTERACTION_TYPE);
        if (inter === undefined || inter.shape.type !== ShapeType.LINE) return;
        const aabb = shapeToAabb(inter.shape);
        for (let node of [...this.visibilitySys.aabbTree.query(aabb)]) {
            const comp = node.tag! as VisibilityDetailsComponent;
            if (c.entity in (comp._canSeeWalls ?? {})) {
                newWalls.push(comp.entity);
            }
        }


        const removedElements = c.visibleBy.filter(x => !newWalls.includes(x[0]));
        const addedElements = newWalls.filter(x => !c.visibleBy.includes(x));

        this.events.emit('aware_update', c, addedElements, removedElements);*/
    }


    enable(): void {
    }

    destroy(): void {
    }
}
