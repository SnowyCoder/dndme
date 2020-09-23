import {System} from "../system";
import {EcsTracker} from "../ecs";
import {SingleEcsStorage} from "../storage";
import {EditMapPhase} from "../../phase/editMap/editMapPhase";
import {Component, PositionComponent} from "../component";
import {VisibilityComponent} from "./visibilitySystem";
import * as PointLightRender from "../../game/pointLightRenderer";
import {DESTROY_ALL} from "../../util/pixi";
import {polygonPointIntersect} from "../../util/geometry";
import {shapePoint, shapePolygon} from "./interactionSystem";
import {overlapPointVsCircle} from "../../geometry/collision";
import {arrayRemoveElem} from "../../util/array";
import {Aabb} from "../../geometry/aabb";


export interface PlayerComponent extends Component {
    type: "player";
    nightVision: boolean;
    _canSee: number[];
}

export interface PlayerVisibleComponent extends Component {
    type: "player_visible";
    _visibleBy: number[];
}

export interface VisibilityData {
    pos: PIXI.IPointData;
    poly: number[];
    range: number;
    nightVision: boolean;
}

export class PlayerSystem implements System {
    readonly ecs: EcsTracker;

    storage = new SingleEcsStorage<PlayerComponent>('player', true, true);
    visibleStorage = new SingleEcsStorage<PlayerVisibleComponent>('player_visible', false, false);
    phase: EditMapPhase;

    constructor(ecs: EcsTracker, phase: EditMapPhase) {
        this.ecs = ecs;
        this.phase = phase;

        this.ecs.addStorage(this.storage);
        this.ecs.addStorage(this.visibleStorage);
        this.ecs.events.on('component_add', this.onComponentAdd, this);
        this.ecs.events.on('component_edited', this.onComponentEdited, this);
        this.ecs.events.on('component_remove', this.onComponentRemove, this);
    }

    private playerVisibleAdd(src: PlayerComponent, trg: PlayerVisibleComponent): void {
        if (trg._visibleBy.length === 1) {
            this.ecs.events.emit('players_visibility_enter', trg.entity);
        }
    }

    private playerVisibleRemove(src: PlayerComponent, trg: PlayerVisibleComponent): void {
        arrayRemoveElem(trg._visibleBy, src.entity);

        if (trg._visibleBy.length === 0) {
            if (!this.ecs.isMaster && this.phase.selection.selectedEntities.has(trg.entity)) {
                this.phase.selection.removeEntity(trg.entity);
            }
            this.ecs.events.emit('players_visibility_exit', trg.entity);
        }
    }

    private spreadPlayerVisibility(player: number, pos: PIXI.IPointData, poly: number[], range: number, nightVision: boolean): void {
        // Prepare drawable container:

        let cnt = new PIXI.Container();

        let playerVis = PointLightRender.createMesh(true);
        PointLightRender.updateMeshPolygons(playerVis, pos, poly);
        PointLightRender.updateMeshUniforms(playerVis, pos, range * range, 0xFFFFFF);
        playerVis.blendMode = PIXI.BLEND_MODES.DST_IN;

        cnt.addChild(playerVis);

        if (!nightVision) {
            // TODO:
            /*let aabb = new Aabb(
                pos.x - range, pos.y - range,
                pos.x + range, pos.y + range
            );
            for (let c of this.phase.visibilitySystem.aabbTree.query(aabb)) {
                let visComponent = c.tag;
                let lightComponent = this.ecs.getComponent(c.tag.entity, 'light') as LightComponent;
                if (lightComponent === undefined || visComponent.range <= 0) continue;
                lightComponent._lightDisplay
            }*/
        }

        this.ecs.events.emit('visibility_spread', player, cnt);

        cnt.destroy(DESTROY_ALL);
    }

