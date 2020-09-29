import {System} from "../system";
import {EcsTracker} from "../ecs";
import {SingleEcsStorage} from "../storage";
import {EditMapPhase} from "../../phase/editMap/editMapPhase";
import {Component, PositionComponent} from "../component";
import {VisibilityComponent} from "./visibilitySystem";
import * as PointLightRender from "../../game/pointLightRenderer";
import {DESTROY_ALL} from "../../util/pixi";
import {newVisibilityAwareComponent, VisibilityAwareComponent} from "./visibilityAwareSystem";
import {LightComponent} from "./lightSystem";
import {Aabb} from "../../geometry/aabb";


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

export interface VisibilitySpreadData {
    nightVision: boolean;
    aabb: Aabb,
    lights: VisibilitySpreadEntryData[];
    players: VisibilitySpreadEntryData[];
    nightVisPlayers: VisibilitySpreadEntryData[];
}

export interface VisibilitySpreadEntryData {
    mesh: PIXI.Mesh;
    pos: PIXI.IPointData;
    vis: VisibilityComponent,
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

    private createVisMesh(pos: PIXI.IPointData, vis: VisibilityComponent): PIXI.Mesh {
        let mesh = PointLightRender.createMesh(true);
        PointLightRender.updateMeshPolygons(mesh, pos, vis.polygon);
        let r = vis.range * 50;
        PointLightRender.updateMeshUniforms(mesh, pos, r*r, 0xFFFFFF);
        return mesh;
    }

    private spreadPlayerVisibility(player: number, pos: PIXI.IPointData, vis: VisibilityComponent, nightVision: boolean): void {
        let playerVis = PointLightRender.createMesh(true);
        PointLightRender.updateMeshPolygons(playerVis, pos, vis.polygon);
        let r = vis.range * 50;
        PointLightRender.updateMeshUniforms(playerVis, pos, r * r, 0xFFFFFF);

        let playerData = {
            mesh: playerVis,
            vis,
            pos,
        } as VisibilitySpreadEntryData;


        let players = [];
        let nightVisPlayers = [];

        let lights = [];
        let aabb;
        if (!nightVision) {
            players.push(playerData);

            aabb = undefined;
            for (let c of this.phase.visibilitySystem.aabbTree.query(vis.aabb)) {
                let visComponent = c.tag;
                let lightComponent = this.ecs.getComponent(visComponent.entity, 'light') as LightComponent;
                if (lightComponent === undefined || visComponent.range <= 0) continue;
                let pos = this.ecs.getComponent(visComponent.entity, 'position') as PositionComponent;

                if (aabb === undefined) aabb = visComponent.aabb.copy();
                else aabb.combine(visComponent.aabb, aabb);

               let mesh = this.createVisMesh(pos, visComponent);

                lights.push({
                    mesh,
                    pos,
                    vis: visComponent,
                } as VisibilitySpreadEntryData);
            }
            if (lights.length === 0) return;// no night vision AND no lights = can't see a thing!
            aabb.intersect(vis.aabb, aabb);
        } else {
            nightVisPlayers.push(playerData)
            aabb = vis.aabb;
        }

        let data = {
            aabb,
            lights,
            players,
            nightVisPlayers,
        } as VisibilitySpreadData;

        this.ecs.events.emit('visibility_spread', data);

        playerData.mesh.destroy(DESTROY_ALL);
        for (let light of data.lights) light.mesh.destroy(DESTROY_ALL);
    }

    private spreadLightVisibility(lightVis: VisibilityComponent) {
        // Quite similar to spreadPlayerVisibility but follows a light instead of a player,
        // When a light visibility polygon is changed this will query each player in the polygon's reach and
        // spread the visibility (only with that light!)

        let lightPos = this.ecs.getComponent(lightVis.entity, 'position') as PositionComponent;
        let lightMesh = this.createVisMesh(lightPos, lightVis);

        let lightData = [{
            mesh: lightMesh,
            pos: lightPos,
            vis: lightVis,
        } as VisibilitySpreadEntryData];

        let aabb = undefined;

        let players = [];
        for (let c of this.phase.visibilitySystem.aabbTree.query(lightVis.aabb)) {
            let visComponent = c.tag;
            let player = this.storage.getComponent(visComponent.entity);
            if (player === undefined || visComponent.range <= 0 || player.nightVision) continue;

            if (aabb === undefined) aabb = visComponent.aabb;
            else aabb.combine(visComponent.aabb, aabb);

            let vis = this.ecs.getComponent(player.entity, 'visibility') as VisibilityComponent;
            let pos = this.ecs.getComponent(player.entity, 'position') as PositionComponent;

            let mesh = this.createVisMesh(pos, vis);

            players.push({
                mesh,
                pos,
                vis,
            } as VisibilitySpreadEntryData);
        }

        if (players.length === 0) return;

        aabb.intersect(lightVis.aabb, aabb);

        let data = {
            aabb,
            lights: lightData,
            players,
            nightVisPlayers: [],
        } as VisibilitySpreadData;

        this.ecs.events.emit('visibility_spread', data);
        lightData[0].mesh.destroy(DESTROY_ALL);
        for (let player of players) player.mesh.destroy(DESTROY_ALL);
    }

    getSpreadDataForAabb(aabb: Aabb, cb: (data: VisibilitySpreadData) => void): void {
        let nightVisPlayers = [];
        let players = [];
        let lights = [];

        for (let c of this.phase.visibilitySystem.aabbTree.query(aabb)) {
            let vis = c.tag;

            let player = this.storage.getComponent(vis.entity);
            if (player !== undefined) {
                let pos = this.ecs.getComponent(vis.entity, 'position') as PositionComponent;
                let mesh = this.createVisMesh(pos, vis);

                let data = {mesh, pos, vis} as VisibilitySpreadEntryData;
                if (player.nightVision) nightVisPlayers.push(data);
                else players.push(data);

                continue;
            }
            let light = this.ecs.getComponent(vis.entity, 'light') as LightComponent;
            if (light !== undefined) {
                let pos = this.ecs.getComponent(vis.entity, 'position') as PositionComponent;
                let mesh = this.createVisMesh(pos, vis);
                let data = {mesh, pos, vis} as VisibilitySpreadEntryData;
                lights.push(data);
            }
        }

        let realPlayers = players;
        let realLights = lights;

        if (players.length === 0 || lights.length == 0) {
            realPlayers = [];
            realLights = [];
        }

        let data = {
            aabb,
            lights: realLights,
            players: realPlayers,
            nightVisPlayers,
        } as VisibilitySpreadData;
        cb(data);

        for (let x of lights) x.mesh.destroy(DESTROY_ALL);
        for (let x of players) x.mesh.destroy(DESTROY_ALL);
        for (let x of nightVisPlayers) x.mesh.destroy(DESTROY_ALL);
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
                let pos = this.ecs.getComponent(comp.entity, 'position') as PositionComponent;
                this.spreadPlayerVisibility(comp.entity, pos, vis, c.nightVision);
            }
        } else if (comp.type === 'visibility') {
            let vis = comp as VisibilityComponent;
            if (!('polygon' in changed)) return;
            let player = this.storage.getComponent(vis.entity);
            if (player !== undefined) {
                if (vis.polygon !== undefined) {
                    let pos = this.ecs.getComponent(comp.entity, 'position') as PositionComponent;
                    this.spreadPlayerVisibility(comp.entity, pos, vis, player.nightVision);
                }
                return;
            }
            let light = this.ecs.getComponent(vis.entity, 'light');
            if (light !== undefined) {
                this.spreadLightVisibility(vis);
            }
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