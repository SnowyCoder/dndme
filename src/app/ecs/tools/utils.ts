import PIXI from "../../PIXI";
import {QueryHitEvent} from "../interaction";
import {World} from "../world";
import {PIXI_BOARD_TYPE, PixiBoardSystem} from "../systems/pixiBoardSystem";
import {INTERACTION_TYPE, InteractionSystem} from "../systems/interactionSystem";
import {WALL_TYPE, WallSystem} from "../systems/wallSystem";
import {ToolDriver} from "../systems/toolSystem";
import {MoveToolDriver} from "./common";

export function findEntitiesAt(world: World, point: PIXI.Point, multi: boolean): number[] {
    let event = QueryHitEvent.queryPoint(point, multi);

    world.events.emit('query_hit', event);
    return [...event.hits];
}



export function getBoardPosFromOrigin(world: World, event: PIXI.InteractionEvent, orig?: PIXI.Point): PIXI.Point {
    let board = world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
    return event.data.getLocalPosition(board.board, orig);
}

export function getMapPointFromMouseInteraction(world: World, event: PIXI.InteractionEvent, orig?: PIXI.Point): PIXI.Point {
    let point = getBoardPosFromOrigin(world, event, orig);

    const interSys = world.systems.get(INTERACTION_TYPE) as InteractionSystem;
    let nearest = interSys.snapDb.findNearest([point.x, point.y]);
    if (nearest !== undefined && nearest[1] < 100) {
        point.set(nearest[0][0], nearest[0][1]);
    } else {
        const wallSys = world.systems.get(WALL_TYPE) as WallSystem;
        let onWallLoc = wallSys?.findLocationOnWall(point, 50);
        if (onWallLoc !== undefined) {
            point.copyFrom(onWallLoc);
        }
    }
    return point;
}

export function createEmptyDriver(name: string): ToolDriver {
    return new EmptyToolDriver(name);
}

class EmptyToolDriver implements ToolDriver {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }
}
