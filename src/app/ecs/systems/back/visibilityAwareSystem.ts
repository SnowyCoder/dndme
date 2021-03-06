import {Component, POSITION_TYPE, PositionComponent} from "../../component";
import {System} from "../../system";
import {World} from "../../world";
import {VISIBILITY_TYPE, VisibilityComponent, VisibilitySystem} from "./visibilitySystem";
import {SingleEcsStorage} from "../../storage";
import {arrayRemoveElem} from "../../../util/array";
import {
    INTERACTION_TYPE,
    InteractionComponent,
    InteractionSystem,
    shapeCircle,
    shapeIntersect,
    shapePolygon
} from "./interactionSystem";
import {Aabb} from "../../../geometry/aabb";
import {GRID_TYPE} from "../gridSystem";
import {GridResource, Resource} from "../../resource";
import {STANDARD_GRID_OPTIONS} from "../../../game/grid";
import SafeEventEmitter from "../../../util/safeEventEmitter";


export const VISIBILITY_AWARE_TYPE = 'visibility_aware';
export type VISIBILITY_AWARE_TYPE = 'visibility_aware';
export interface VisibilityAwareComponent extends Component {
    type: VISIBILITY_AWARE_TYPE;
    visibleBy: number[];
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
     */
    events = new SafeEventEmitter();

    constructor(world: World) {
        this.world = world;

        this.visibilitySys = this.world.systems.get(VISIBILITY_TYPE) as VisibilitySystem;
        this.interactionSys = this.world.systems.get(INTERACTION_TYPE) as InteractionSystem;
        world.addStorage(this.storage);

        this.gridSize = (this.world.getResource(GRID_TYPE) as GridResource ?? STANDARD_GRID_OPTIONS).size;

        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
    }

    private visibilityChange(viewer: VisibilityComponent, polygon: number[] | undefined, range: number): void {
        range *= this.gridSize;
        if (polygon === undefined) {
            // Player visibility null
            let oldCanSee = viewer._canSee;
            viewer._canSee = [];
            for (let x of oldCanSee) {
                let target = this.storage.getComponent(x);
                if (target === undefined) continue;
                arrayRemoveElem(target.visibleBy, viewer.entity);
                this.events.emit('aware_update', target, [], [viewer.entity]);
            }
            return;
        }

        let oldCanSee = viewer._canSee;
        viewer._canSee = [];
        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;
        let interStorage = this.world.storages.get(INTERACTION_TYPE) as SingleEcsStorage<InteractionComponent>;
        let viewerPos = posStorage.getComponent(viewer.entity)!;

        let viewerPoly = shapePolygon(polygon);
        let viewerCircle = shapeCircle(viewerPos, range);

        // Check if old awares can still be seen
        for (let i of oldCanSee) {
            let shape = interStorage.getComponent(i)!.shape;

            if (shapeIntersect(viewerPoly, shape) && shapeIntersect(viewerCircle, shape)) {
                viewer._canSee.push(i);
            } else {
                let target = this.storage.getComponent(i)!;
                // No need to remove target.entity from player._canSee as it's already been removed
                arrayRemoveElem(target.visibleBy, viewer.entity);
                this.events.emit('aware_update', target, [], [viewer.entity]);
            }
        }

        let iter = this.interactionSys.query(viewerPoly, c => {
            let target = this.storage.getComponent(c.entity);
            return  target !== undefined && target.isWall !== true && oldCanSee.indexOf(c.entity) === -1;
        });
        for (let e of iter) {
            let shape = interStorage.getComponent(e.entity)!.shape;
            if (!shapeIntersect(viewerCircle, shape)) continue;

            let target = this.storage.getComponent(e.entity)!;
            viewer._canSee.push(e.entity);
            target.visibleBy.push(viewer.entity);
            this.events.emit('aware_update', target, [viewer.entity], []);
        }
    }

