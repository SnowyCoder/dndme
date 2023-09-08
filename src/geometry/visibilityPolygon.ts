import {IPoint} from "./point";
import {Line} from "./line";
import {intersectSegmentVsSegment, SegmentVsSegmentRes, triangleContainsPoint} from "./collision";
import {distSquared2d, intersectLineVsLine} from "../util/geometry";
import {BinaryHeap} from "../util/binaryHeap";
import {Aabb} from "./aabb";
import { Point } from "@/pixi";

export const EPSILON = 0.0000001;

class EndPoint extends Point {
    angle: number = 0;
    dist: number = 0;
    segment?: Segment;
}

class Segment {
    from: EndPoint;
    to: EndPoint;
    used: boolean;

    constructor(f: EndPoint, t: EndPoint) {
        this.from = f;
        this.to = t;
        this.used = false;
    }
}

// a < b
function segmentLt(a: Segment, b: Segment, o: IPoint): boolean {
    // *opens philosophy book*
    // But what does it mean for a segment to be less than another one? (relative to a point)
    // There are multiple algorithms for this, the one that makes most sense to me is what I call the
    // triangular intersection:
    // Given two segments a, b and a point o we define a < b == true only if there is at least one point in b that
    // is hidden by a.
    // For every segment then the property a < b => !(b < a) is maintained only if the segments do not intersect
    // (as the only way that two lines would hide each other is if they meet in a point).
    // On another note, the property a < b, b < c => a < c is not maintained!
    // How can this be computed, then?

    // a.from is inside the triangle formed by b and o, this means:
    // - a.to is also inside, then a < b
    // - a.to is outside, then a < b
    if (triangleContainsPoint(a.from, b.from, b.to, o)) return true;
    if (triangleContainsPoint(a.to, b.from, b.to, o)) return true;

    // If we arrive here we can be sure that neither points of a is inside the triangle,
    // A segment with both points outside of the triangle can intersect it only by intersecting two of the three
    // lines. We already assume that a and b cannot intersect so we can check either (b.from, o) or (b.to, o) and see
    // if it intersects with a

    let c1 = intersectSegmentVsSegment(
        new Line(b.from.x, b.from.y, o.x, o.y),
        new Line(a.from.x, a.from.y, a.to.x, a.to.y)
    );
    if (c1 === SegmentVsSegmentRes.INTERN) return true;

    let c2 = intersectSegmentVsSegment(
        new Line(b.to.x, b.to.y, o.x, o.y),
        new Line(a.from.x, a.from.y, a.to.x, a.to.y)
    );
    if (c2 === SegmentVsSegmentRes.INTERN) return true;


    // Edge case: one of the end points of the second line (the segment a) lies
    // in the line (b.from, o), this might mean two things:
    // 1: the line shares a point but does not block the second segment's view
    // 2: the line shares a point and the other point blocks the whole view (hitting the other triangle line)
    // we want to check the second case, so let's try the second segment intersect
    if ((c1 & SegmentVsSegmentRes.EDGE_B) !== 0 && c2 !== SegmentVsSegmentRes.NONE) {
        return true;
    }
    if ((c2 & SegmentVsSegmentRes.EDGE_B) !== 0 && c1 !== SegmentVsSegmentRes.NONE) {
        return true;
    }

    // Edge case n.2 (I'm kinda hating on grids)
    // The segment a could lay a point on the line between (b.from/to, o) and the other in b
    // Edge case of the edge case: If the segment is in any of the endpoints of b then it does not occlude the view
    if (((c1 | c2) & (SegmentVsSegmentRes.EDGE_B | SegmentVsSegmentRes.EDGE_A)) === SegmentVsSegmentRes.EDGE_B) {
        let c3 = intersectSegmentVsSegment(
            new Line(b.from.x, b.from.y, b.to.x, b.to.y),
            new Line(a.from.x, a.from.y, a.to.x, a.to.y)
        );
        if (c3 !== SegmentVsSegmentRes.NONE) return true;
    }

    // This means a >= b
    return false;
}

