import {Aabb} from "./aabb";
import {computeObbPoints} from "./collision";

export class Obb {
    unrotated: Aabb;
    rotation: number;
    rotVertex: Array<number>;

    constructor(unrotated: Aabb, rotation: number, rotVertex: Array<number>) {
        this.unrotated = unrotated;
        this.rotation = rotation;
        this.rotVertex = rotVertex;
    }

    recompute() {
        this.rotVertex = computeObbPoints(this.unrotated, this.rotation);
    }

    copy(): Obb {
        return new Obb(this.unrotated.copy(), this.rotation, [...this.rotVertex]);
    }


    static rotateAabb(aabb: Aabb, rot: number): Obb {
        if (rot === 0) return this.fromAabb(aabb);
        return new Obb(aabb, rot, computeObbPoints(aabb, rot));
    }

    static fromAabb(aabb: Aabb): Obb {
        let points = [
            aabb.minX, aabb.minY,
            aabb.minX, aabb.maxY,
            aabb.maxX, aabb.maxY,
            aabb.maxX, aabb.minY
        ];
        return new Obb(aabb, 0, points);
    }
}