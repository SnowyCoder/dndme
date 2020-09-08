import {Aabb} from "./aabb";
import {Point, StupidPoint} from "./point";
import {Line} from "./line";
import {EPSILON} from "./visibilityPolygon";


export function overlapAabbVsAabb(a: Aabb, b: Aabb): boolean {
    return a.minX <= b.maxX && a.maxX >= b.minX &&
           a.minY <= b.maxY && a.maxY >= b.minY;
}

export function containsAabbVsAabb(a: Aabb, b: Aabb): boolean {
    return a.minX <= b.minX && a.maxX >= b.maxX &&
           a.minY <= b.minY && a.maxY >= b.maxY;
}

export function overlapAabbVsPoint(a: Aabb, b: StupidPoint): boolean {
    return a.minX <= b.x && a.minY <= b.y &&
           a.maxX >= b.x && a.maxY >= b.y;
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

