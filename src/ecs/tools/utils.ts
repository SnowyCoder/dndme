import {QueryHitEvent} from "../interaction";
import {World} from "../world";
import {INTERACTION_TYPE, InteractionSystem} from "../systems/back/interactionSystem";
import {WALL_TYPE, WallSystem} from "../systems/wallSystem";
import { IPoint } from "@/geometry/point";
import { Point } from "pixi.js";

export function findEntitiesAt(world: World, point: Point, multi: boolean): number[] {
    let event = QueryHitEvent.queryPoint(point, multi);

    world.events.emit('query_hit', event);
    return event.getSorted();
}

export function snapPoint(world: World, p: IPoint, useWall: boolean = true): Point {
    const point = new Point(p.x, p.y);

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
