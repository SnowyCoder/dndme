import * as PIXI from "pixi.js";

export type Point = [number, number];

export function polygonPointIntersect(point: PIXI.Point, polygon: number[]): boolean {
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
        const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * ((y - yi) / (yj - yi))) + xi);
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

export function projectPointOnLine(ax: number, ay: number, bx: number, by: number, px: number, py: number): Point | undefined {
    if (ax == bx && ay == ay) ax -= 0.00001;

    let u = ((px - ax) * (bx - ax)) + ((py - ay) * (by - ay));

    let udenom = Math.pow(bx - ax, 2) + Math.pow(by - ay, 2);

    u /= udenom;

    let rx = ax + (u * (bx - ax));
    let ry = ay + (u * (by - ay));

    let minx, maxx, miny, maxy;

    minx = Math.min(ax, bx);
    maxx = Math.max(ax, bx);

    miny = Math.min(ay, by);
    maxy = Math.max(ay, by);

    let isValid = (rx >= minx && rx <= maxx) && (ry >= miny && ry <= maxy);

    return isValid ? [rx, ry] : undefined;
}

