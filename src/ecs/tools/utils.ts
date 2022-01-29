import PIXI from "../../PIXI";
import {QueryHitEvent} from "../interaction";
import {World} from "../world";
import {PIXI_BOARD_TYPE, PixiBoardSystem} from "../systems/back/pixiBoardSystem";
import {INTERACTION_TYPE, InteractionSystem} from "../systems/back/interactionSystem";
import {WALL_TYPE, WallSystem} from "../systems/wallSystem";
import { IPoint } from "@/geometry/point";

export function findEntitiesAt(world: World, point: PIXI.Point, multi: boolean): number[] {
    let event = QueryHitEvent.queryPoint(point, multi);

    world.events.emit('query_hit', event);
    return event.getSorted();
}

export function getBoardPosFromOrigin(world: World, event: PIXI.InteractionEvent, orig?: PIXI.Point): PIXI.Point {
    let board = world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
    return event.data.getLocalPosition(board.board, orig);
}

export function getMapPointFromMouseInteraction(world: World, event: PIXI.InteractionEvent, orig?: PIXI.Point): PIXI.Point {
    let point = getBoardPosFromOrigin(world, event, orig);

    return snapPoint(world, point);
}

export function snapPoint(world: World, p: IPoint, useWall: boolean = true): PIXI.Point {
    const point = new PIXI.Point(p.x, p.y);

    const interSys = world.systems.get(INTERACTION_TYPE) as InteractionSystem;
    let nearest = interSys.snapDb.findNearest([point.x, point.y]);
    if (nearest !== undefined && nearest[1] < 100) {
        point.set(nearest[0][0], nearest[0][1]);
    } else if (useWall) {
        const wallSys = world.systems.get(WALL_TYPE) as WallSystem;
        let onWallLoc = wallSys?.findLocationOnWall(point, 50);
        if (onWallLoc !== undefined) {
            point.copyFrom(onWallLoc);
        }
    }
    return point;
}
