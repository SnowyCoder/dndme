import {System} from "../system";
import {EcsTracker} from "../ecs";
import {SingleEcsStorage} from "../storage";
import {EditMapPhase} from "../../phase/editMap/editMapPhase";
import {Component} from "../component";
import {VisibilityComponent} from "./visibilitySystem";
import * as PointLightRender from "../../game/pointLightRenderer";
import {DESTROY_ALL} from "../../util/pixi";
import {newVisibilityAwareComponent, VisibilityAwareComponent} from "./visibilityAwareSystem";
import {LightComponent} from "./lightSystem";


export interface PlayerComponent extends Component {
    type: "player";
    nightVision: boolean;
}

export interface PlayerVisibleComponent extends Component {
    type: "player_visible";
    visible: boolean;
    _lightCount: number;
    _playerCount: number;
    _playerNightVisionCount: number;
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

        let visAware = phase.visibilityAwareSystem;
        visAware.events.on('aware_update', this.onVisibilityAwareUpdate, this);
    }

    private onPlayerVisibleCountersUpdate(t: PlayerVisibleComponent) {
        let newVisible = t._playerNightVisionCount > 0 || (t._lightCount > 0 && t._playerCount > 0);
        if (newVisible !== t.visible) {
            this.ecs.editComponent(t.entity, t.type, {
                visible: newVisible,
            });
        }
    }

    private onVisibilityAwareUpdate(target: VisibilityAwareComponent, added: number[], removed: number[]): void {
        console.log("VIS AWARE UPDATE " + target.entity + ", added: " + added + ", removed: " + removed);
        let playerVisible = this.visibleStorage.getComponent(target.entity);
        if (playerVisible === undefined) return;

        for (let e of added) {
            let player = this.storage.getComponent(e);
            if (player !== undefined) {
                playerVisible._playerCount += 1;
                if (player.nightVision) playerVisible._playerNightVisionCount += 1;
                continue
            }
            let light = this.ecs.getComponent(e, 'light') as LightComponent;
            if (light !== undefined) {
                playerVisible._lightCount += 1;
            }
        }

        for (let e of removed) {
            let player = this.storage.getComponent(e);
            if (player !== undefined) {
                playerVisible._playerCount -= 1;
                if (player.nightVision) playerVisible._playerNightVisionCount -= 1;
                continue
            }
            let light = this.ecs.getComponent(e, 'light') as LightComponent;
            if (light !== undefined) {
                playerVisible._lightCount -= 1;
            }
        }

        this.onPlayerVisibleCountersUpdate(playerVisible);
    }

    private onNightVisionUpdate(player: PlayerComponent) {
        let vis = this.ecs.getComponent(player.entity, 'visibility') as VisibilityComponent;

        let diff = player.nightVision ? +1 : -1;

        for (let t of vis._canSee) {
            let playerVisible = this.visibleStorage.getComponent(t);
            if (playerVisible === undefined) continue;
            playerVisible._playerNightVisionCount += diff;
            this.onPlayerVisibleCountersUpdate(playerVisible);
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


    private onComponentAdd(comp: Component): void {
        if (comp.type === 'player') {
            let player = comp as PlayerComponent;

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
            let c = comp as PlayerVisibleComponent;
            c._lightCount = 0;
            c._playerCount = 0;
            c._playerNightVisionCount = 0;
            this.ecs.addComponent(c.entity, newVisibilityAwareComponent());
        }
    }


    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === 'player') {
            let c = comp as PlayerComponent

            if ('nightVision' in changed) {
                this.onNightVisionUpdate(c);
            }

            //let pos = this.ecs.getComponent(c.entity, 'position') as PositionComponent;
            let vis = this.ecs.getComponent(c.entity, 'visibility') as VisibilityComponent;
            if (vis.polygon !== undefined) {
                // TODO: spread visibility?
            }
        } else if (comp.type === 'visibility') {
            let vis = comp as VisibilityComponent;
            let c = this.storage.getComponent(vis.entity);
            if (c === undefined || !('polygon' in changed)) return;

            // TODO: spread visibility?
        }
    }

    private onComponentRemove(comp: Component) {
    }

    enable(): void {
        PointLightRender.setup();
    }

    destroy(): void {
    }


}