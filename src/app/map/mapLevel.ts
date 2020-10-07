import JSZip from "jszip";
import {GridOptions, GridType} from "../game/grid";
import {World, SerializedEcs} from "../ecs/ecs";

export class MapLevel {
    id: number;
    name?: string;
    ecs?: SerializedEcs;

    constructor(id: number) {
        this.id = id;
    }

    loadInto(ecs: World): void {
        ecs.clear();
        if (this.ecs !== undefined) {
            ecs.deserialize(this.ecs);
        }
    }

    saveFrom(ecs: World): void {
        this.ecs = undefined;
        this.ecs = ecs.serialize();
    }

    serialize(): any {
        return {
            name: this.name,
            ecs: this.ecs
        }
    }

    static deserialize(id: number, data: any): MapLevel {
        let res = new MapLevel(id);
        res.name = data['name'];
        res.ecs = data['ecs'];
        return res;
    }
}