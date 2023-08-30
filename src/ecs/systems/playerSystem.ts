import {System} from "../System";
import {World} from "../World";
import {MultiEcsStorage, SingleEcsStorage} from "../Storage";
import {Component, POSITION_TYPE, PositionComponent, SHARED_TYPE} from "../component";
import {VISIBILITY_TYPE, VisibilityComponent, VisibilitySystem, VISIBILITY_DETAILS_TYPE, VisibilityDetailsComponent, VisibilityRequester} from "./back/VisibilitySystem";
import {DESTROY_ALL} from "../../util/pixi";
import {
    newVisibilityAwareComponent,
    VISIBILITY_AWARE_TYPE,
    VisibilityAwareComponent,
    VisibilityAwareSystem
} from "./back/VisibilityAwareSystem";
import {LIGHT_SETTINGS_TYPE, LIGHT_TYPE, LightComponent, LightSettings} from "./lightSystem";
import {Aabb} from "../../geometry/aabb";
import {GridResource, Resource} from "../resource";
import {PIN_TYPE} from "./pinSystem";
import {GRID_TYPE} from "./gridSystem";
import {STANDARD_GRID_OPTIONS} from "../../game/grid";
import { IPoint } from "@/geometry/point";
import { ComponentInfoPanel, COMPONENT_INFO_PANEL_TYPE } from "./back/SelectionUiSystem";

import EcsPlayer from "@/ui/ecs/EcsPlayer.vue";
import { VisibilityPolygonElement } from "./back/pixi/visibility/VisibilityPolygonElement";

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
    aabb: Aabb,
    lights: VisibilityPolygonElement[];
    players: VisibilityPolygonElement[];
    nightVisPlayers: VisibilityPolygonElement[];
}

export const EVENT_VISIBILITY_SPREAD = 'visibility_spread';
export type EVENT_VISIBILITY_SPREAD = typeof EVENT_VISIBILITY_SPREAD;

export class PlayerSystem implements System {
    readonly name = PLAYER_TYPE;
    readonly dependencies = [PIN_TYPE, VISIBILITY_TYPE, VISIBILITY_AWARE_TYPE];
    readonly components?: [PlayerComponent, PlayerVisibleComponent];

    readonly world: World;

    storage = new SingleEcsStorage<PlayerComponent>(PLAYER_TYPE, true, true);
    visibleStorage = new SingleEcsStorage<PlayerVisibleComponent>(PLAYER_VISIBLE_TYPE, false, false);

    // If false a player can see a thing only if it's illuminated by artificial light
    ambientIlluminated: boolean = false;
    private readonly spreader: BitByBitSpreader;

    constructor(world: World) {
        this.world = world;

        this.spreader = new BitByBitSpreader(this);

        this.world.addStorage(this.storage);
        this.world.addStorage(this.visibleStorage);
        this.world.events.on('component_add', this.onComponentAdd, this);
        this.world.events.on('component_edited', this.onComponentEdited, this);
        this.world.events.on('component_remove', this.onComponentRemove, this);
        this.world.events.on('resource_edited', this.onResourceEdited, this);

        world.events.on('populate', () => {
            this.world.spawnEntity({
                type: COMPONENT_INFO_PANEL_TYPE,
                entity: -1,
                component: PLAYER_TYPE,
                name: 'Player',
                removable: true,
                panel: EcsPlayer,
                addEntry: {
                    whitelist: [PIN_TYPE],
                    blacklist: [PLAYER_TYPE],
                    component: (entity: number) => {
                        return [{
                            type: PLAYER_TYPE,
                            entity,
                            nightVision: false,
                            range: 50,
                        } as PlayerComponent];
                    },
                }
            } as ComponentInfoPanel);
        });

        let visAware = world.requireSystem(VISIBILITY_AWARE_TYPE);
        visAware.events.on('aware_update', this.onVisibilityAwareUpdate, this);
    }

