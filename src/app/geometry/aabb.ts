import {Point} from "./point";
import PIXI from "../PIXI";

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
        return new PIXI.Point(
            (this.minX + this.maxX) / 2,
            (this.minY + this.maxY) / 2
        );
    }

    getPerimeter(): number {
        return (this.maxX - this.minX + this.maxY - this.minY) * 2;
    }

    combine(other: Aabb, target: Aabb): void {
        target.minX = Math.min(this.minX, other.minX);
        target.minY = Math.min(this.minY, other.minY);
        target.maxX = Math.max(this.maxX, other.maxX);
        target.maxY = Math.max(this.maxY, other.maxY)
    }

    extend(amount: number, target: Aabb): void {
        target.minX = this.minX - amount;
        target.minY = this.minY - amount;
        target.maxX = this.maxX - amount;
        target.maxY = this.maxY - amount;
    }

    copyFrom(other: Aabb): void {
        this.minX = other.minX;
        this.minY = other.minY;
        this.maxX = other.maxX;
        this.maxY = other.maxY;
    }

    clone(): Aabb {
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
}


