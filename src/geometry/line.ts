import { Point } from "pixi.js";
import {IPoint} from "./point";

export class Line {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;

    constructor(fx: number, fy: number, tx: number, ty: number) {
        this.fromX = fx;
        this.fromY = fy;
        this.toX = tx;
        this.toY = ty;
    }

    distance(): number {
        let dx = this.toX - this.fromX;
        let dy = this.toY - this.fromY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    distanceSquared(): number {
        let dx = this.toX - this.fromX;
        let dy = this.toY - this.fromY;
        return dx * dx + dy * dy;
    }

    projectPoint(p: IPoint, target: Point, ignoreValid: boolean = false): boolean {
        if (this.fromX === this.toX && this.fromY === this.toY) return false;
        let u = ((p.x - this.fromX) * (this.toX - this.fromX)) +
                ((p.y - this.fromY) * (this.toY - this.fromY));

        let udenom = this.distanceSquared();

        u /= udenom;

        let rx = this.fromX + u * (this.toX - this.fromX);
        let ry = this.fromY + u * (this.toY - this.fromY);

        if (ignoreValid) {
            target.set(rx, ry);
            return true;
        }

        let minx = this.fromX, maxx = this.toX;
        let miny = this.fromY, maxy = this.toY;

        if (minx > maxx) [minx, maxx] = [maxx, minx];
        if (miny > maxy) [miny, maxy] = [maxy, miny];

        let isValid = (rx >= minx && rx <= maxx) && (ry >= miny && ry <= maxy);

        if (isValid) {
            target.set(rx, ry);
            return true;
        } else {
            return false;
        }
    }

    copy(): Line {
        return new Line(
            this.fromX, this.fromY,
            this.toX, this.toY
        );
    }
}