    private onPlayerVisibleCountersUpdate(t: PlayerVisibleComponent) {
        // console.log(`${t.entity} ${t._lightCount} ${t._playerCount} ${t._playerNightVisionCount}`);
        if (t._playerCount < 0 || t._lightCount < 0) {
            console.error("Bug found, visibility counters are below 0");
        }
        let newVisible = t._playerNightVisionCount > 0 ||
            ((this.ambientIlluminated || t._lightCount > 0 || t.isWall) && t._playerCount > 0);
        if (this.world.isMaster && this.world.getComponent(t.entity, SHARED_TYPE) === undefined) {
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
            if (vis.requester === VisibilityRequester.PLAYER) {
                const player = this.storage.getComponent(entity);
                if (player === undefined) continue;
                playerVisible._playerCount += 1;
                if (player.nightVision) playerVisible._playerNightVisionCount += 1;
            } else if (vis.requester === VisibilityRequester.LIGHT) {
                const light = this.world.getComponent(entity, LIGHT_TYPE);
                if (light === undefined) continue;
                playerVisible._lightCount += 1;
            }
        }

        for (let [entity, multiId] of removed) {
            const vis = visSto.getComponent(entity, multiId);
            if (vis === undefined) continue;
            if (vis.requester === VisibilityRequester.PLAYER) {
                const player = this.storage.getComponent(entity);
                if (player === undefined) continue;
                playerVisible._playerCount -= 1;
                if (player.nightVision) playerVisible._playerNightVisionCount -= 1;
            } else if (vis.requester === VisibilityRequester.LIGHT) {
                const light = this.world.getComponent(entity, LIGHT_TYPE);
                if (light === undefined) continue;
                playerVisible._lightCount -= 1;
            }
        }

        this.onPlayerVisibleCountersUpdate(playerVisible);
    }

    private onNightVisionUpdate(player: PlayerComponent) {
        let visDet = this.world.getComponent(player.entity, VISIBILITY_DETAILS_TYPE);
        let visSto = this.world.getStorage(VISIBILITY_TYPE) as MultiEcsStorage<VisibilityComponent>;
        let mid = -1;
        for (let x of visSto.getComponents(player.entity)) {
            if (x.requester === VisibilityRequester.PLAYER) {
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
        if (visDet !== undefined) {
            for (let t in visDet._canSee) fun(Number(t), visDet._canSee[t]);
            if (visDet._canSeeWalls) for (let t in visDet._canSeeWalls) fun(Number(t), visDet._canSeeWalls[t]);
        }
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
                requester: VisibilityRequester.PLAYER,
            } as VisibilityComponent;
            this.world.addComponent(comp.entity, vis);
            player._visIndex = vis.multiId;
        } else if (comp.type === PLAYER_VISIBLE_TYPE) {
            let c = comp as PlayerVisibleComponent;
            c._lightCount = 0;
            c._playerCount = 0;
            c._playerNightVisionCount = 0;
            this.world.addComponent(c.entity, newVisibilityAwareComponent(c.isWall === true));
        } else if (comp.type === SHARED_TYPE) {
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
                let vis = this.world.getComponent(c.entity, VISIBILITY_DETAILS_TYPE)!;
                if (vis.polygon !== undefined) {
                    this.spreader.spreadPlayerVisibility(comp.entity);
                }
            }
        } else if (comp.type === VISIBILITY_DETAILS_TYPE) {
            let vis = comp as VisibilityDetailsComponent;
            if (!('polygon' in changed)) return;
            let player = this.storage.getComponent(vis.entity);
            if (player !== undefined) {
                if (vis.polygon !== undefined) {
                    this.spreader.spreadPlayerVisibility(comp.entity);
                }
            }
            let light = this.world.getComponent(vis.entity, LIGHT_TYPE);
            if (light !== undefined) {
                this.spreader.spreadLightVisibility(vis.entity);
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
        } else if (comp.type === SHARED_TYPE) {
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
                this.spreader.spreadAfterLightNotNeeded();
            }
        } else if (res.type === GRID_TYPE && 'size' in changed) {
            let grid = res as GridResource;
            this.spreader.gridSize = grid.size;
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

    getSpreadDataForAabb(aabb: Aabb, cb: (data: VisibilitySpreadData) => void): void {
        this.spreader.getSpreadDataForAabb(aabb, cb);
    }


    enable(): void {
    }

    destroy(): void {
    }
}

class BitByBitSpreader {
    private readonly world: World;

    private readonly visibilitySystem: VisibilitySystem;
    private readonly playerSys: PlayerSystem;
    gridSize: number;

