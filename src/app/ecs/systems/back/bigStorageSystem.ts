import {System} from "../../system";
import {MultiEcsStorage} from "../../storage";
import {MultiComponent} from "../../component";
import {World} from "../../world";
import {Resource} from "../../resource";
import {componentEditCommand} from "../command/componentEdit";
import {ResourceEditCommand} from "../command/resourceEditCommand";
import {emitCommand} from "../command/command";
import { objectClone } from "../../../util/jsobj";
import { SpawnCommand } from "../command/spawnCommand";
import { generateRandomId } from "../../ecsUtil";

export interface BigEntry<X> {
    multiId: BigStorageIndex<X>;
    data: X;
    flags: BigEntryFlags;
    _users?: number;
}

export interface BigEntryComponent extends MultiComponent, BigEntry<any> {
    type: BIG_STORAGE_TYPE;
}

export interface BigEntryResource extends Resource {
    type: BIG_STORAGE_TYPE;
    entity: number;
    _save: true;
    _sync: true;
}

export enum BigEntryFlags {
    READONLY = 1,
    SHARED = 2,// If it's not shared it's owned as a CoW
}

export type BigStorageIndex<X> = number;

export const BIG_STORAGE_TYPE = 'big_storage';
export type BIG_STORAGE_TYPE = typeof BIG_STORAGE_TYPE;
export class BigStorageSystem implements System {
    readonly name = BIG_STORAGE_TYPE;
    readonly dependencies = [];

    readonly world: World;

    storage = new MultiEcsStorage<BigEntryComponent>(BIG_STORAGE_TYPE, true, true);

    res: BigEntryResource = {
        type: BIG_STORAGE_TYPE,
        entity: -1,
        _save: true,
        _sync: true,
    };


    constructor(world: World) {
        this.world = world;

        world.addStorage(this.storage);
        world.addResource(this.res);
        world.events.on('deserialized', this.onDeserialized, this);
    }

    create<X>(data: X, flags: BigEntryFlags = 0, own = true): BigEntry<X> {
        if (!this.world.isMaster) {
            throw Error("Trying to create a big entry on a non-master world");
        }
        if (this.res.entity <= 0) {
            console.log("Creating big storage");
            let entity = this.world.allocateId();
            emitCommand(this.world, {
                kind: 'spawn',
                data: {
                    entities: [entity],
                    storages: {},
                }
            } as SpawnCommand, true);
            let cmd = {
                kind: 'redit',
                add: [],
                edit: {},
                remove: [],
            } as ResourceEditCommand;
            cmd.edit[BIG_STORAGE_TYPE] = { entity };
            emitCommand(this.world, cmd, true);
        }

        let x = {
            multiId: generateRandomId(),
            type: BIG_STORAGE_TYPE,
            entity: this.res.entity,
            data,
            flags,
            _users: own ? 1 : 0,
        } as BigEntryComponent;

        emitCommand(this.world, componentEditCommand([x]), true);

        return x;
    }

    request<X>(id: BigStorageIndex<X>): BigEntry<X> | undefined {
        return this.storage.getComponent(this.res.entity, id);
    }

    requestUse<X>(id: BigStorageIndex<X>): BigEntry<X> | undefined {
        const r = this.request<X>(id);
        if (r === undefined) return undefined;

        if (this.world.isMaster) {
            r._users = ((r._users || 0)  + 1);
        }
        return r;
    }

    replace<X>(id: BigStorageIndex<X>, newData: X, ignoreReadonly = false): BigStorageIndex<X> {
        const r = this.request<X>(id);
        if (r === undefined) {
            throw Error("undefined id");
        }
        if (r.flags & BigEntryFlags.READONLY && !ignoreReadonly) {
            throw Error("Trying to replace readonly resurce");
        }

        if ((r.flags & BigEntryFlags.SHARED) === 0 && r._users!! > 1) {
            r._users!! -= 1;
            const entry = this.create(newData, r.flags);
            return entry.multiId;
        }

        r.data = newData;
        return r.multiId;
    }

    dropUse<X>(id: BigStorageIndex<X>) {
        if (!this.world.isMaster) return;

        const r = this.request(id);
        if (r === undefined) return;
        r._users = ((r._users || 0) - 1);
        // Don't, this might be reused by the commands
        /*if (r._users <= 0) {
            this.storage.unregister(r as BigEntryComponent);
        }*/
    }

    private onDeserialized() {
        let toRemove = [];
        for (let r of this.storage.getComponents(this.res.entity)) {
            if (r._users === undefined || r._users <= 0) {
                toRemove.push(r);
            }
        }
        let cmd = componentEditCommand([], [], toRemove);
        // TODO: please check if this works, I'm too scared
    }

    enable() {
    }

    destroy() {
    }
}
