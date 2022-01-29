import {SerializedEntities, SerializedWorld, World} from "../../world";
import {Component, SHARED_TYPE} from "../../component";
import {Command, CommandKind} from "./command";
import {DeSpawnCommand} from "./despawnCommand";
import { componentClone } from "../../ecsUtil";
import { FlagEcsStorage, FlagEcsStorageSerialzed, MultiEcsStorage, SingleEcsStorage } from "../../storage";
import { objectClone, objectFilterInplace } from "../../../util/jsobj";

export interface SpawnCommand extends Command {
    kind: 'spawn';
    data: SerializedEntities;
}

export class SpawnCommandKind implements CommandKind {
    readonly kind = 'spawn';
    private readonly world: World;

    constructor(world: World) {
        this.world = world;
    }

    applyInvert(cmd: SpawnCommand): DeSpawnCommand {
        this.world.deserialize(cmd.data, {});

        return {
            kind: 'despawn',
            entities: cmd.data.entities,
        } as DeSpawnCommand;
    }

    stripClient(command: SpawnCommand): Command[] {
        const shared = command.data.storages[SHARED_TYPE] as FlagEcsStorageSerialzed;

        const entityFilter = (x: number) => shared !== undefined && shared.includes(x);
        let newEntities = command.data.entities.filter(entityFilter);

        if (newEntities.length === 0) {
            return [];
        }

        let newStorages = objectClone(command.data.storages);

        objectFilterInplace(newStorages, (storName: string, data: any) => {
            const storage = this.world.getStorage(storName);
            if (!storage.sync) return false;

            storage.serializedStrip(data, entityFilter);
            return true;
        });

        return [{
            kind: 'spawn',
            data: {
                entities: newEntities,
                storages: newStorages,
            }
        } as SpawnCommand];
    }

    merge(to: SpawnCommand, from: SpawnCommand): boolean {
        to.data.entities.push(...from.data.entities);
        for (let storageName in from.data.storages) {
            const fromStorage = from.data.storages[storageName];
            const toStorage = to.data.storages[storageName];
            if (toStorage === undefined) {
                to.data.storages[storageName] = componentClone(fromStorage);
                continue;
            }

            this.world.getStorage(storageName)
                      .serializedMerge(toStorage, fromStorage);
        }
        return true;
    }

    isNull(command: SpawnCommand): boolean {
        return command.data.entities.length === 0;
    }

    static from(world: World, components: Component[]): SpawnCommand {
        const entity = world.allocateId();
        const cmd = {
            entities: [entity],
            storages: {},
        } as SerializedWorld;
        for (let comp of components) {
            const storage = world.getStorage(comp.type);
            delete (comp as any).type;
            if (storage instanceof SingleEcsStorage) {
                cmd.storages[storage.type] = {}
                cmd.storages[storage.type][entity] = comp;
            } else if (storage instanceof MultiEcsStorage) {
                let data = cmd.storages[storage.type];
                if (data === undefined) {
                    data = {}
                    data[entity] = []
                    cmd.storages[storage.type] = data;
                }
                data[entity].push(comp);
            } else if (storage instanceof FlagEcsStorage) {
                cmd.storages[storage.type] = [entity];
            } else {
                console.warn("Unknown storage type: " + storage.type);
            }
        }
        return {
            kind: 'spawn',
            data: cmd,
        };
    }
}