    private visibilityChange(player: PlayerComponent, polygon: number[] | undefined, range: number): void {
        range *= 50;
        if (polygon === undefined) {
            // Player visibility null
            let oldCanSee = player._canSee;
            player._canSee = [];
            for (let x of oldCanSee) {
                this.playerVisibleRemove(player, this.visibleStorage.getComponent(x));
            }
            return;
        }

        if (!player.nightVision) return;// TODO:
        let oldCanSee = player._canSee;

        player._canSee = [];
        let posStorage = this.ecs.storages.get('position') as SingleEcsStorage<PositionComponent>;
        let playerPos = posStorage.getComponent(player.entity);

        for (let i of oldCanSee) {
            let pos = posStorage.getComponent(i);

            if (polygonPointIntersect(pos, polygon) && overlapPointVsCircle(pos, playerPos, range)) {
                player._canSee.push(i);
            } else {
                let target = this.visibleStorage.getComponent(i);
                // No need to remove target.entity from player._canSee as it's already been removed
                arrayRemoveElem(target._visibleBy, player.entity);
                this.playerVisibleRemove(player, target);
            }
        }

        let iter = this.phase.interactionSystem.query(shapePolygon(polygon), c => {
            return this.visibleStorage.getComponent(c.entity) !== undefined && oldCanSee.indexOf(c.entity) === -1;
        });
        for (let e of iter) {
            let pos = posStorage.getComponent(e.entity);
            if (!overlapPointVsCircle(pos, playerPos, range)) continue;

            let target = this.visibleStorage.getComponent(e.entity);
            player._canSee.push(e.entity);
            target._visibleBy.push(player.entity);
            this.playerVisibleAdd(player, target);
        }
    }

    private visibleElementMove(e: PlayerVisibleComponent) {
        let posStorage = this.ecs.storages.get('position') as SingleEcsStorage<PositionComponent>;
        let visStorage = this.ecs.storages.get('visibility') as SingleEcsStorage<VisibilityComponent>;

        let pos = posStorage.getComponent(e.entity);

        let oldVisibleBy = e._visibleBy;
        e._visibleBy = [];

        // Search for new players
        for (let p of this.phase.visibilitySystem.aabbTree.query(Aabb.fromPoint(pos))) {
            let entity = p.tag.entity;
            let player = this.storage.getComponent(entity);
            if (player === undefined && oldVisibleBy.indexOf(entity) !== -1) continue;

            let ppos = posStorage.getComponent(entity);
            let pvis = visStorage.getComponent(entity);

            let range = pvis.range * 50;
            if (!overlapPointVsCircle(pos, ppos, range) || !polygonPointIntersect(pos, p.tag.polygon)) continue;

            player._canSee.push(e.entity);
            e._visibleBy.push(player.entity);
            this.playerVisibleAdd(player, e);
        }

        // Check for old players
        for (let p of oldVisibleBy) {
            let player = this.storage.getComponent(p);
            let ppos = posStorage.getComponent(p);
            let pvis = visStorage.getComponent(p);

            let range = pvis.range * 50;
            if (overlapPointVsCircle(pos, ppos, range) && polygonPointIntersect(pos, pvis.polygon)) {
                e._visibleBy.push(p);
                continue;
            }

            // No need to remove e._visibleBy as it's already been cleared
            arrayRemoveElem(player._canSee, e.entity);
            this.playerVisibleRemove(player, e);
        }
    }


    private onComponentAdd(comp: Component): void {
        if (comp.type === 'player') {
            let player = comp as PlayerComponent;
            player._canSee = [];

            let vis = this.ecs.getComponent(player.entity, 'visibility');
            if (vis === undefined) {
                // We need a visibility component, create one if it does not already exist
                vis = {
                    type: "visibility",
                    range: 5,
                } as VisibilityComponent;
                this.ecs.addComponent(comp.entity, vis);
            }
        } else if (comp.type === 'player_visible') {
            this.visibleElementMove(comp as PlayerVisibleComponent);
        }
    }


    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === 'player') {
            let c = comp as PlayerComponent;
            //let pos = this.ecs.getComponent(c.entity, 'position') as PositionComponent;
            let vis = this.ecs.getComponent(c.entity, 'visibility') as VisibilityComponent;
            if (vis.polygon !== undefined) {
                this.visibilityChange(c, vis.polygon, vis.range);
            }
        } else if (comp.type === 'visibility') {
            let vis = comp as VisibilityComponent;
            let c = this.storage.getComponent(vis.entity);
            if (c === undefined || !('polygon' in changed)) return;

            this.visibilityChange(c, vis.polygon, vis.range);
        } else if (comp.type === 'position') {
            let vis = this.visibleStorage.getComponent(comp.entity);
            if (vis === undefined) return;

            this.visibleElementMove(vis);
        }
    }

    private onComponentRemove(comp: Component) {
        if (comp.type === 'player') {
            let player = comp as PlayerComponent;
            this.visibilityChange(player, undefined, 0);
        }
    }

    enable(): void {
        PointLightRender.setup();
    }

    destroy(): void {
    }


}