function initSegment(x1: number, y1: number, x2: number, y2: number, pos: IPoint): Segment {
    let a = new EndPoint(x1, y1);
    let b = new EndPoint(x2, y2);

    a.angle = Math.atan2(pos.y - a.y, pos.x - a.x);
    b.angle = Math.atan2(pos.y - b.y, pos.x - b.x);
    a.dist = distSquared2d(pos.x, pos.y, a.x, a.y);
    b.dist = distSquared2d(pos.x, pos.y, b.x, b.y);

    let s = new Segment(a, b);
    a.segment = s;
    b.segment = s;

    return s;
}

function compute0(pos: IPoint, segments: Segment[]): Array<number> {
    let points = new Array<EndPoint>();
    for (let s of segments) {
        points.push(s.from, s.to);
    }

    // O(Nlog(N))
    points.sort((a, b) => {
        return a.angle - b.angle;
    });

    let segmentPriorityQueue = new BinaryHeap<Segment>((a, b) => segmentLt(a, b, pos));

    // Populate the priority queue O(Nlog(N))
    // The priority queue should already have all the segment it collides with, but do not fear as
    // the math is quite simple and straightforward:
    // We should check that the segment collides with the line that starts at pos and has angle = -Math.PI.
    // To do that we can just check the angles of the two endpoints (draw it in a piece of paper, it's easier if shown).
    for (let segment of segments) {
        let fa = segment.from.angle;
        let ta = segment.to.angle;

        let isActive = false;
        isActive ||= fa <= 0 && ta >= 0 && ta - fa > Math.PI;
        isActive ||= ta <= 0 && fa >= 0 && fa - ta > Math.PI;
        if (isActive) segmentPriorityQueue.push(segment);
    }

    let polygon = new Array<number>();

    for (let i = 0; i < points.length;) {
        // Extend signals that the first segment has ended
        // we should then extend the polygon to the new first visible segment.
        let extend = false;

        let orig = i;// The original point index
        let vertex = points[i];
        let oldSegment = segmentPriorityQueue.peek();
        if (oldSegment === undefined) {
            // Should be impossible but becomes possible when NaN is around
            throw new Error("No old segment");
        }

        do {
            let currSegment = points[i].segment!
            if (segmentPriorityQueue.hasElem(currSegment)) {
                if (currSegment === oldSegment) {
                    extend = true;
                    vertex = points[i];
                }
                segmentPriorityQueue.popElem(currSegment);
            } else {
                segmentPriorityQueue.push(currSegment);
            }

            i++;
            if (i === points.length) break;
        } while (points[i].angle < points[orig].angle + EPSILON);

        segmentPriorityQueue.peek()!.used = true;
        if (extend) {
            // Vertex is the first point of the old segment, we need to push this right away
            polygon.push(vertex.x, vertex.y);
            let point = new Point();
            let firstSeg = segmentPriorityQueue.peek()!;
            intersectLineVsLine(firstSeg.from, firstSeg.to, pos, vertex, point);
            if (!(Math.abs(point.x - vertex.x) < EPSILON && Math.abs(point.y - vertex.y) < EPSILON)) {
                polygon.push(point.x, point.y);
            }
        } else if (segmentPriorityQueue.peek() != oldSegment) {
            // A new segment has hidden the old first segment.
            // First compute where the old segment has been hidden, and push that point to the polygon
            let point = new Point();
            intersectLineVsLine(oldSegment.from, oldSegment.to, pos, vertex, point);
            polygon.push(point.x, point.y);

            // Then compute where the new segment intersects
            let newClosest = segmentPriorityQueue.peek()!;
            let nPoint;
            if (Math.abs(newClosest.from.angle - points[orig].angle) < EPSILON) {
                nPoint = newClosest.from;
            } else {
                nPoint = newClosest.to;
            }
            if (!(Math.abs(point.x - nPoint.x) < EPSILON && Math.abs(point.y - nPoint.y) < EPSILON)) {
                polygon.push(nPoint.x, nPoint.y);
            }
        }
    }
    return polygon;
}

