import {System} from "../system";
import {World} from "../world";
import {SingleEcsStorage} from "../storage";
import {Component, HOST_HIDDEN_TYPE, POSITION_TYPE, PositionComponent} from "../component";
import {VISIBILITY_TYPE, VisibilityComponent, VisibilitySystem} from "./visibilitySystem";
import * as PointLightRender from "../../game/pointLightRenderer";
import {DESTROY_ALL} from "../../util/pixi";
import {
    newVisibilityAwareComponent,
    VISIBILITY_AWARE_TYPE,
    VisibilityAwareComponent,
    VisibilityAwareSystem
} from "./visibilityAwareSystem";
import {LIGHT_SETTINGS_TYPE, LIGHT_TYPE, LightComponent, LightSettings, LightSystem} from "./lightSystem";
import {Aabb} from "../../geometry/aabb";
import PIXI from "../../PIXI";
import {Resource} from "../resource";
import {PIN_TYPE} from "./pinSystem";

export const PLAYER_TYPE = 'player';
export type PLAYER_TYPE = typeof PLAYER_TYPE;
export interface PlayerComponent extends Component {
    type: PLAYER_TYPE;
    nightVision: boolean;
    range: number;
}

/**
 * Added to every object that might be visible by a player, it tracks how many players and how many lights
 * are seeing it.
 */
export const PLAYER_VISIBLE_TYPE = 'player_visible';
export type PLAYER_VISIBLE_TYPE = typeof PLAYER_VISIBLE_TYPE;
export interface PlayerVisibleComponent extends Component {
    type: PLAYER_VISIBLE_TYPE;
    visible: boolean;
    isWall?: boolean;// Non modifiable
    _refCount: number;
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

export const EVENT_VISIBILITY_SPREAD = 'visibility_spread';
export type EVENT_VISIBILITY_SPREAD = typeof EVENT_VISIBILITY_SPREAD;

export class PlayerSystem implements System {
    readonly name = PLAYER_TYPE;
    readonly dependencies = [PIN_TYPE, VISIBILITY_TYPE, VISIBILITY_AWARE_TYPE, LIGHT_TYPE];

    readonly world: World;

    private readonly lightSystem: LightSystem;
    private readonly visibilitySystem: VisibilitySystem;

    storage = new SingleEcsStorage<PlayerComponent>(PLAYER_TYPE, true, true);
    visibleStorage = new SingleEcsStorage<PlayerVisibleComponent>(PLAYER_VISIBLE_TYPE, false, false);

    // If false a player can see a thing only if it's illuminated by artificial light
    ambientIlluminated: boolean = false;

    constructor(world: World) {
        this.world = world;

        this.lightSystem = world.systems.get(LIGHT_TYPE) as LightSystem;
        this.visibilitySystem = world.systems.get(VISIBILITY_TYPE) as VisibilitySystem;

        this.world.addStorage(this.storage);
        this.world.addStorage(this.visibleStorage);
        this.world.events.on('component_add', this.onComponentAdd, this);
        this.world.events.on('component_edited', this.onComponentEdited, this);
        this.world.events.on('component_remove', this.onComponentRemove, this);
        this.world.events.on('resource_edited', this.onResourceEdited, this);

        let visAware = world.systems.get(VISIBILITY_AWARE_TYPE) as VisibilityAwareSystem;
        visAware.events.on('aware_update', this.onVisibilityAwareUpdate, this);
    }

