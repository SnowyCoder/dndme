import { Point, Rectangle } from "@/pixi";
import {IPoint} from "./point";

export class Aabb {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;

    constructor(x1: number, y1: number, x2: number, y2: number) {
        if (x1 > x2) [x1, x2] = [x2, x1];
        if (y1 > y2) [y1, y2] = [y2, y1];

        this.minX = x1;
        this.minY = y1;
        this.maxX = x2;
        this.maxY = y2;
    }

    isValid(): boolean {
        return this.minX < this.maxX && this.minY < this.maxY;
    }

    getCenter(): Point {
        return new Point(
            (this.minX + this.maxX) / 2,
            (this.minY + this.maxY) / 2
        );
    }

    getPerimeter(): number {
        return (this.maxX - this.minX + this.maxY - this.minY) * 2;
    }

    distancePoint(p: IPoint): number {
        const dx = Math.max(this.minX - p.x, 0, p.x - this.maxX);
        const dy = Math.max(this.minY - p.y, 0, p.y - this.maxY);
        return Math.sqrt(dx*dx + dy*dy);
    }

    translate(x: number, y: number, target: Aabb): void {
        target.minX = this.minX + x;
        target.minY = this.minY + y;
        target.maxX = this.maxX + x;
        target.maxY = this.maxY + y;
    }

    combine(other: Aabb, target: Aabb): void {
        target.minX = Math.min(this.minX, other.minX);
        target.minY = Math.min(this.minY, other.minY);
        target.maxX = Math.max(this.maxX, other.maxX);
        target.maxY = Math.max(this.maxY, other.maxY);
    }

    intersect(other: Aabb, target: Aabb) {
        target.minX = Math.max(this.minX, other.minX);
        target.minY = Math.max(this.minY, other.minY);
        target.maxX = Math.min(this.maxX, other.maxX);
        target.maxY = Math.min(this.maxY, other.maxY);
    }

    extend(amount: number, target: Aabb): void {
        target.minX = this.minX - amount;
        target.minY = this.minY - amount;
        target.maxX = this.maxX + amount;
        target.maxY = this.maxY + amount;
    }

    scale(dx: number, dy: number, target: Aabb): void {
        let cx = (this.minX + this.maxX) / 2;
        let cy = (this.minY + this.maxY) / 2;
        let hw = (this.maxX - this.minX) / 2;
        let hh = (this.maxY - this.minY) / 2;
        target.minX = cx - hw * dx;
        target.minY = cy - hh * dy;
        target.maxX = cx + hw * dx;
        target.maxY = cy + hh * dy;
    }

    copyFrom(other: Aabb): void {
        this.minX = other.minX;
        this.minY = other.minY;
        this.maxX = other.maxX;
        this.maxY = other.maxY;
    }

    reset(): void {
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;
    }

    wrapPolygon(polygon: number[]): void {
        this.minX = Number.POSITIVE_INFINITY;
        this.minY = Number.POSITIVE_INFINITY;
        this.maxX = Number.NEGATIVE_INFINITY;
        this.maxY = Number.NEGATIVE_INFINITY;

        let len = polygon.length;
        for (let i = 0; i < len; i += 2) {
            this.minX = Math.min(this.minX, polygon[i]);
            this.minY = Math.min(this.minY, polygon[i + 1]);
            this.maxX = Math.max(this.maxX, polygon[i]);
            this.maxY = Math.max(this.maxY, polygon[i + 1]);
        }
    }

    copy(): Aabb {
        let other = Aabb.zero();
        other.copyFrom(this);
        return other;
    }

    toString(): string {
        return "AABB(" + this.minX.toFixed(2) + ", " + this.minY.toFixed(2) + ", " + this.maxX.toFixed(2) + ", " + this.maxY.toFixed(2) + ")";
    }

    static zero(): Aabb {
        return new Aabb(0, 0, 0, 0);
    }

    static fromBounds(b: Rectangle): Aabb {
        return new Aabb(b.left, b.top, b.right, b.bottom);
    }

    static fromPoint(p: IPoint): Aabb {
        return new Aabb(p.x, p.y, p.x, p.y);
    }

    static fromPointAnchor(pos: IPoint, size: IPoint, anchor: IPoint): Aabb {
        return new Aabb(
            pos.x - size.x * anchor.x,
            pos.y - size.y * anchor.y,
            pos.x + size.x * (1 - anchor.x),
            pos.y + size.y * (1 - anchor.y)
        );
    }
}
