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

    copy(): Obb {
        return new Obb(this.unrotated.copy(), this.rotation, [...this.rotVertex]);
    }


    static rotateAabb(aabb: Aabb, rot: number) {
        return new Obb(aabb, rot, computeObbPoints(aabb, rot));
    }
}