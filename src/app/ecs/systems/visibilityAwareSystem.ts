import {Component, PositionComponent} from "../component";
import {System} from "../system";
import {EcsTracker} from "../ecs";
import {EditMapPhase} from "../../phase/editMap/editMapPhase";
import {VisibilityComponent, VisibilitySystem} from "./visibilitySystem";
import {SingleEcsStorage} from "../storage";
import {arrayRemoveElem} from "../../util/array";
import {polygonPointIntersect} from "../../util/geometry";
import {overlapPointVsCircle} from "../../geometry/collision";
import {shapePolygon} from "./interactionSystem";
import {Aabb} from "../../geometry/aabb";
import EventEmitter = PIXI.utils.EventEmitter;

export interface VisibilityAwareComponent extends Component {
    type: "visibility_aware";
    visibleBy: number[];
    isWall: boolean;
}

export function newVisibilityAwareComponent(isWall: boolean = false): VisibilityAwareComponent {
    return {
        type: "visibility_aware",
        entity: -1,
        visibleBy: [],
        isWall,
    } as VisibilityAwareComponent;
}


export class VisibilityAwareSystem implements System {
    private ecs: EcsTracker;
    private phase: EditMapPhase;
    private visSys: VisibilitySystem;

    storage = new SingleEcsStorage<VisibilityAwareComponent>("visibility_aware", false, false);

    /**
     * Events:
     * aware_update(component, added, removed)
     *   Called when a VisibilityAware entity is updated
     *   why can't we do this with a normal component_edit event?
     *   It's easier not to build component diffs.
     *   If you want to track old values do it on your own.
     */
    events = new EventEmitter();

    constructor(ecs: EcsTracker, phase: EditMapPhase) {
        this.ecs = ecs;
        this.phase = phase;
        this.visSys = phase.visibilitySystem;

        ecs.addStorage(this.storage);

        ecs.events.on('component_add', this.onComponentAdd, this);
        ecs.events.on('component_edited', this.onComponentEdited, this);
        ecs.events.on('component_remove', this.onComponentRemove, this);
    }

    private visibilityChange(viewer: VisibilityComponent, polygon: number[] | undefined, range: number): void {
        range *= 50;
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
        let posStorage = this.ecs.storages.get('position') as SingleEcsStorage<PositionComponent>;
        let viewerPos = posStorage.getComponent(viewer.entity);

        // Check if old awares can still be seen
        for (let i of oldCanSee) {
            let pos = posStorage.getComponent(i);

            if (polygonPointIntersect(pos, polygon) && overlapPointVsCircle(pos, viewerPos, range)) {
                viewer._canSee.push(i);
            } else {
                let target = this.storage.getComponent(i);
                // No need to remove target.entity from player._canSee as it's already been removed
                arrayRemoveElem(target.visibleBy, viewer.entity);
                this.events.emit('aware_update', target, [], [viewer.entity]);
            }
        }

        let iter = this.phase.interactionSystem.query(shapePolygon(polygon), c => {
            let target = this.storage.getComponent(c.entity);
            return  target !== undefined && target.isWall !== true && oldCanSee.indexOf(c.entity) === -1;
        });
        for (let e of iter) {
            let pos = posStorage.getComponent(e.entity);
            if (!overlapPointVsCircle(pos, viewerPos, range)) continue;

            let target = this.storage.getComponent(e.entity);
            viewer._canSee.push(e.entity);
            target.visibleBy.push(viewer.entity);
            this.events.emit('aware_update', target, [viewer.entity], []);
        }
    }

    private visibleElementMove(aware: VisibilityAwareComponent): void {
        if (aware.isWall === true) return;
        let posStorage = this.ecs.storages.get('position') as SingleEcsStorage<PositionComponent>;
        let visStorage = this.ecs.storages.get('visibility') as SingleEcsStorage<VisibilityComponent>;

        let pos = posStorage.getComponent(aware.entity);

        let oldVisibleBy = aware.visibleBy;
        aware.visibleBy = [];

        let added = [];
        let removed = [];

        // Search for new players
        for (let p of this.phase.visibilitySystem.aabbTree.query(Aabb.fromPoint(pos))) {
            let entity = p.tag.entity;
            let vis = visStorage.getComponent(entity);
            if (vis === undefined || oldVisibleBy.indexOf(entity) !== -1) continue;

            let ppos = posStorage.getComponent(entity);
            let pvis = visStorage.getComponent(entity);

            let range = pvis.range * 50;
            if (!overlapPointVsCircle(pos, ppos, range) || !polygonPointIntersect(pos, p.tag.polygon)) continue;

            vis._canSee.push(aware.entity);
            aware.visibleBy.push(vis.entity);
            added.push(vis.entity);
        }

        // Check for old players
        for (let p of oldVisibleBy) {
            let vis = visStorage.getComponent(p);
            let ppos = posStorage.getComponent(p);
            let pvis = visStorage.getComponent(p);

            let range = pvis.range * 50;
            if (overlapPointVsCircle(pos, ppos, range) && polygonPointIntersect(pos, pvis.polygon)) {
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
        if (comp.type === 'visibility_aware') {
            this.visibleElementMove(comp as VisibilityAwareComponent);
        }
    }


    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === 'visibility') {
            let vis = comp as VisibilityComponent;

            if ('polygon' in changed) {
                this.visibilityChange(vis, vis.polygon, vis.range);
            }
            if ('_canSeeWalls' in changed) {
                this.onViewBlockerEdited(vis, vis._canSeeWalls, changed.walls);
            }
        } else if (comp.type === 'position') {
            let visAware = this.storage.getComponent(comp.entity);
            if (visAware === undefined) return;

            this.visibleElementMove(visAware);
        }
    }

    private onComponentRemove(comp: Component) {
        if (comp.type === 'visibility') {
            let vis = comp as VisibilityComponent;
            this.visibilityChange(vis, undefined, 0);
            this.onViewBlockerEdited(vis, [], vis._canSeeWalls);
        } else if (comp.type === 'visibility_aware') {
            let va = comp as VisibilityAwareComponent;
            va.visibleBy
            let visStorage = this.ecs.storages.get('visibility') as SingleEcsStorage<VisibilityComponent>;
            for (let p of va.visibleBy) {
                let vis = visStorage.getComponent(p);
                arrayRemoveElem(vis._canSee, va.entity);
            }
        }
    }



    enable(): void {
    }

    destroy(): void {
    }
}