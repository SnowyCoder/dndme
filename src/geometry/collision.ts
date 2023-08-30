import {Aabb} from "./aabb";
import {IPoint} from "./point";
import {Line} from "./line";
import {EPSILON} from "./visibilityPolygon";
import {distSquared2d, polygonPointIntersect} from "../util/geometry";
import {Obb} from "./obb";
import { Point } from "pixi.js";


export function overlapAabbVsAabb(a: Aabb, b: Aabb): boolean {
    return a.minX <= b.maxX && a.maxX >= b.minX &&
           a.minY <= b.maxY && a.maxY >= b.minY;
}

export function containsAabbVsAabb(a: Aabb, b: Aabb): boolean {
    return a.minX <= b.minX && a.maxX >= b.maxX &&
           a.minY <= b.minY && a.maxY >= b.maxY;
}

export function overlapAabbVsPoint(a: Aabb, b: IPoint): boolean {
    return a.minX <= b.x && a.minY <= b.y &&
           a.maxX >= b.x && a.maxY >= b.y;
}

const INSIDE = 0;
const LEFT = 1;
const RIGHT = 2;
const BOTTOM = 4;
const TOP = 8;

function computeOutCode(box: Aabb, x: number, y: number): number {
    let code = INSIDE;

    if      (x < box.minX) code |= LEFT;
    else if (x > box.maxX) code |= RIGHT;

    if      (y < box.minY) code |= BOTTOM;
    else if (y > box.maxY) code |= TOP;

    return code;
}

export function overlapAabbVsLine(a: Aabb, b: Line): boolean {
    let fc = computeOutCode(a, b.fromX, b.fromY);
    let tc = computeOutCode(a, b.toX, b.toY);

    // Fast paths:
    // One of the points is inside
    if (fc === INSIDE || tc === INSIDE) return true;
    // bitwise AND is not 0: both points share an outside zone (LEFT, RIGHT, TOP,
    // or BOTTOM), so both must be outside window
    if ((fc & tc) !== 0) return false;
    // Both points are in directly opposite sites (left/right or top/bottom)
    if ((fc | tc) === (LEFT | RIGHT)) return true;
    if ((fc | tc) === (TOP | BOTTOM)) return true;

    return intersectSegmentVsSegment(new Line(a.minX, a.minY, a.minX, a.maxY), b) === SegmentVsSegmentRes.INTERN ||
           intersectSegmentVsSegment(new Line(a.minX, a.maxY, a.maxX, a.maxY), b) === SegmentVsSegmentRes.INTERN ||
           intersectSegmentVsSegment(new Line(a.maxX, a.maxY, a.maxX, a.minY), b) === SegmentVsSegmentRes.INTERN ||
           intersectSegmentVsSegment(new Line(a.maxX, a.minY, a.minX, a.minY), b) === SegmentVsSegmentRes.INTERN;
}

export function overlapPointVsCircle(point: IPoint, center: IPoint, radius: number): boolean {
    return distSquared2d(point.x, point.y, center.x, center.y) < radius * radius;
}

