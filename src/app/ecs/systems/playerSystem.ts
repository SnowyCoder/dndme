import {System} from "../system";
import {World} from "../world";
import {MultiEcsStorage, SingleEcsStorage} from "../storage";
import {Component, HOST_HIDDEN_TYPE, POSITION_TYPE, PositionComponent} from "../component";
import {VISIBILITY_TYPE, VisibilityComponent, VisibilitySystem, VISIBILITY_DETAILS_TYPE, VisibilityDetailsComponent} from "./back/visibilitySystem";
import * as PointLightRender from "../../game/pointLightRenderer";
import {DESTROY_ALL} from "../../util/pixi";
import {
    newVisibilityAwareComponent,
    VISIBILITY_AWARE_TYPE,
    VisibilityAwareComponent,
    VisibilityAwareSystem
} from "./back/visibilityAwareSystem";
import {LIGHT_SETTINGS_TYPE, LIGHT_TYPE, LightComponent, LightSettings, LightSystem, LOCAL_LIGHT_SETTINGS_TYPE, LocalLightSettings} from "./lightSystem";
import {Aabb} from "../../geometry/aabb";
import PIXI from "../../PIXI";
import {GridResource, Resource} from "../resource";
import {PIN_TYPE} from "./pinSystem";
import {GRID_TYPE} from "./gridSystem";
import {STANDARD_GRID_OPTIONS} from "../../game/grid";

export const PLAYER_TYPE = 'player';
export type PLAYER_TYPE = typeof PLAYER_TYPE;
export interface PlayerComponent extends Component {
    type: PLAYER_TYPE;
    nightVision: boolean;
    range: number;
    _visIndex: number;
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
    vis: VisibilityDetailsComponent,
}

export const EVENT_VISIBILITY_SPREAD = 'visibility_spread';
export type EVENT_VISIBILITY_SPREAD = typeof EVENT_VISIBILITY_SPREAD;

export class PlayerSystem implements System {
    readonly name = PLAYER_TYPE;
    readonly dependencies = [PIN_TYPE, VISIBILITY_TYPE, VISIBILITY_AWARE_TYPE];

    readonly world: World;

    private readonly lightSystem: LightSystem;
    private readonly visibilitySystem: VisibilitySystem;

    storage = new SingleEcsStorage<PlayerComponent>(PLAYER_TYPE, true, true);
    visibleStorage = new SingleEcsStorage<PlayerVisibleComponent>(PLAYER_VISIBLE_TYPE, false, false);

    private gridSize: number;

    // If false a player can see a thing only if it's illuminated by artificial light
    ambientIlluminated: boolean = false;

    constructor(world: World) {
        this.world = world;

        this.lightSystem = world.systems.get(LIGHT_TYPE) as LightSystem;
        this.visibilitySystem = world.systems.get(VISIBILITY_TYPE) as VisibilitySystem;

        this.gridSize = (this.world.getResource(GRID_TYPE) as GridResource ?? STANDARD_GRID_OPTIONS).size;

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
        //console.log(`${t.entity} ${t._lightCount} ${t._playerCount} ${t._playerNightVisionCount}`);
        if (t._playerCount < 0 || t._lightCount < 0) {
            console.error("Buf found, visibility counters are below 0");
        }
        let newVisible = t._playerNightVisionCount > 0 ||
            ((this.ambientIlluminated || t._lightCount > 0 || t.isWall) && t._playerCount > 0);
        if (this.world.isMaster && this.world.getComponent(t.entity, HOST_HIDDEN_TYPE) !== undefined) {
            newVisible = false;
        }
        if (newVisible !== t.visible) {
            this.world.editComponent(t.entity, t.type, {
                visible: newVisible,
            });
        }
    }

