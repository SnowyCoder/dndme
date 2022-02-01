import {SerializedWorld, World} from "../ecs/world";

export interface SerializedMapLevel {
    name?: string;
    ecs?: SerializedWorld;
}

export class MapLevel {
    id: number;
    name?: string;
    ecs?: SerializedWorld;

    constructor(id: number) {
        this.id = id;
    }

    loadInto(ecs: World): void {
        ecs.clear();
        if (this.ecs !== undefined) {
            ecs.deserialize(this.ecs, {});
        }
    }

    saveFrom(ecs: World): void {
        this.ecs = undefined;
        this.ecs = ecs.serialize({
            requireSave: true,
            resources: true,
        });
    }

    serialize(): SerializedMapLevel {
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