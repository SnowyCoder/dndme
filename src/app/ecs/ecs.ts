// Welcome to this talk, I'll present to you: my stupid version of ECS.
// What am I trying to solve?
// Everything in the map will need to hold information, this might be a player holding inventory or maybe a monster
// holding to lifepoints and such.
// What's more? every entity might have multiple names and only some of them might be public
// so we also have something similar to a "multiple component".

import {EcsStorage} from "./storage";
import PIXI from "../PIXI";
import {Component} from "./component";
import {Resource} from "./resource";
import EventEmitter = PIXI.utils.EventEmitter;


export type SerializedEcs = {
    entities: number[];
    storages: {[type: string]: any};
    resources: {[type: string]: any};
};

export interface EcsEntityLinked {
    _ecs_entity?: number;
}

export class EcsTracker {
    storages = new Map<string, EcsStorage<any>>();
    storageList = new Array<EcsStorage<any>>();
    entities = new Set<number>();
    resources = new Map<string, Resource>();
    isDeserializing: boolean = false;
    isMaster: boolean;

    //      Event list:
    // entity_spawn(id)
    // entity_spawned(id) - After an entity is spawned
    // entity_despawn(id)
    // entity_despawned(id) - After an entity is despawned
    // component_add(component)
    // component_edit(changes, component) - Before the component is edited
    // component_edited(component, changes) - After the component is edited
    // component_remove(component)
    // component_removed(component)
    // resource_add(resource)
    // resource_added(resource)
    // resource_edit(oldRes, newRes)
    // resource_remove(resource)
    // resource_removed(resource)
    // clear()
    // cleared()
    // serialize()
    // serialized(res)
    // serialize_entity(entity)
    // deserialize(data)
    // deserialized()
    //      External events:
    // query_hit(event: QueryHitEvent)
    // selection_begin(entities)
    // selection_end(entities)
    // selection_update()
    // tool_move_begin()
    // tool_move_end()
    //      TODO
    // batch_update_begin()
    // batch_update_end()
    events = new EventEmitter();

    constructor(isMaster: boolean) {
        this.isMaster = isMaster;
    }

    spawnEntity(...components: Array<Component>): number {
        let id = -1;

        do {
            id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        } while (this.entities.has(id))

        this.spawnEntityManual(id, components);

        return id;
    }

    spawnEntityManual(id: number, components: Array<Component>): void {
        this.entities.add(id);

        this.events.emit('entity_spawn', id);

        for (let comp of components) {
            this.addComponent(id, comp);
        }

        this.events.emit('entity_spawned', id);
    }

    despawnEntity(entity: number): void {
        this.events.emit('entity_despawn', entity);
        for (let i = this.storageList.length - 1; i >= 0; --i) {
            let storage = this.storageList[i];
            let comps = [...storage.getComponents(entity)]
            if (comps.length === 0) continue;
            for (let component of comps) {
                this.events.emit('component_remove', component);
            }
            storage.unregisterAllOf(entity);
            for (let component of comps) {
                this.events.emit('component_removed', component);
            }
        }
        this.entities.delete(entity);
        this.events.emit('entity_despawned', entity);
    }

    hasAllComponents(entity: number, ...types: string[]): boolean {
        for (let t of types) {
            if (this.getComponent(entity, t) === undefined) return false;
        }
        return true;
    }

    addComponent(entity: number, cmp: Component): void {
        cmp.entity = entity;
        let storage = this.storages.get(cmp.type);
        if (storage === undefined) {
            throw 'Cannot register component of type ' + cmp.type + ', no storage found';
        }
        storage.register(cmp);
        this.events.emit('component_add', cmp);
    }

    removeComponent(cmp: Component): void {
        this.events.emit('component_remove', cmp);
        let storage = this.storages.get(cmp.type);
        storage.unregister(cmp);
        this.events.emit('component_removed', cmp);
    }

    addStorage(storage: EcsStorage<any>): void {
        this.storages.set(storage.type, storage);
        this.storageList.push(storage);
    }

    getComponent(entity: number, type: string, multiId?: number): Component | undefined {
        let storage = this.storages.get(type);
        return storage.getFirstComponent(entity, multiId);
    }

    getAllComponents(entity: number): Component[] {
        let res = new Array<Component>();

        for (let storage of this.storages.values()) {
            res.push(...storage.getComponents(entity));
        }

        return res;
    }

    editComponent(entity: number, type: string, changes: any, multiId?: number): void {
        let c = this.getComponent(entity, type, multiId);

        if (!clearChanges(c, changes)) return;// No real changes
        this.events.emit('component_edit', c, changes);

        let changed = assignSwap(c, changes);

        this.events.emit('component_edited', c, changed);
    }