    private onVisibilityAwareUpdate(target: VisibilityAwareComponent, added: [number, number][], removed: [number, number][]): void {
        let playerVisible = this.visibleStorage.getComponent(target.entity);
        if (playerVisible === undefined) return;

        const visSto = this.world.getStorage(VISIBILITY_TYPE) as MultiEcsStorage<VisibilityComponent>;

        for (let [entity, multiId] of added) {
            const vis = visSto.getComponent(entity, multiId);
            if (vis === undefined) continue;
            if (vis.requester === PLAYER_TYPE) {
                const player = this.storage.getComponent(entity);
                if (player === undefined) continue;
                playerVisible._playerCount += 1;
                if (player.nightVision) playerVisible._playerNightVisionCount += 1;
            } else if (vis.requester === LIGHT_TYPE) {
                const light = this.world.getComponent(entity, LIGHT_TYPE) as LightComponent;
                if (light === undefined) continue;
                playerVisible._lightCount += 1;
            }
        }

        for (let [entity, multiId] of removed) {
            const vis = visSto.getComponent(entity, multiId);
            if (vis === undefined) continue;
            if (vis.requester === PLAYER_TYPE) {
                const player = this.storage.getComponent(entity);
                if (player === undefined) continue;
                playerVisible._playerCount -= 1;
                if (player.nightVision) playerVisible._playerNightVisionCount -= 1;
            } else if (vis.requester === LIGHT_TYPE) {
                const light = this.world.getComponent(entity, LIGHT_TYPE) as LightComponent;
                if (light === undefined) continue;
                playerVisible._lightCount -= 1;
            }
        }

        this.onPlayerVisibleCountersUpdate(playerVisible);
    }

    private onNightVisionUpdate(player: PlayerComponent) {
        let visDet = this.world.getComponent(player.entity, VISIBILITY_DETAILS_TYPE) as VisibilityDetailsComponent;
        let visSto = this.world.getStorage(VISIBILITY_TYPE) as MultiEcsStorage<VisibilityComponent>;
        let mid = -1;
        for (let x of visSto.getComponents(player.entity)) {
            if (x.requester === PLAYER_TYPE) {
                mid = x.multiId;
                break;
            }
        }
        if (mid === -1) {
            console.error("Player does not have visibility");
            return;
        }

        let diff = player.nightVision ? +1 : -1;

        let fun = (id: number, t: number[]) => {
            if (!t.includes(mid)) return;
            let playerVisible = this.visibleStorage.getComponent(id);
            if (playerVisible === undefined) return;
            playerVisible._playerNightVisionCount += diff;
            this.onPlayerVisibleCountersUpdate(playerVisible);
        };
        for (let t in visDet._canSee) fun(Number(t), visDet._canSee[t]);
        if (visDet._canSeeWalls) for (let t in visDet._canSeeWalls) fun(Number(t), visDet._canSeeWalls[t]);
    }

    private createVisMeshFrom(pos: PIXI.IPointData, vis: VisibilityDetailsComponent, range: number): PIXI.Mesh {
        let mesh = PointLightRender.createMesh('const');
        PointLightRender.updateMeshPolygons(mesh, pos, vis.polygon!);
        let r = range * this.gridSize;
        PointLightRender.updateMeshUniforms(mesh, pos, r*r, 0xFFFFFF);
        return mesh;
    }

