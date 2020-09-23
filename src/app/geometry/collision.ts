import {Aabb} from "./aabb";
import {Point, StupidPoint} from "./point";
import {Line} from "./line";
import {EPSILON} from "./visibilityPolygon";
import {distSquared2d, polygonPointIntersect} from "../util/geometry";
import {Obb} from "./obb";


export function overlapAabbVsAabb(a: Aabb, b: Aabb): boolean {
    return a.minX <= b.maxX && a.maxX >= b.minX &&
           a.minY <= b.maxY && a.maxY >= b.minY;
}

export function containsAabbVsAabb(a: Aabb, b: Aabb): boolean {
    return a.minX <= b.minX && a.maxX >= b.maxX &&
           a.minY <= b.minY && a.maxY >= b.maxY;
}

export function overlapAabbVsPoint(a: Aabb, b: PIXI.IPointData): boolean {
    return a.minX <= b.x && a.minY <= b.y &&
           a.maxX >= b.x && a.maxY >= b.y;
}

export function overlapPointVsCircle(point: PIXI.IPointData, center: PIXI.IPointData, radius: number): boolean {
    return distSquared2d(point.x, point.y, center.x, center.y) < radius * radius;
}

export function overlapCircleVsAabb(center: PIXI.IPointData, radius: number, aabb: Aabb): boolean {
    let distX = Math.abs(center.x - (aabb.minX + aabb.maxX) / 2);
    let distY = Math.abs(center.y - (aabb.minY + aabb.maxY) / 2);

    let halfW = (aabb.maxX - aabb.minX) / 2;
    let halfH = (aabb.maxY - aabb.minY) / 2;

    if (distX > halfW + radius) return false;
    if (distY > halfH + radius) return false;

    if (distX < halfW || distY < halfH) return true;

    let dx = distX - halfW;
    let dy = distY - halfH;
    return dx * dx + dy * dy <= radius * radius;
}

export function overlapCircleVsCircle(ac: PIXI.IPointData, ar: number, bc: PIXI.IPointData, br: number): boolean {
    let dx = ac.x - bc.x;
    let dy = ac.y - bc.y;
    let r = ar + br;

    return dx * dx + dy * dy <  r * r;
}

export function overlapCircleVsPolygon(ac: PIXI.IPointData, ar: number, poly: number[]): boolean {
    if (polygonPointIntersect(ac, poly)) return true;

    let tmpLine = new Line(0, 0, 0, 0);
    let tmpPoint = new PIXI.Point();
    let r2 = ar * ar;

    for (let i = 2; i < poly.length; i += 2) {
        tmpLine.fromX = poly[i - 2];
        tmpLine.fromY = poly[i - 1];
        tmpLine.toX = poly[i];
        tmpLine.toY = poly[i + 1];

        tmpLine.projectPoint(ac, tmpPoint, true);
        if (distSquared2d(tmpPoint.x, tmpPoint.y, ac.x, ac.y) <= r2) {
            return true;
        }
    }

    return false;
}

export function rotatePointByOrig(o: PIXI.IPointData, rot: number, p: PIXI.IPointData): PIXI.Point {
    let s = Math.sin(-rot);
    let c = Math.cos(-rot);

    let transX = p.x - o.x;
    let transY = p.y - o.y;

    return new PIXI.Point(
        (transX * c - transY * s) + o.x,
        (transX * s + transY * c) + o.y
    );
}

export function overlapRotatedRectVsPoint(obb: Obb, p: PIXI.IPointData) {
    let rotatedPoint = rotatePointByOrig(obb.unrotated.getCenter(), obb.rotation, p);

    return overlapAabbVsPoint(obb.unrotated, rotatedPoint);
}

export function overlapRotatedRectVsCircle(obb: Obb, pos: PIXI.IPointData, rad: number) {
    let rotatedPoint = rotatePointByOrig(obb.unrotated.getCenter(), obb.rotation, pos);

    return overlapCircleVsAabb(rotatedPoint, rad, obb.unrotated);
}

export function computeObbPoints(aabb: Aabb, rot: number, origin?: PIXI.IPointData): number[] {
    let res = new Array<number>(8);

    let o = origin || {
        x: (aabb.minX + aabb.maxX) / 2,
        y: (aabb.minY + aabb.maxY) / 2,
    };

    for (let i = 0; i < 4; i++) {
        let minX = (i & 1);
        let minY = (i & 2) >>> 1;

        let p = rotatePointByOrig(o, rot, {
            x: minX ? aabb.minX : aabb.maxX,
            y: minY ? aabb.minY : aabb.maxY,
        });
        res[i * 2    ] = p.x;
        res[i * 2 + 1] = p.y;
    }

    return res;
}

export function overlapRotatedRectVsAabb(obb: Obb, aabb: Aabb): boolean {
    // Separating Axis Theorem
    let otherAabb = Aabb.zero();

    otherAabb.wrapPolygon(obb.rotVertex);
    if (overlapAabbVsAabb(aabb, otherAabb)) return true;

    // Apply the inverse transform of the obb to the aabb
    let originalInv = computeObbPoints(aabb, obb.rotation, obb.unrotated.getCenter());

    otherAabb.reset();
    otherAabb.wrapPolygon(originalInv);
    return overlapAabbVsAabb(obb.unrotated, otherAabb);
}

export function overlapLineVsCircle(line: Line, point: PIXI.IPointData, radius: number): boolean {
    let tmpPoint = new PIXI.Point();

    if (!line.projectPoint(point, tmpPoint, true)) {
        return false;
    }
    let dist = distSquared2d(tmpPoint.x, tmpPoint.y, point.x, point.y);
    return dist < radius * radius;
}

export enum SegmentVsSegmentRes {
    NONE, INTERN, EDGE_A, EDGE_B = 4,
}

export function intersectSegmentVsSegment(a: Line, b: Line, target?: Point): SegmentVsSegmentRes {
    let den = (b.toY - b.fromY) * (a.toX - a.fromX) -
              (b.toX - b.fromX) * (a.toY - a.fromY);

    if (den === 0) return SegmentVsSegmentRes.NONE; // Parallel (or coincident)

    const s = (
        (b.toX - b.fromX) * (a.fromY - b.fromY) -
        (b.toY - b.fromY) * (a.fromX - b.fromX)
    ) / den;

    if (s < -EPSILON || s > 1 + EPSILON) return SegmentVsSegmentRes.NONE;

    const u = (
        (a.toX - a.fromX) * (a.fromY - b.fromY) -
        (a.toY - a.fromY) * (a.fromX - b.fromX)
    ) / den;

    if (u < -EPSILON || u > 1 + EPSILON) return SegmentVsSegmentRes.NONE;

    if (target !== undefined) {
        target.set(
            a.fromX + s * (a.toX - a.fromX),
            a.fromY + s * (a.toY - a.fromY),
        );
    }

    let edge = 0;
    if (s < EPSILON || s > 1 - EPSILON) edge |= SegmentVsSegmentRes.EDGE_A;
    if (u < EPSILON || u > 1 - EPSILON) edge |= SegmentVsSegmentRes.EDGE_B;
    return edge === 0 ? SegmentVsSegmentRes.INTERN : edge;
}

export function triangleContainsPoint(p: StupidPoint, p0: StupidPoint, p1: StupidPoint, p2: StupidPoint) {
    let A = 1/2 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
    let sign = A < 0 ? -1 : 1;
    let s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
    let t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;

    return s - EPSILON > 0 && t - EPSILON > 0 && (s + t) < 2 * A * sign - EPSILON;
}