    private onPlayerVisibleCountersUpdate(t: PlayerVisibleComponent) {
        let newVisible = t._playerNightVisionCount > 0 ||
            ((this.ambientIlluminated || t._lightCount > 0 || t.isWall) && t._playerCount > 0);
        if (newVisible !== t.visible) {
            this.world.editComponent(t.entity, t.type, {
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
            let light = this.world.getComponent(e, LIGHT_TYPE) as LightComponent;
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
            let light = this.world.getComponent(e, LIGHT_TYPE) as LightComponent;
            if (light !== undefined) {
                playerVisible._lightCount -= 1;
            }
        }

        this.onPlayerVisibleCountersUpdate(playerVisible);
    }

    private onNightVisionUpdate(player: PlayerComponent) {
        let vis = this.world.getComponent(player.entity, VISIBILITY_TYPE) as VisibilityComponent;

        let diff = player.nightVision ? +1 : -1;

        let fun = (t: number) => {
            let playerVisible = this.visibleStorage.getComponent(t);
            if (playerVisible === undefined) return;
            playerVisible._playerNightVisionCount += diff;
            this.onPlayerVisibleCountersUpdate(playerVisible);
        };
        for (let t of vis._canSee) fun(t);
        if (vis._canSeeWalls) for (let t of vis._canSeeWalls) fun(t);
    }

    private createVisMeshFrom(pos: PIXI.IPointData, vis: VisibilityComponent): PIXI.Mesh {
        let mesh = PointLightRender.createMesh('const');
        PointLightRender.updateMeshPolygons(mesh, pos, vis.polygon!);
        let r = vis.range * 50;
        PointLightRender.updateMeshUniforms(mesh, pos, r*r, 0xFFFFFF);
        return mesh;
    }

    private spreadPlayerVisibility(player: number, pos: PIXI.IPointData, vis: VisibilityComponent, nightVision: boolean): void {
        if (this.world.getComponent(player, HOST_HIDDEN_TYPE)) return;// Ignore hidden players
        let playerVis = PointLightRender.createMesh('const');
        PointLightRender.updateMeshPolygons(playerVis, pos, vis.polygon!);
        let r = vis.range * 50;
        PointLightRender.updateMeshUniforms(playerVis, pos, r * r, 0xFFFFFF);

        let lightStorage = this.world.storages.get(LIGHT_TYPE) as SingleEcsStorage<LightComponent>;
        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        let playerData = {
            mesh: playerVis,
            vis,
            pos,
        } as VisibilitySpreadEntryData;


        let players = [];
        let nightVisPlayers = [];

        let lights = [];
        let aabb;
        if (!nightVision && this.lightSystem.lightSettings.needsLight) {
            players.push(playerData);

            aabb = undefined;
            for (let c of this.visibilitySystem.aabbTree.query(vis.aabb!)) {
                let visComponent = c.tag!;
                let lightComponent = lightStorage.getComponent(visComponent.entity);
                if (lightComponent === undefined || visComponent.range <= 0) continue;
                let pos = posStorage.getComponent(visComponent.entity)!;

                if (aabb === undefined) aabb = visComponent.aabb!.copy();
                else aabb.combine(visComponent.aabb!, aabb);

               let mesh = this.createVisMeshFrom(pos, visComponent);

                lights.push({
                    mesh,
                    pos,
                    vis: visComponent,
                } as VisibilitySpreadEntryData);
            }
            if (lights.length === 0) return;// no night vision AND no lights = can't see a thing!
            aabb!.intersect(vis.aabb!, aabb!);
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

        this.world.events.emit(EVENT_VISIBILITY_SPREAD, data);

        playerData.mesh.destroy(DESTROY_ALL);
        for (let light of data.lights) light.mesh.destroy(DESTROY_ALL);
    }

    private spreadLightVisibility(lightVis: VisibilityComponent): void {
        // Quite similar to spreadPlayerVisibility but follows a light instead of a player,
        // When a light visibility polygon is changed this will query each player in the polygon's reach and
        // spread the visibility (only with that light!)

        if (!this.lightSystem.lightSettings.needsLight) return;// Who needs lights?

        let visStorage = this.world.storages.get(VISIBILITY_TYPE) as SingleEcsStorage<VisibilityComponent>;
        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        let lightPos = posStorage.getComponent(lightVis.entity)!;
        let lightMesh = this.createVisMeshFrom(lightPos, lightVis);

        let lightData = [{
            mesh: lightMesh,
            pos: lightPos,
            vis: lightVis,
        } as VisibilitySpreadEntryData];

        let aabb = undefined;

        let players = [];
        for (let c of this.visibilitySystem.aabbTree.query(lightVis.aabb!)) {
            let visComponent = c.tag!;
            let player = this.storage.getComponent(visComponent.entity);
            if (player === undefined || visComponent.range <= 0 || player.nightVision) continue;

            if (aabb === undefined) aabb = visComponent.aabb!.copy();
            else aabb.combine(visComponent.aabb!, aabb);

            let vis = visStorage.getComponent(player.entity)!;
            let pos = posStorage.getComponent(player.entity)!;

            let mesh = this.createVisMeshFrom(pos, vis);

            players.push({
                mesh,
                pos,
                vis,
            } as VisibilitySpreadEntryData);
        }

        if (players.length === 0) return;

        aabb!.intersect(lightVis.aabb!, aabb!);

        let data = {
            aabb,
            lights: lightData,
            players,
            nightVisPlayers: [],
            nightVision: false,
        } as VisibilitySpreadData;

        this.world.events.emit(EVENT_VISIBILITY_SPREAD, data);
        lightData[0].mesh.destroy(DESTROY_ALL);
        for (let player of players) player.mesh.destroy(DESTROY_ALL);
    }

    private spreadAfterLightNotNeeded(): void {
        // Something changed, light is not needed anymore
        // this means that most of the things that were not visible anymore now are
        // but what? and where? this is the questions i will answer today
        let players = [];

        let visStorage = this.world.storages.get(VISIBILITY_TYPE) as SingleEcsStorage<VisibilityComponent>;
        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        let aabb = undefined;
        for (let player of this.storage.allComponents()) {
            if (player.nightVision) continue;

            let vis = visStorage.getComponent(player.entity)!;
            let pos = posStorage.getComponent(vis.entity)!;
            let mesh = this.createVisMeshFrom(pos, vis);

            if (aabb === undefined) aabb = vis.aabb!.copy();
            else aabb.combine(vis.aabb!, aabb);

            let data = {mesh, pos, vis} as VisibilitySpreadEntryData;
            players.push(data);
        }

        if (aabb === undefined) return;// Not enough players

        let data = {
            aabb,
            lights: [],
            players: [],
            nightVisPlayers: players,
            nightVision: false,
        } as VisibilitySpreadData;
        this.world.events.emit(EVENT_VISIBILITY_SPREAD, data);

        for (let x of players) x.mesh.destroy(DESTROY_ALL);
    }

    getSpreadDataForAabb(aabb: Aabb, cb: (data: VisibilitySpreadData) => void): void {
        let nightVisPlayers = [];
        let players = [];
        let lights = [];

        let lightsNeeded = this.lightSystem.lightSettings.needsLight;
        let lightStorage = this.world.storages.get(LIGHT_TYPE) as SingleEcsStorage<LightComponent>;
        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        for (let c of this.visibilitySystem.aabbTree.query(aabb)) {
            let vis = c.tag!;

            let player = this.storage.getComponent(vis.entity);
            if (player !== undefined) {
                let pos = posStorage.getComponent(vis.entity)!;
                let mesh = this.createVisMeshFrom(pos, vis);

                let data = {mesh, pos, vis} as VisibilitySpreadEntryData;
                if (player.nightVision || !lightsNeeded) nightVisPlayers.push(data);
                else players.push(data);

                continue;
            }
            if (lightsNeeded) {
                let light = lightStorage.getComponent(vis.entity);
                if (light !== undefined) {
                    let pos = posStorage.getComponent(vis.entity)!;
                    let mesh = this.createVisMeshFrom(pos, vis);
                    let data = {mesh, pos, vis} as VisibilitySpreadEntryData;
                    lights.push(data);
                }
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
        if (comp.type === PLAYER_TYPE) {
            let player = comp as PlayerComponent;
            let pv = this.visibleStorage.getComponent(comp.entity)!;
            if (pv === undefined) {
                console.error("Added player to pin without player visibility!");
                return;
            }
            pv._playerNightVisionCount++;// A bit hackish, but it works ;)
            this.onPlayerVisibleCountersUpdate(pv);

            let vis = this.world.getComponent(player.entity, VISIBILITY_TYPE) as VisibilityComponent;
            if (vis === undefined) {
                // We need a visibility component, create one if it does not already exist
                vis = {
                    type: VISIBILITY_TYPE,
                    range: player.range,
                    trackWalls: true,
                } as VisibilityComponent;
                this.world.addComponent(comp.entity, vis);
            }
        } else if (comp.type === PLAYER_VISIBLE_TYPE) {
            let c = comp as PlayerVisibleComponent;
            c._lightCount = 0;
            c._playerCount = 0;
            c._playerNightVisionCount = 0;
            this.world.addComponent(c.entity, newVisibilityAwareComponent(c.isWall === true));
        }
    }


    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === PLAYER_TYPE) {
            let c = comp as PlayerComponent

            if ('nightVision' in changed) {
                this.onNightVisionUpdate(c);
            }

            if ('range' in changed) {
                this.world.editComponent(c.entity, VISIBILITY_TYPE, {
                    range: c.range
                });
            } else {
                let vis = this.world.getComponent(c.entity, VISIBILITY_TYPE) as VisibilityComponent;
                if (vis.polygon !== undefined) {
                    let pos = this.world.getComponent(comp.entity, POSITION_TYPE) as PositionComponent;
                    this.spreadPlayerVisibility(comp.entity, pos, vis, c.nightVision);
                }
            }
        } else if (comp.type === VISIBILITY_TYPE) {
            let vis = comp as VisibilityComponent;
            if (!('polygon' in changed)) return;
            let player = this.storage.getComponent(vis.entity);
            if (player !== undefined) {
                if (vis.polygon !== undefined) {
                    let pos = this.world.getComponent(comp.entity, POSITION_TYPE) as PositionComponent;
                    this.spreadPlayerVisibility(comp.entity, pos, vis, player.nightVision);
                }
                return;
            }
            let light = this.world.getComponent(vis.entity, LIGHT_TYPE);
            if (light !== undefined) {
                this.spreadLightVisibility(vis);
            }
        }
    }

    private onComponentRemove(comp: Component): void {
        if (comp.type === PLAYER_TYPE) {
            let pv = this.visibleStorage.getComponent(comp.entity);
            if (pv === undefined) return;
            pv._playerNightVisionCount--;// Gotta undo those hacks
            this.onPlayerVisibleCountersUpdate(pv);
        }
    }

    private onResourceEdited(res: Resource, changes: any): void {
        if (res.type === LIGHT_SETTINGS_TYPE && 'needsLight' in changes) {
            let light = res as LightSettings;
            this.ambientIlluminated = !light.needsLight;
            for (let comp of this.visibleStorage.allComponents()) {
                this.onPlayerVisibleCountersUpdate(comp);
            }

            if (!light.needsLight) {
                this.spreadAfterLightNotNeeded();
            }
        }
    }

    // PUBLIC INTERFACE
    addPlayerVisListener(entity: number, isWall: boolean = false): PlayerVisibleComponent {
        let c = this.visibleStorage.getComponent(entity);
        if (c === undefined) {
            c = {
                type: PLAYER_VISIBLE_TYPE,
                entity,
                visible: false,
                isWall,
                _refCount: 1,
                _lightCount: 0,
                _playerCount: 0,
                _playerNightVisionCount: 0,
            } as PlayerVisibleComponent;
            this.world.addComponent(entity, c);
            return c;
        } else {
            c._refCount++;
        }
        return c;
    }

    removePlayerVisListener(entity: number): void {
        let c = this.visibleStorage.getComponent(entity);
        if (c === undefined) return;
        c._refCount--;
        if (c._refCount === 0) {
            this.world.removeComponent(c);
        }
    }


    enable(): void {
        PointLightRender.setup();
    }

    destroy(): void {
    }


}