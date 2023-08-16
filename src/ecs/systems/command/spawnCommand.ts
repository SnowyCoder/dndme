import {SerializedEntities, SerializedWorld, World} from "../../World";
import {Component, SHARED_TYPE} from "../../component";
import {Command, CommandKind} from "./command";
import {DeSpawnCommand} from "./despawnCommand";
import { componentClone } from "../../ecsUtil";
import { EcsStorage, FlagEcsStorage, FlagEcsStorageSerialzed, MultiEcsStorage, SingleEcsStorage } from "../../Storage";
import { objectClone, objectFilterInplace } from "../../../util/jsobj";
import { ComponentType } from "@/ecs/TypeRegistry";

export interface SpawnCommand extends Command {
    kind: 'spawn';
    data: SerializedEntities;
    addShare?: boolean;
}

export class SpawnCommandKind implements CommandKind {
    readonly kind = 'spawn';
    private readonly world: World;

    constructor(world: World) {
        this.world = world;
    }

    applyInvert(cmd: SpawnCommand): DeSpawnCommand {
        this.world.deserialize(cmd.data, {
            addShare: cmd.addShare,
        });

        return {
            kind: 'despawn',
            entities: cmd.data.entities,
        } as DeSpawnCommand;
    }

    apply(cmd: SpawnCommand): void {
        this.applyInvert(cmd);
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
            const storage = this.world.getStorage(storName as any);
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

    merge(to: SpawnCommand, from: SpawnCommand, strict: boolean): boolean {
        if (strict) return false;
        to.data.entities.push(...from.data.entities);
        for (let storageName in from.data.storages) {
            const name = storageName as ComponentType;
            const fromStorage = from.data.storages[name];
            const toStorage = to.data.storages[name];
            if (toStorage === undefined) {
                to.data.storages[name] = componentClone(fromStorage);
                continue;
            }

            this.world.getStorage(name)
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
                console.warn("Unknown storage type: " + (storage as EcsStorage<Component>).type);
            }
        }
        return {
            kind: 'spawn',
            data: cmd,
        };
    }
}