    private visibleElementMove(aware: VisibilityAwareComponent): void {
        if (aware.isWall === true) return;
        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;
        let visStorage = this.world.storages.get(VISIBILITY_TYPE) as SingleEcsStorage<VisibilityComponent>;

        let pos = posStorage.getComponent(aware.entity)!;
        let shape = (this.world.getComponent(aware.entity, INTERACTION_TYPE) as InteractionComponent).shape;

        let oldVisibleBy = aware.visibleBy;
        aware.visibleBy = [];

        let added = [];
        let removed = [];

        // Search for new players
        for (let p of this.visibilitySys.aabbTree.query(Aabb.fromPoint(pos))) {
            let entity = p.tag!.entity;
            let vis = visStorage.getComponent(entity);
            if (vis === undefined || oldVisibleBy.indexOf(entity) !== -1) continue;

            let ppos = posStorage.getComponent(entity)!;
            let pvis = visStorage.getComponent(entity)!;

            let range = pvis.range * this.gridSize;
            if (!shapeIntersect(shapeCircle(ppos, range), shape) || !shapeIntersect(shape, shapePolygon(p.tag?.polygon!))) continue;

            vis._canSee.push(aware.entity);
            aware.visibleBy.push(vis.entity);
            added.push(vis.entity);
        }

        // Check for old players
        for (let p of oldVisibleBy) {
            let vis = visStorage.getComponent(p)!;
            let ppos = posStorage.getComponent(p)!;
            let pvis = visStorage.getComponent(p)!;

            let range = pvis.range * this.gridSize;
            if (shapeIntersect(shapeCircle(ppos, range), shape) && shapeIntersect(shape, shapePolygon(pvis.polygon!))) {
                aware.visibleBy.push(p);
                continue;
            }

            // No need to remove e._visibleBy as it's already been cleared
            arrayRemoveElem(vis._canSee, aware.entity);
            removed.push(vis.entity);
        }

        if (added.length + removed.length > 0) {
            this.events.emit('aware_update', aware, added, removed);
        }
    }

    private onViewBlockerEdited(viewer: VisibilityComponent, newWalls: number[], oldWalls?: number[]) {
        oldWalls = oldWalls || [];
        if (newWalls.length === 0) {
            // Player visibility null
            for (let x of oldWalls) {
                let target = this.storage.getComponent(x);
                if (target === undefined) continue;
                arrayRemoveElem(target.visibleBy, viewer.entity);
                this.events.emit('aware_update', target, [], [viewer.entity]);
            }
            return;
        }
        let commonWalls = [];
        //console.log("WALL UPDATE, old: " + oldWalls + " new: " + newWalls);

        // Check if old awares can still be seen
        for (let i of oldWalls) {
            if (newWalls.indexOf(i) !== -1) {
                //console.log("| =" + i);
                commonWalls.push(i);
                continue;
            }

            let target = this.storage.getComponent(i);
            if (target === undefined) {
                //console.log("| %" + i);
                continue;
            }
            //console.log("| -" + target.entity);

            arrayRemoveElem(target.visibleBy, viewer.entity);
            this.events.emit('aware_update', target, [], [viewer.entity]);
        }

        for (let e of newWalls) {
            if (commonWalls.indexOf(e) !== -1) continue;

            let target = this.storage.getComponent(e);
            if (target === undefined) {
                //console.log("| ^" + e);
                continue;
            }
            //console.log("| +" + target.entity);

            target.visibleBy.push(viewer.entity);
            this.events.emit('aware_update', target, [viewer.entity], []);
        }
    }

    private onComponentAdd(comp: Component): void {
        if (comp.type === VISIBILITY_AWARE_TYPE) {
            this.visibleElementMove(comp as VisibilityAwareComponent);
        }
    }


    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === VISIBILITY_TYPE) {
            let vis = comp as VisibilityComponent;

            if ('polygon' in changed) {
                this.visibilityChange(vis, vis.polygon, vis.range);
            }
            if ('_canSeeWalls' in changed) {
                this.onViewBlockerEdited(vis, vis._canSeeWalls!, changed.walls);
            }
        } else if (comp.type === POSITION_TYPE) {
            let visAware = this.storage.getComponent(comp.entity);
            if (visAware === undefined) return;

            this.visibleElementMove(visAware);
        }
    }

    private onComponentRemove(comp: Component) {
        if (comp.type === VISIBILITY_TYPE) {
            let vis = comp as VisibilityComponent;
            this.visibilityChange(vis, undefined, 0);
            this.onViewBlockerEdited(vis, [], vis._canSeeWalls);
        } else if (comp.type === VISIBILITY_AWARE_TYPE) {
            let va = comp as VisibilityAwareComponent;
            va.visibleBy
            let visStorage = this.world.storages.get(VISIBILITY_TYPE) as SingleEcsStorage<VisibilityComponent>;
            for (let p of va.visibleBy) {
                let vis = visStorage.getComponent(p)!;
                arrayRemoveElem(vis._canSee, va.entity);
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


    enable(): void {
    }

    destroy(): void {
    }
}