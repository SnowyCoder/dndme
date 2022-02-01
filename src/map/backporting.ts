import { SHARED_TYPE } from "../ecs/component";
import { GRID_TYPE } from "../ecs/systems/gridSystem";
import { PIN_TYPE } from "../ecs/systems/pinSystem";
import { SerializedWorld } from "../ecs/world";
import { STANDARD_GRID_OPTIONS } from "../game/grid";
import { SerializedGameMap, GameMap } from "./gameMap";

export class IncompatibleVersionError extends Error {
    constructor() {
        super("Version not supported");
        this.name = "IncompatibleVersion";
    } 
}

function getResource<T>(world: SerializedWorld, name: string, def: T): T {
    if (world.resources === undefined) return def;
    if (!(name in world.resources)) return def;
    return world.resources[name];
}

function getOrCreateResource<T>(world: SerializedWorld, name: string, def: T): T {
    if (world.resources === undefined) {
        world.resources = {};
    }
    if (!(name in world.resources)) {
        world.resources[name] = def;
    }
    return world.resources[name];
}

export function rewriteCompatibility(data: SerializedGameMap) {
    switch (data['version']) {
    case '1.0':
        for (let id in data.levels) {
            const level = data.levels[id];
            if (level.ecs === undefined) continue;
            // Add share to all
            level.ecs.storages[SHARED_TYPE] = [...level.ecs.entities];
            // Adjust pin default size
            // old: 12px
            // new: 42px * (gridSize / stdGridSize)
            const gridResSize = getResource<any>(level.ecs, GRID_TYPE, {}).size ?? STANDARD_GRID_OPTIONS.size;
            const factor = (12 / 42) * (STANDARD_GRID_OPTIONS.size / gridResSize);
            console.log("Adjusting pin default size: " + factor);
            getOrCreateResource<any>(level.ecs, PIN_TYPE, {}).defaultSize = factor;
        }
    case GameMap.SER_VERSION:
        break;// Current version
    default:
        throw new IncompatibleVersionError();
    }
}