    private playersToUpdate: number[] = [];
    private lightsToUpdate: number[] = [];

    constructor(playerSys: PlayerSystem) {
        this.world = playerSys.world;
        this.playerSys = playerSys;

        this.visibilitySystem = this.world.requireSystem(VISIBILITY_TYPE);
        this.gridSize = (this.world.getResource(GRID_TYPE) ?? STANDARD_GRID_OPTIONS).size;

        this.world.events.on('command_post_execute', () => {
            if (this.playersToUpdate.length + this.lightsToUpdate.length === 0) return;

            this.spreadVisibility(this.playersToUpdate, this.lightsToUpdate);
            this.playersToUpdate.length = 0;
            this.lightsToUpdate.length = 0;
        });
    }

    private createVisMeshFrom(pos: IPoint, polygon: number[], range: number): VisibilityPolygonElement {
        const elem = new VisibilityPolygonElement();
        elem.polygon = polygon;
        elem.position.set(pos.x, pos.y);
        elem.radius = range * this.gridSize;
        elem.program = 'const';
        return elem;
    }

    spreadPlayerVisibility(player: number): void {
        if (!this.world.getComponent(player, SHARED_TYPE)) return;// Ignore hidden players

        if (!this.playersToUpdate.includes(player)) {
            this.playersToUpdate.push(player);
        }
    }

    spreadLightVisibility(light: number): void {
        if (this.playerSys.ambientIlluminated) return;// Who needs lights?
        if (!this.world.getComponent(light, SHARED_TYPE)) return;// Ignore hidden lights

        if (!this.lightsToUpdate.includes(light)) {
            this.lightsToUpdate.push(light);
        }
    }

    private spreadVisibility(playerIds: number[], lightIds: number[]): void {
        const lightStorage = this.world.storages.get(LIGHT_TYPE) as SingleEcsStorage<LightComponent>;
        const playerStorage = this.world.storages.get(PLAYER_TYPE) as SingleEcsStorage<PlayerComponent>;
        const posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;
        const visDetStorage = this.world.storages.get(VISIBILITY_DETAILS_TYPE) as SingleEcsStorage<VisibilityDetailsComponent>;

        const usedPlayers = new Array<number>();
        const usedLights = new Array<number>();

        const addPlayer = (player: number, nightVis: boolean, visRes: VisibilityDetailsComponent) => {
            if (usedPlayers.includes(player)) return;
            const pos = posStorage.getComponent(player)!;
            const p = playerStorage.getComponent(player);

            if (p === undefined || visRes?.polygon === undefined) return;
            usedPlayers.push(player);

            const playerData = this.createVisMeshFrom(pos, visRes.polygon, p.range);
            if (nightVis || this.playerSys.ambientIlluminated) {
                nightVisPlayers.push(playerData);
            } else {
                players.push(playerData);
            }
        };
        const addLight = (light: number, visRes: VisibilityDetailsComponent) => {
            if (usedLights.includes(light)) return;
            const pos = posStorage.getComponent(light)!;
            const l = lightStorage.getComponent(light);

            if (l === undefined || visRes?.polygon === undefined) return;
            usedLights.push(light);

            const lightData = this.createVisMeshFrom(pos, visRes.polygon, l.range);
            lights.push(lightData);
        };

        const players = new Array<VisibilityPolygonElement>();
        const nightVisPlayers = new Array<VisibilityPolygonElement>();
        const lights = new Array<VisibilityPolygonElement>();

        let completeAabb: Aabb | undefined = undefined;

        for (let playerId of playerIds) {
            const player = playerStorage.getComponent(playerId);
            const visRes = visDetStorage.getComponent(playerId);

            if (player === undefined || visRes?.polygon === undefined) continue;

            let aabb: Aabb | undefined = undefined;
            if (!player.nightVision && !this.playerSys.ambientIlluminated) {

                for (let c of this.visibilitySystem.aabbTree.query(visRes.aabb!)) {
                    let visComponent = c.tag!;
                    let lightComponent = lightStorage.getComponent(visComponent.entity);
                    if (lightComponent === undefined || visComponent.range <= 0) continue;

                    addLight(visComponent.entity, visComponent);
                    if (aabb === undefined) aabb = visComponent.aabb!.copy();
                    else aabb.combine(visComponent.aabb!, aabb);
                }
                if (aabb === undefined) continue;// no night vision AND no lights = can't see a thing!
                aabb.intersect(visRes.aabb!, aabb);
            } else {
                aabb = visRes.aabb;
            }
            addPlayer(playerId, player.nightVision, visRes);
            if (completeAabb === undefined) completeAabb = aabb!;
            else completeAabb.combine(aabb!, completeAabb);
        }

        for (let lightId of lightIds) {
            const lightVisDet = visDetStorage.getComponent(lightId);
            if (lightVisDet?.polygon === undefined) continue;

            let aabb: Aabb | undefined = undefined;
            for (let c of this.visibilitySystem.aabbTree.query(lightVisDet.aabb!)) {
                let visComponent = c.tag!;
                let player = this.playerSys.storage.getComponent(visComponent.entity);
                if (player === undefined || visComponent.range <= 0 || player.nightVision) continue;

                addPlayer(player.entity, false, visComponent);

                if (aabb === undefined) aabb = visComponent.aabb!.copy();
                else aabb.combine(visComponent.aabb!, aabb);
            }
            if (aabb === undefined) continue;// If there's a light in the middle of the forest, but no-one can see it, does the light really shine?
            addLight(lightId, lightVisDet);

            aabb.intersect(lightVisDet.aabb!, aabb);

            if (completeAabb === undefined) completeAabb = aabb!;
            else completeAabb.combine(aabb!, completeAabb);
        }

        if (completeAabb === undefined) return;

        usedLights.length = 0;
        usedPlayers.length = 0;

        let data = {
            aabb: completeAabb,
            lights,
            players,
            nightVisPlayers,
        } as VisibilitySpreadData;

        this.world.events.emit(EVENT_VISIBILITY_SPREAD, data);

        for (let player of data.players) player.destroy(DESTROY_ALL);
        for (let light of data.lights) light.destroy(DESTROY_ALL);
    }