export function overlapCircleVsAabb(center: IPoint, radius: number, aabb: Aabb): boolean {
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

export function overlapCircleVsCircle(ac: IPoint, ar: number, bc: IPoint, br: number): boolean {
    let dx = ac.x - bc.x;
    let dy = ac.y - bc.y;
    let r = ar + br;

    return dx * dx + dy * dy <  r * r;
}

export function overlapCircleVsPolygon(ac: IPoint, ar: number, poly: number[]): boolean {
    if (polygonPointIntersect(ac, poly)) return true;

    let tmpLine = new Line(0, 0, 0, 0);

    for (let i = 2; i < poly.length; i += 2) {
        tmpLine.fromX = poly[i - 2];
        tmpLine.fromY = poly[i - 1];
        tmpLine.toX = poly[i];
        tmpLine.toY = poly[i + 1];

        if (overlapLineVsCircle(tmpLine, ac, ar)) return true;
    }

    return false;
}

export function overlapObbVsPolygon(obb: Obb, poly: number[]): boolean {
    let polyAabb = Aabb.zero();
    polyAabb.wrapPolygon(poly);
    // Fast path
    if (!overlapRotatedRectVsAabb(obb, polyAabb)) return false;

    for (let i = 0; i < 8; i += 2) {
        let p = {
            x: obb.rotVertex[i],
            y: obb.rotVertex[i + 1],
        };
        // If a point of the OBB is inside the polygon then we're done
        if (polygonPointIntersect(p, poly)) return true;
    }

    for (let i = 0; i < poly.length; i += 2) {
        let p = {
            x: poly[i],
            y: poly[i + 1],
        };

        // If a point of the polygon is inside the OBB then we're done
        if (overlapRotatedRectVsPoint(obb, p)) return true;
    }
    let obbLines = [
        [0, 2],
        [2, 4],
        [4, 6],
        [6, 0]
    ];

    // Check line intersections
    for (let line of obbLines) {
        let obbLine = new Line(
            obb.rotVertex[line[0]], obb.rotVertex[line[0] + 1],
            obb.rotVertex[line[1]], obb.rotVertex[line[1] + 1]
        )
        if (overlapLineVsPolygon(obbLine, poly)) return true;
    }

    return false;
}

export function overlapLineVsPolygon(line: Line, poly: number[]) {
    const totLines = poly.length - 2;
    for (let i = 0; i < totLines; i += 2) {
        const polLine = new Line(poly[i], poly[i+1], poly[i+2], poly[i+3]);
        if (intersectSegmentVsSegment(line, polLine) == SegmentVsSegmentRes.INTERN) return true;
    }
    const polLine = new Line(poly[0], poly[1], poly[poly.length-2], poly[poly.length-1]);
    return intersectSegmentVsSegment(line, polLine) == SegmentVsSegmentRes.INTERN || polygonPointIntersect({ x: line.fromX, y: line.fromY }, poly);
}

export function rotatePointByOrig(o: IPoint, rot: number, p: IPoint): IPoint {
    let s = Math.sin(rot);
    let c = Math.cos(rot);

    let transX = p.x - o.x;
    let transY = p.y - o.y;

    return {
        x: (transX * c - transY * s) + o.x,
        y: (transX * s + transY * c) + o.y
    };
}

export function overlapRotatedRectVsPoint(obb: Obb, p: IPoint) {
    let rotatedPoint = rotatePointByOrig(obb.unrotated.getCenter(), obb.rotation, p);

    return overlapAabbVsPoint(obb.unrotated, rotatedPoint);
}

export function overlapRotatedRectVsCircle(obb: Obb, pos: IPoint, rad: number) {
    let rotatedPoint = rotatePointByOrig(obb.unrotated.getCenter(), obb.rotation, pos);

    return overlapCircleVsAabb(rotatedPoint, rad, obb.unrotated);
}

export function overlapRotatedRectVsLine(obb: Obb, line: Line) {
    let center = obb.unrotated.getCenter();
    let rotFrom = rotatePointByOrig(center, obb.rotation, {x: line.fromX, y: line.fromY});
    let rotTo = rotatePointByOrig(center, obb.rotation, {x: line.toX, y: line.toY});

    return overlapAabbVsLine(obb.unrotated, new Line(rotFrom.x, rotFrom.y, rotTo.x, rotTo.y));
}

export function computeObbPoints(aabb: Aabb, rot: number, origin?: IPoint): number[] {
    let res = new Array<number>(8);

    let o = origin || {
        x: (aabb.minX + aabb.maxX) / 2,
        y: (aabb.minY + aabb.maxY) / 2,
    };

    for (let i = 0; i < 4; i++) {
        // Should be XY: 00, 01, 11, 10
        let minY = (i & 2) >>> 1;
        let minX = (i & 1) ^ minY;

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

export function overlapRotatedRectVsRotatedRect(obb1: Obb, obb2: Obb): boolean {
    let center = obb2.unrotated.getCenter();
    let res = obb2.unrotated.copy();
    res.translate(-center.x, -center.y, res);

    let obb3 = Obb.rotateAabb(res, obb2.rotation - obb1.rotation);
    return overlapRotatedRectVsAabb(obb3, obb1.unrotated);
}

export function overlapLineVsCircle(line: Line, point: IPoint, radius: number): boolean {
    // https://stackoverflow.com/questions/1073336/circle-line-segment-collision-detection-algorithm
    const dx = line.toX - line.fromX;
    const dy = line.toY - line.fromY;

    // vector from point to line start
    const fx = line.fromX - point.x;
    const fy = line.fromY - point.y;

    const a = dx * dx + dy * dy;// d . d
    const b = 2 * (fx * dx + fy * dy) // 2*f.d
    const c = fx * fx + fy * fy - radius * radius// f.f - r*r

    const discriminantSq = b*b - 4*a*c;
    if (discriminantSq < 0) return false;

    const discriminant = Math.sqrt(discriminantSq);

    const t1 = (-b - discriminant) / (2*a);
    const t2 = (-b + discriminant) / (2*a);

    if (t1 >= 0 && t2 <= 1) return true;
    if (t2 >= 0 && t1 <= 1) return true;

    return false;
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

export function triangleContainsPoint(p: IPoint, p0: IPoint, p1: IPoint, p2: IPoint) {
    let A = 1/2 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
    let sign = A < 0 ? -1 : 1;
    let s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * p.x + (p0.x - p2.x) * p.y) * sign;
    let t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * p.x + (p1.x - p0.x) * p.y) * sign;

    return s - EPSILON > 0 && t - EPSILON > 0 && (s + t) < 2 * A * sign - EPSILON;
}

export function lineSameSlope(ax: number, ay: number, bx: number, by: number): boolean {
    // We need to remove divisions, (this is not real code)
    // ay / ax == by / bx  ==> ay * bx == by * ax
    return Math.abs(ay * bx - by * ax) < EPSILON;
}
