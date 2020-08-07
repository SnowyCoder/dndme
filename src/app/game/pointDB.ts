import {K2dTree} from "../util/k2dTree";
import {distSquared2d, Point} from "../util/geometry";
import {GridSystem} from "../ecs/systems/gridSystem";


export class PointDB {
    // In js we cannot create a Map with a custom object as key -_-
    private counter = new Map<string, number>();
    private tree = new K2dTree();
    private readonly grid?: GridSystem;
    private count = 0;

    constructor(grid?: GridSystem) {
        this.grid = grid;
    }


    insert(point: Point): void {
        let ptrStr = point[0] + '|' + point[1];
        let p = this.counter.get(ptrStr) || 0
        this.counter.set(ptrStr, p + 1);
        if (p == 0) {
            this.tree.insert(point);
        }
        this.count++;
    }

    remove(point: Point): boolean {
        let ptrStr = point[0] + '|' + point[1];
        let p = (this.counter.get(ptrStr) || 0) - 1;
        if (p == 0) {
            this.counter.delete(ptrStr);
            if (!this.tree.remove(point)) {
                console.error('Failed to remove node: ' + point);
            }
        } else if (p > 0) {
            this.counter.set(ptrStr, p);
        } else {
            return false;
        }

        this.count--;
        return true;
    }

    findNearest(point: Point): [Point, number] | undefined {
        let treeNearest = this.tree.nearestPoint(point);

        let gridNearest: Point | undefined = undefined;
        if (this.grid !== undefined) {
            gridNearest = this.grid.closestPoint(point);
        }

        if (gridNearest !== undefined) {
            let gridDist = distSquared2d(point[0], point[1], gridNearest[0], gridNearest[1]);
            if (treeNearest === undefined || gridDist < treeNearest[1]) {
                return [gridNearest, gridDist];
            }
        }

        return treeNearest;
    }
}