    spreadAfterLightNotNeeded(): void {
        // Something changed, light is not needed anymore
        // this means that most of the things that were not visible anymore now are
        // but what? and where? this is the questions i will answer today
        let players = [];

        let visStorage = this.world.storages.get(VISIBILITY_DETAILS_TYPE) as SingleEcsStorage<VisibilityDetailsComponent>;
        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        let aabb = undefined;
        for (let player of this.playerSys.storage.allComponents()) {
            if (player.nightVision) continue;

            let vis = visStorage.getComponent(player.entity)!;
            let pos = posStorage.getComponent(vis.entity)!;
            let mesh = this.createVisMeshFrom(pos, vis.polygon!, player.range);

            if (aabb === undefined) aabb = vis.aabb!.copy();
            else aabb.combine(vis.aabb!, aabb);

            players.push(mesh);
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

        for (let x of players) x.destroy(DESTROY_ALL);
    }

    getSpreadDataForAabb(aabb: Aabb, cb: (data: VisibilitySpreadData) => void): void {
        let nightVisPlayers = [];
        let players = [];
        let lights = [];

        let lightsNeeded = !this.playerSys.ambientIlluminated;
        let lightStorage = this.world.storages.get(LIGHT_TYPE) as SingleEcsStorage<LightComponent>;
        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        for (let c of this.visibilitySystem.aabbTree.query(aabb)) {
            let vis = c.tag!;

            let player = this.playerSys.storage.getComponent(vis.entity);
            if (player !== undefined) {
                let pos = posStorage.getComponent(vis.entity)!;
                let mesh = this.createVisMeshFrom(pos, vis.polygon!, player.range);

                if (player.nightVision || !lightsNeeded) nightVisPlayers.push(mesh);
                else players.push(mesh);

                continue;
            }
            if (lightsNeeded) {
                let light = lightStorage.getComponent(vis.entity);
                if (light !== undefined) {
                    let pos = posStorage.getComponent(vis.entity)!;
                    let mesh = this.createVisMeshFrom(pos, vis.polygon!, light.range);
                    lights.push(mesh);
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

        for (let x of lights) x.destroy(DESTROY_ALL);
        for (let x of players) x.destroy(DESTROY_ALL);
        for (let x of nightVisPlayers) x.destroy(DESTROY_ALL);
    }
}
