import {IPoint} from "../geometry/point";
import {Aabb} from "../geometry/aabb";
import { Point } from "@/pixi";

export type RPoint = [number, number];

export function polygonPointIntersect(point: IPoint, polygon: number[]): boolean {
    const x = point.x;
    const y = point.y;
    let inside = false;
    // use some raycasting to test hits
    // https://github.com/substack/point-in-polygon/blob/master/index.js
    const length = polygon.length / 2;
    for (let i = 0, j = length - 1; i < length; j = i++) {
        const xi = polygon[i * 2];
        const yi = polygon[(i * 2) + 1];
        const xj = polygon[j * 2];
        const yj = polygon[(j * 2) + 1];
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) {
            inside = !inside;
        }
    }
    return inside;
}

export function aabbAabbIntersect(al: number, at: number, ar: number, ab: number,
    bl: number, bt: number, br: number, bb: number): boolean {
    return al < br && ar > bl && at < bb && ab > bt;
}

export function distSquared2d(x1: number, y1: number, x2: number, y2: number): number {
    let x = x1 - x2;
    let y = y1 - y2;
    return x * x + y * y
}

export function projectPointOnLine(ax: number, ay: number, bx: number, by: number, px: number, py: number): RPoint {
    if (ax == bx && ay == ay) ax -= 0.00001;

    let u = ((px - ax) * (bx - ax)) + ((py - ay) * (by - ay));

    const udenom = Math.pow(bx - ax, 2) + Math.pow(by - ay, 2);

    u /= udenom;

    const rx = ax + (u * (bx - ax));
    const ry = ay + (u * (by - ay));

    return [rx, ry];
}

export function projectPointOnSegment(ax: number, ay: number, bx: number, by: number, px: number, py: number): RPoint | undefined {
    const [rx, ry] = projectPointOnLine(ax, ay, bx, by, px, py);

    const minx = Math.min(ax, bx);
    const maxx = Math.max(ax, bx);

    const miny = Math.min(ay, by);
    const maxy = Math.max(ay, by);

    const isValid = (rx >= minx && rx <= maxx) && (ry >= miny && ry <= maxy);

    return isValid ? [rx, ry] : undefined;
}

export function intersectLineVsLine(a1: IPoint, a2: IPoint, b1: IPoint, b2: IPoint, target?: Point): boolean {
    let dbx = b2.x - b1.x;
    let dby = b2.y - b1.y;
    let dax = a2.x - a1.x;
    let day = a2.y - a1.y;

    let u_b = dby * dax - dbx * day;
    if (u_b == 0) {
        return false;
    }
    let ua = (dbx * (a1.y - b1.y) - dby * (a1.x - b1.x)) / u_b;

    if (target !== undefined) {
        target.set(a1.x - ua * -dax, a1.y - ua * -day);
    }
    return true;
}

export function aabbSameOriginDifference(orig: IPoint, last: IPoint, now: IPoint, added: Aabb[], removed: Aabb[]): void {
    let xAct = 0;
    if (now.x != last.x) {
        let xBox = new Aabb(
            now.x, orig.y,
            last.x, last.y,
        );
        let add = (now.x > last.x) == (orig.x < now.x);
        if (add) {
            xAct = 1;
            added.push(xBox);
        } else {
            xAct = -1;
            removed.push(xBox);
        }
    }

    let yAct = 0;
    if (now.y != last.y) {
        let yBox = new Aabb(
            orig.x, last.y,
            last.x, now.y,
        );
        let add = (now.y > last.y) == (orig.y < last.y);
        if (add) {
            yAct = 1;
            added.push(yBox);
        } else {
            yAct = -1;
            removed.push(yBox);
        }
    }

    if (xAct == yAct) {
        let box = new Aabb(
            last.x, last.y,
            now.x, now.y
        );
        if (xAct > 0) {
            added.push(box);
        } else {
            removed.push(box);
        }
    }
}