    addResource(resource: Resource, ifPresent: string = 'fail'): void {
        if (this.resources.has(resource.type)) {
            switch (ifPresent) {
                case 'ignore': break;
                case 'update': this.editResource(resource.type, resource); break;
                default: throw 'Resource type already present';
            }
            return
        }
        this.events.emit('resource_add', resource);
        if (this.resources.has(resource.type)) throw '"resource_add" event has added a resource of the same type!';

        this.resources.set(resource.type, resource);
        this.events.emit('resource_added', resource);
    }

    getResource(type: string): Resource | undefined {
        return this.resources.get(type);
    }

    editResource(type: string, changes: any): void {
        let res = this.getResource(type);

        if (!clearChanges(res, changes)) return;// No real changes
        this.events.emit('resource_edit', res, changes);
        assignSwap(res, changes);// changes now has old values
        this.events.emit('resource_edited', res, changes);
    }

    removeResource(type: string, failIfNotPresent: boolean = true): void {
        let resource = this.resources.get(type);
        if (resource === undefined) {
            if (failIfNotPresent) throw 'Resource type not found';
            return;
        }
        this.events.emit('resource_remove', resource);

        this.resources.delete(type);
        this.events.emit('resource_removed', resource);
    }

    serialize(): SerializedEcs {
        this.events.emit('serialize', 'save');

        let storages: {[type: string]: any} = {};

        for (let storage of this.storages.values()) {
            if (!storage.save) continue;
            storages[storage.type] = storage.serialize();
        }

        let resources: {[type: string]: any} = {};

        for (let resource of this.resources.values()) {
            if (resource._save === false) continue;// undefined is treated as true so that loaded resources get saved again
            let res = {} as any;
            for (let name in resource) {
                if (name[0] === '_' || name === 'type') continue;
                res[name] = (resource as any)[name];
            }
            resources[resource.type] = res;
        }

        let res = {
            entities: [...this.entities],
            storages,
            resources,
        } as SerializedEcs;

        this.events.emit('serialized', res);

        return res;
    }

    serializeClient(): SerializedEcs {
        this.events.emit('serialize', 'client');

        let storages: {[type: string]: any} = {};

        let hostHidden = this.storages.get('host_hidden');

        for (let storage of this.storages.values()) {
            if (!storage.save || !storage.sync) continue;
            storages[storage.type] = storage.serializeClient((e) => hostHidden.getFirstComponent(e) !== undefined);
        }

        let resources: {[type: string]: any} = {};

        for (let resource of this.resources.values()) {
            if (resource._save === false || resource._sync === false) continue;
            let res = {} as any;
            for (let name in resource) {
                if (name[0] === '_' || name === 'type') continue;
                res[name] = (resource as any)[name];
            }
            resources[resource.type] = res;
        }

        let res = {
            entities: [...this.entities].filter((e) => hostHidden.getFirstComponent(e) === undefined),
            storages,
            resources,
        } as SerializedEcs;


        this.events.emit('serialized', res);

        return res;
    }

    deserialize(data: SerializedEcs) {
        this.clear();
        this.isDeserializing = true;
        this.events.emit('deserialize', data);

        for (let type in data.resources) {
            let res = data.resources[type];
            res.type = type;
            this.addResource(res, 'update');
        }


        for (let entity of data.entities) {
            this.entities.add(entity);

            this.events.emit('entity_spawn', entity);
        }

        for (let type in data.storages) {
            let storage = this.storages.get(type);
            if (storage === undefined) {
                console.error("Cannot deserialize storage type: " + type + ", ignoring");
                continue;
            }
            storage.deserialize(this, data.storages[type]);
        }

        for (let entity of data.entities) {
            this.events.emit('entity_spawned', entity);
        }

        this.isDeserializing = false;
        this.events.emit('deserialized');
    }

    clear() {
        this.events.emit('clear');
        for (let entity of [...this.entities]) {
            this.despawnEntity(entity);
        }
        // Round 2 (if some entity gets spawned on despawn)
        for (let entity of [...this.entities]) {
            this.despawnEntity(entity);
        }
        if (this.entities.size !== 0) throw 'Entities spawned while clearing!';
        this.events.emit('cleared');
    }
}

function assignSwap(obj: any, changes: any): void {
    for (let name in changes) {
        let tmp = changes[name];
        changes[name] = obj[name];
        obj[name] = tmp;
    }
    return changes;
}

function clearChanges(from: any, changes: any): boolean {
    let changec = 0;
    for (let change in changes) {
        if (from[change] === changes[change]) {
            delete changes[change];
        } else {
            changec++;
        }
    }
    return changec !== 0;
}