    private spreadPlayerVisibility(player: number, nightVision: boolean): void {
        if (this.world.getComponent(player, HOST_HIDDEN_TYPE)) return;// Ignore hidden players

        let lightStorage = this.world.storages.get(LIGHT_TYPE) as SingleEcsStorage<LightComponent>;
        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        let pos = posStorage.getComponent(player)!;
        let vis = this.world.getComponent(player, VISIBILITY_TYPE) as VisibilityComponent;
        let visRes = this.world.getComponent(player, VISIBILITY_DETAILS_TYPE) as VisibilityDetailsComponent;

        let playerVis = PointLightRender.createMesh('const');
        PointLightRender.updateMeshPolygons(playerVis, pos, visRes.polygon!);
        let r = vis.range * this.gridSize;
        PointLightRender.updateMeshUniforms(playerVis, pos, r * r, 0xFFFFFF);


        let playerData = {
            mesh: playerVis,
            vis: visRes,
            pos,
        } as VisibilitySpreadEntryData;


        let players = [];
        let nightVisPlayers = [];

        let lights = [];
        let aabb;
        if (!nightVision && !this.ambientIlluminated) {
            players.push(playerData);

            aabb = undefined;
            for (let c of this.visibilitySystem.aabbTree.query(visRes.aabb!)) {
                let visComponent = c.tag!;
                let lightComponent = lightStorage.getComponent(visComponent.entity);
                if (lightComponent === undefined || visComponent.range <= 0) continue;
                let pos = posStorage.getComponent(visComponent.entity)!;

                if (aabb === undefined) aabb = visComponent.aabb!.copy();
                else aabb.combine(visComponent.aabb!, aabb);

               let mesh = this.createVisMeshFrom(pos, visComponent, lightComponent.range);

                lights.push({
                    mesh,
                    pos,
                    vis: visComponent,
                } as VisibilitySpreadEntryData);
            }
            if (lights.length === 0) return;// no night vision AND no lights = can't see a thing!
            aabb!.intersect(visRes.aabb!, aabb!);
        } else {
            nightVisPlayers.push(playerData)
            aabb = visRes.aabb;
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

    private spreadLightVisibility(lightEntity: number): void {
        // Quite similar to spreadPlayerVisibility but follows a light instead of a player,
        // When a light visibility polygon is changed this will query each player in the polygon's reach and
        // spread the visibility (only with that light!)

        if (this.ambientIlluminated) return;// Who needs lights?


        let visDetStorage = this.world.storages.get(VISIBILITY_DETAILS_TYPE) as SingleEcsStorage<VisibilityDetailsComponent>;
        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        let lightVis = this.world.getComponent(lightEntity, VISIBILITY_TYPE) as VisibilityComponent;
        let lightPos = posStorage.getComponent(lightEntity)!;
        let lightVisDet = visDetStorage.getComponent(lightEntity)!;
        let lightMesh = this.createVisMeshFrom(lightPos, lightVisDet, lightVis.range);


        let lightData = [{
            mesh: lightMesh,
            pos: lightPos,
            vis: lightVisDet,
        } as VisibilitySpreadEntryData];

        let aabb = undefined;

        let players = [];
        for (let c of this.visibilitySystem.aabbTree.query(lightVisDet.aabb!)) {
            let visComponent = c.tag!;
            let player = this.storage.getComponent(visComponent.entity);
            if (player === undefined || visComponent.range <= 0 || player.nightVision) continue;

            if (aabb === undefined) aabb = visComponent.aabb!.copy();
            else aabb.combine(visComponent.aabb!, aabb);

            let vis = visDetStorage.getComponent(player.entity)!;
            let pos = posStorage.getComponent(player.entity)!;

            let mesh = this.createVisMeshFrom(pos, vis, player.range);

            players.push({
                mesh,
                pos,
                vis,
            } as VisibilitySpreadEntryData);
        }

        if (players.length === 0) return;

        aabb!.intersect(lightVisDet.aabb!, aabb!);

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

        let visStorage = this.world.storages.get(VISIBILITY_DETAILS_TYPE) as SingleEcsStorage<VisibilityDetailsComponent>;
        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        let aabb = undefined;
        for (let player of this.storage.allComponents()) {
            if (player.nightVision) continue;

            let vis = visStorage.getComponent(player.entity)!;
            let pos = posStorage.getComponent(vis.entity)!;
            let mesh = this.createVisMeshFrom(pos, vis, player.range);

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

        let lightsNeeded = !this.ambientIlluminated;
        let lightStorage = this.world.storages.get(LIGHT_TYPE) as SingleEcsStorage<LightComponent>;
        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        for (let c of this.visibilitySystem.aabbTree.query(aabb)) {
            let vis = c.tag!;

            let player = this.storage.getComponent(vis.entity);
            if (player !== undefined) {
                let pos = posStorage.getComponent(vis.entity)!;
                let mesh = this.createVisMeshFrom(pos, vis, player.range);

                let data = {mesh, pos, vis} as VisibilitySpreadEntryData;
                if (player.nightVision || !lightsNeeded) nightVisPlayers.push(data);
                else players.push(data);

                continue;
            }
            if (lightsNeeded) {
                let light = lightStorage.getComponent(vis.entity);
                if (light !== undefined) {
                    let pos = posStorage.getComponent(vis.entity)!;
                    let mesh = this.createVisMeshFrom(pos, vis, light.range);
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
            let pv = this.visibleStorage.getComponent(comp.entity);
            if (pv === undefined) {
                console.error("Added player to pin without player visibility! " + comp.entity);
                return;
            }
            // What's going on here? We add a "night vision" count to the player itself so there's always someone watching it.
            // this means that the pin of the player is always visible no matter what
            pv._playerNightVisionCount++;// A bit hackish, but it works ;)
            this.onPlayerVisibleCountersUpdate(pv);

            // We need a visibility component, create one if it does not already exist
            let vis = {
                type: VISIBILITY_TYPE,
                range: player.range,
                trackWalls: true,
                requester: PLAYER_TYPE,
            } as VisibilityComponent;
            this.world.addComponent(comp.entity, vis);
            player._visIndex = vis.multiId;
        } else if (comp.type === PLAYER_VISIBLE_TYPE) {
            let c = comp as PlayerVisibleComponent;
            c._lightCount = 0;
            c._playerCount = 0;
            c._playerNightVisionCount = 0;
            this.world.addComponent(c.entity, newVisibilityAwareComponent(c.isWall === true));
        } else if (comp.type === HOST_HIDDEN_TYPE) {
            let pv = this.visibleStorage.getComponent(comp.entity);
            if (pv !== undefined) {
                this.onPlayerVisibleCountersUpdate(pv);
            }
        }
    }


    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === PLAYER_TYPE) {
            let c = comp as PlayerComponent;

            if ('nightVision' in changed) {
                this.onNightVisionUpdate(c);
            }

            if ('range' in changed) {
                this.world.editComponent(c.entity, VISIBILITY_TYPE, {
                    range: c.range
                }, c._visIndex);
            } else {
                let vis = this.world.getComponent(c.entity, VISIBILITY_DETAILS_TYPE) as VisibilityDetailsComponent;
                if (vis.polygon !== undefined) {
                    this.spreadPlayerVisibility(comp.entity, c.nightVision);
                }
            }
        } else if (comp.type === VISIBILITY_DETAILS_TYPE) {
            let vis = comp as VisibilityDetailsComponent;
            if (!('polygon' in changed)) return;
            let player = this.storage.getComponent(vis.entity);
            if (player !== undefined) {
                if (vis.polygon !== undefined) {
                    let pos = this.world.getComponent(comp.entity, POSITION_TYPE) as PositionComponent;
                    this.spreadPlayerVisibility(comp.entity, player.nightVision);
                }
                return;
            }
            let light = this.world.getComponent(vis.entity, LIGHT_TYPE);
            if (light !== undefined) {
                this.spreadLightVisibility(vis.entity);
            }
        }
    }

    private onComponentRemove(comp: Component): void {
        if (comp.type === PLAYER_TYPE) {
            let p = comp as PlayerComponent;
            let vis = this.world.getComponent(comp.entity, VISIBILITY_TYPE, p._visIndex);
            if (vis !== undefined) {
                this.world.removeComponent(vis);
            } else {
                console.warn("No player visibility found on removal");
            }
            let pv = this.visibleStorage.getComponent(comp.entity);
            if (pv === undefined) return;
            pv._playerNightVisionCount--;// Gotta undo those hacks
            this.onPlayerVisibleCountersUpdate(pv);
        } else if (comp.type === HOST_HIDDEN_TYPE) {
            let pv = this.visibleStorage.getComponent(comp.entity);
            if (pv !== undefined) {
                this.onPlayerVisibleCountersUpdate(pv);
            }
        } else if (comp.type === PLAYER_VISIBLE_TYPE) {
            const visAware = this.world.getComponent(comp.entity, VISIBILITY_AWARE_TYPE,);
            if (visAware !== undefined) this.world.removeComponent(visAware);
        }
    }

    private onResourceEdited(res: Resource, changed: any): void {
        if (res.type === LIGHT_SETTINGS_TYPE && 'needsLight' in changed) {
            let light = res as LightSettings;
            this.ambientIlluminated = !light.needsLight;
            for (let comp of this.visibleStorage.allComponents()) {
                this.onPlayerVisibleCountersUpdate(comp);
            }

            if (!light.needsLight) {
                this.spreadAfterLightNotNeeded();
            }
        } else if (res.type === GRID_TYPE && 'size' in changed) {
            let grid = res as GridResource;
            this.gridSize = grid.size;
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
