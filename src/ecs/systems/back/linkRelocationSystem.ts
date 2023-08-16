import { ComponentType } from "@/ecs/TypeRegistry";
import {System} from "../../System";
import {DeserializeData, SerializeData, SerializedWorld, World} from "../../World";


type LinkPath = Array<string>;

export const LINK_RELOCATION_TYPE = 'link_relocation';
export type LINK_RELOCATION_TYPE = typeof LINK_RELOCATION_TYPE;
export class LinkRelocationSystem implements System {
    readonly dependencies = [];
    readonly name = LINK_RELOCATION_TYPE;

    private readonly world: World;

    private links = new Map<ComponentType, Array<LinkPath>>();

    constructor(world: World) {
        this.world = world;

        world.events.on('serialized', this.onSerialized, this);
        world.events.on('deserialize', this.onDeserialize, this);
    }

    addLink(storageName: ComponentType, path: string): void {
        const paths = path.split('.');
        let storageData = this.links.get(storageName);
        if (storageData === undefined) {
            storageData = [];
            this.links.set(storageName, storageData);
        }
        storageData.push(paths);
    }

    private adjustLink(mapping: (x: number) => number, obj: any, name: string): void {
        if (obj[name] === undefined || typeof obj[name] !== 'number') return;
        let newId = mapping(obj[name]);
        if (newId > 0) {
            obj[name] = newId;
        }
    }


    private foreachPathObj(baseObj: any, path: LinkPath, then: (obj: any, name: string) => void) {
        const explore = (obj: any, i: number) => {
            if (obj === undefined) return;
            const p = path[i];
            if (i === path.length - 1) {
                then(obj, p)
                return;
            }
            if (p == '*') {
                for (let name in obj) {
                    explore(obj[name], i + 1);
                }
            } else {
                explore(obj[p], i + 1);
            }
        }

        explore(baseObj, 0);
    }



    adjustSerializedPaths(mapping: (x: number) => number, world: SerializedWorld) {
        for (let [sname, sdata] of this.links.entries()) {
            const storage = world.storages[sname];
            if (storage === undefined) continue;

            for (let entityId in storage) {
                const obj = storage[entityId];

                for (let path of sdata) {
                    this.foreachPathObj(obj, path, (o, n) => this.adjustLink(mapping, o, n))
                }
            }
        }
    }

    private onSerialized(data: SerializeData) {
        if (!data.options.remap) return;

        this.adjustSerializedPaths(data.entityMapping, data.result!!);
    }

    private onDeserialize(data: DeserializeData) {
        if (!data.options.remap) return;

        this.adjustSerializedPaths(data.entityMapping, data.data);
    }


    enable(): void {
    }

    destroy(): void {
    }
}