export function compute(pos: Point, inSegments: Line[]): Array<number> {
    let segments = new Array<Segment>(inSegments.length);

    // O(N)
    for (let segment of inSegments) {
        let s = initSegment(segment.fromX, segment.fromY, segment.toX, segment.toY, pos);

        segments.push(s);
    }

    return compute0(pos, segments);
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

function clipSegment(line: Line, aabb: Aabb, light: IPoint): Segment | undefined {
    // https://en.wikipedia.org/wiki/Cohen%E2%80%93Sutherland_algorithm
    let x0 = line.fromX;
    let y0 = line.fromY;
    let x1 = line.toX;
    let y1 = line.toY;

    let code0 = computeOutCode(aabb, x0, y0);
    let code1 = computeOutCode(aabb, x1, y1);

    while (true) {
        if ((code0 | code1) === 0) {
            // bitwise OR is 0: both points inside window; trivially accept and exit loop
            return initSegment(x0, y0, x1, y1, light);
        } else if ((code0 & code1) !== 0) {
            // failed both tests, so calculate the line segment to clip
            // from an outside point to an intersection with clip edge
            return undefined;
        } else {
            let x = 0, y = 0;

            // At least one endpoint is outside the clip rectangle; pick it.
            let codeOut = code1 > code0 ? code1 : code0;

            // Now find the intersection point;
            // use formulas:
            //   slope = (y1 - y0) / (x1 - x0)
            //   x = x0 + (1 / slope) * (ym - y0), where ym is ymin or ymax
            //   y = y0 + slope * (xm - x0), where xm is xmin or xmax
            // No need to worry about divide-by-zero because, in each case, the
            // outcode bit being tested guarantees the denominator is non-zero

            if ((codeOut & TOP) !== 0) {           // point is above the clip window
                x = x0 + (x1 - x0) * (aabb.maxY - y0) / (y1 - y0);
                y = aabb.maxY;
            } else if ((codeOut & BOTTOM) !== 0) { // point is below the clip window
                x = x0 + (x1 - x0) * (aabb.minY - y0) / (y1 - y0);
                y = aabb.minY;
            } else if ((codeOut & RIGHT) !== 0) {  // point is to the right of clip window
                y = y0 + (y1 - y0) * (aabb.maxX - x0) / (x1 - x0);
                x = aabb.maxX;
            } else if ((codeOut & LEFT) !== 0) {   // point is to the left of clip window
                y = y0 + (y1 - y0) * (aabb.minX - x0) / (x1 - x0);
                x = aabb.minX;
            }

            // Now we move outside point to intersection point to clip
            // and get ready for next pass.
            let code = computeOutCode(aabb, x, y);
            if (codeOut === code0) {
                x0 = x;
                y0 = y;
                code0 = code;
            } else {
                x1 = x;
                y1 = y;
                code1 = code;
            }
        }
    }
}

export function computeViewport(lines: Line[], aabb: Aabb, light: IPoint, usedLines?: number[]): Array<number> {
    //console.log("Lines: " + lines.length);
    let segments = new Array<Segment>();

    let lineLen = lines.length;
    for (let i = 0; i < lineLen; i++) {
        let segment = clipSegment(lines[i], aabb, light);
        if (segment !== undefined) {
            (segment as any).index = i;
            segments.push(segment);
        }
    }
    //console.log("Done");
    // Push viewport segments:
    segments.push(
        initSegment(aabb.minX, aabb.minY, aabb.minX, aabb.maxY, light),
        initSegment(aabb.minX, aabb.maxY, aabb.maxX, aabb.maxY, light),
        initSegment(aabb.maxX, aabb.maxY, aabb.maxX, aabb.minY, light),
        initSegment(aabb.maxX, aabb.minY, aabb.minX, aabb.minY, light),
    );

    //console.log("SEGMENTS: ", segments);

    let poly = compute0(light, segments);

    if (usedLines !== undefined) {
        // Compute what lines have been used
        let segLen = segments.length - 4;
        for (let i = 0; i < segLen; i++) {
            let s = segments[i];
            if (s.used) usedLines.push((s as any).index);
        }
    }

    return poly;
}
