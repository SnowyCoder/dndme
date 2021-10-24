import {System} from "../../system";
import {MultiEcsStorage} from "../../storage";
import {MultiComponent} from "../../component";
import {World} from "../../world";
import {Resource} from "../../resource";
import {componentEditCommand} from "../command/componentEdit";
import {ResourceEditCommand} from "../command/resourceEditCommand";
import {emitCommand} from "../command/command";

export interface BigEntry<X> {
    multiId: BigStorageIndex<X>;
    data: X;
    _users?: number;
    _readonly?: boolean;
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
        _sync: true
    };


    constructor(world: World) {
        this.world = world;

        world.addStorage(this.storage);
        world.addResource(this.res);
        world.events.on('deserialized', this.onDeserialized, this);
    }

    create<X>(data: X, readonly: boolean = true): BigEntry<X> {
        if (this.res.entity <= 0) {
            let entity = this.world.spawnEntity();
            let cmd = {
                kind: 'redit',
                add: [],
                remove: [],
                edit: {
                    BIG_STORAGE_TYPE: { entity }
                }
            } as ResourceEditCommand;
            emitCommand(this.world, cmd);
            this.world.editResource(BIG_STORAGE_TYPE, { entity });
        }

        let x = {
            multiId: -1,
            type: BIG_STORAGE_TYPE,
            entity: this.res.entity,
            data,
            _users: 0,
            _readonly: readonly,
        } as BigEntryComponent;

        emitCommand(this.world, componentEditCommand([x]));

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

    replace<X>(id: BigStorageIndex<X>, newData: X): BigEntry<X> | undefined {
        const r = this.request<X>(id);
        if (r === undefined) return undefined;

        r.data = newData;
        return r;
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
    }

    enable() {
    }

    destroy() {
    }
}