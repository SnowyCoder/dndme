// Welcome to this talk, I'll present to you: my stupid version of ECS.
// What am I trying to solve?
// Everything in the map will need to hold information, this might be a player holding inventory or maybe a monster
// holding to lifepoints and such.
// What's more? every entity might have multiple names and only some of them might be public
// so we also have something similar to a "multiple component".

import {EcsStorage, SingleEcsStorage} from "./storage";
import {Component, SerializedFlag, SERIALIZED_TYPE, SharedFlag, SHARED_TYPE} from "./component";
import {Resource} from "./resource";
import {SystemGraph} from "./systemGraph";
import {System} from "./system";
import SafeEventEmitter from "../util/safeEventEmitter";
import {generateRandomId} from "./ecsUtil";

export interface ForgetData {
    entities: Set<number>;
}

export type SerializedEntities = {
    entities: number[];
    storages: {[type: string]: any};
};

export type SerializedResources = {
    resources: {[type: string]: any};
}

export type SerializedWorld = SerializedEntities & Partial<SerializedResources>;

export interface EcsEntityLinked {
    _ecs_entity?: number;
}

export type AnyMapType = {[key: string]: any};
export type MultiEditType = Array<{
    type: string,
    changes: AnyMapType,
    multiId?: number,
    clearChanges?: boolean,
}>;
type MultiEditTypeWork = MultiEditType & Array<{
    _skip?: true;
    _comp?: Component;
}>;

export type ResourceAddPresentType = 'fail' | 'ignore' | 'update';

export interface SerializeData {
    options: SerializeOptions;
    entityMapping: (id: number) => number;
    shouldIgnore: (id: number) => boolean;
    result?: SerializedWorld;
}

export interface DeserializeData {
    options: DeserializeOptions;
    data: SerializedWorld;
    entityMapping: (id: number) => number;
}

export interface SerializeOptions {
    // If true only serializes sync components/resources
    requireSync: boolean,
    // If true only serializes save components/resources
    requireSave: boolean,
    // Remaps entities to 1,2,3...
    remap: boolean,
    // Removes clientVisible (and clientVisible === false components)
    // and non-SHARED entities
    stripClient: boolean,
    // If true serializes every entity, even if it doesn't have the SHARED flag
    // (only useful when stripClient is enabled)
    ignoreShared: boolean,
    // Only serializes entities contained in the set
    only?: Set<number>,
    // If true also serializes resources
    resources: boolean,
}

const DEFAULT_SERIALIZE_OPTIONS = {
    requireSync: false,
    requireSave: false,
    remap: false,
    stripClient: false,
    ignoreShared: false,
    resources: false,
} as SerializeOptions;

export interface DeserializeOptions {
    remap: boolean,
    thenSelect: boolean,
    addShare: boolean,
}

const DEFAULT_DESERIALIZE_OPTIONS = {
    remap: false,
    thenSelect: false,
    addShare: false,
} as DeserializeOptions;

export class World {
    systems = new SystemGraph();
    storages = new Map<string, EcsStorage<any>>();
    storageList = new Array<EcsStorage<any>>();
    entities = new Set<number>();
    resources = new Map<string, Resource>();

    private systemsFinalized: boolean = false;
    isDeserializing: boolean = false;
    isDespawning: number[] = [];
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
    // serialize(data)
    // serialized(data)
    // deserialize(data)
    // deserialized(data)
    //      External events:
    // query_hit(event: QueryHitEvent)
    // selection_begin(entities)
    // selection_end(entities)
    // selection_update()
    // tool_move_begin()
    // tool_move_end()
    events = new SafeEventEmitter();
    // TODO: add some kind of event specialization:
    // ex: you want to subscribe only to 'component_add' events that have type=='pin'?
    //     `world.componentEvents = new SpecializedEventEmitter(world.events, 'type');`
    //     `world.componentEvents.on('component_add', 'pin', myEvent, context);`
    //     other idea: since we always use `type` to disambiguate:
    //     `world.events.onType('component_add', 'pin', myEvent, context);`
    //     (but we should edit quite heavily SafeEventEmitter)


    constructor(isMaster: boolean) {
        this.isMaster = isMaster;
    }

    getStorage<T extends Component>(name: string): EcsStorage<T> {
        let s = this.storages.get(name);
        if (s === undefined) {
            throw new Error("Cannot find storage " + name);
        }
        return s;
    }

    allocateId(): number {
        let id = -1;

        do {
            id = generateRandomId();
        } while (this.entities.has(id))

        return id;
    }

    spawnEntity(...components: Array<Omit<Component, 'entity'>>): number {
        let id = this.allocateId();

        this.spawnEntityManual(id, components);

        return id;
    }

    spawnEntityManual(id: number, components: Array<Omit<Component, 'entity'>>): void {
        this.entities.add(id);

        this.events.emit('entity_spawn', id);

        for (let comp of components) {
            this.addComponent(id, comp);
        }

        this.events.emit('entity_spawned', id);
    }

    despawnEntity(entity: number): void {
        this.isDespawning.push(entity);
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
        if (this.isDespawning.pop() !== entity) {
            console.error("Error despawning entity, despawn queue modified");
        }
        this.events.emit('entity_despawned', entity);
    }

    addSystem(system: System): void {
        if (this.systemsFinalized) throw new Error('Too late to add a system');
        try {
            this.systems.register(system);
        } catch (e) {
            throw new Error("Error while mounting " + system.name + ": " + e);
        }
    }

    hasAllComponents(entity: number, ...types: string[]): boolean {
        for (let t of types) {
            if (this.getComponent(entity, t) === undefined) return false;
        }
        return true;
    }

    addComponent(entity: number, cmp: Omit<Component, 'entity'>): void {
        if (!this.entities.has(entity)) {
            console.warn("Entity not present " + entity);
            return;
        }
        let c = cmp as Component;
        c.entity = entity;
        let storage = this.storages.get(c.type);
        if (storage === undefined) {
            console.warn('Cannot register component of type ' + c.type + ', no storage found');
            return;
        }
        storage.register(c);
        this.events.emit('component_add', c);
    }

    removeComponent(cmp: Component): void {
        this.events.emit('component_remove', cmp);
        let storage = this.getStorage(cmp.type);
        storage.unregister(cmp);
        this.events.emit('component_removed', cmp);
    }

    removeComponentType(entity: number, type: string): void {
        for (let c of this.getStorage(type).getComponents(entity)) {
            this.removeComponent(c);
        }
    }

    addStorage(storage: EcsStorage<any>): void {
        this.storages.set(storage.type, storage);
        this.storageList.push(storage);
    }

    getComponent<T extends Component>(entity: number, type: string, multiId?: number): T | undefined {
        let storage = this.getStorage<T>(type);
        return storage.getFirstComponent(entity, multiId);
    }

    getAllComponents(entity: number): Component[] {
        let res = new Array<Component>();

        for (let storage of this.storages.values()) {
            res.push(...storage.getComponents(entity));
        }

        return res;
    }

    editComponent(entity: number, type: string, changes: AnyMapType, multiId?: number, clearCh: boolean = true): void {
        let c = this.getComponent(entity, type, multiId);
        if (c === undefined) {
            throw new Error('Cannot find component ' + type + ' of entity: ' + entity);
        }

        if (clearCh && !clearChanges(c, changes)) return;// No real changes
        this.events.emit('component_edit', c, changes);

        let changed = assignSwap(c, changes);

        this.events.emit('component_edited', c, changed);
    }

    editComponentMultiple(entity: number, changes: MultiEditType): void {
        if (changes.length === 0) return;
        if (changes.length === 1) {
            this.editComponent(entity, changes[0].type, changes[0].changes, changes[0].multiId, changes[0].clearChanges);
            return;
        }
        let chs = changes as MultiEditTypeWork;
        for (let change of chs) {
            let c = this.getComponent(entity, change.type, change.multiId);
            if (c === undefined) {
                throw new Error('Cannot find component ' + change.type + ' of entity: ' + entity);
            }
            change._comp = c;

            if (change.clearChanges && !clearChanges(c, changes)) {
                change._skip = true;
            }
        }
        for (let change of chs) {
            if (change._skip) continue;

            this.events.emit('component_edit', change._comp!, change.changes);
        }

        for (let change of chs) {
            if (change._skip) continue;
            assignSwap(change._comp!, change.changes);
        }
        for (let change of chs) {
            if (change._skip) continue;
            this.events.emit('component_edited', change._comp!, change.changes);
        }
    }

    addResource(resource: Resource, ifPresent: ResourceAddPresentType = 'fail'): void {
        if (this.resources.has(resource.type)) {
            switch (ifPresent) {
                case 'ignore': break;
                case 'update': this.editResource(resource.type, resource); break;
                default: throw new Error('Resource type already present');
            }
            return
        }
        this.events.emit('resource_add', resource);
        if (this.resources.has(resource.type)) throw new Error('"resource_add" event has added a resource of the same type!');

        this.resources.set(resource.type, resource);
        this.events.emit('resource_added', resource);
    }

    getResource(type: string): Resource | undefined {
        return this.resources.get(type);
    }

    editResource(type: string, changes: AnyMapType): void {
        let res = this.getResource(type);
        if (res === undefined) {
            throw new Error('Cannot find resource ' + type);
        }

        if (!clearChanges(res, changes)) return;// No real changes
        this.events.emit('resource_edit', res, changes);
        assignSwap(res, changes);// changes now has old values
        this.events.emit('resource_edited', res, changes);
    }

    removeResource(type: string, failIfNotPresent: boolean = true): void {
        let resource = this.resources.get(type);
        if (resource === undefined) {
            if (failIfNotPresent) throw new Error('Resource type not found');
            return;
        }
        this.events.emit('resource_remove', resource);

        this.resources.delete(type);
        this.events.emit('resource_removed', resource);
    }

    enable() {
        for (let system of this.systems) {
            system.enable();
        }
    }

    destroy() {
        for (let i = this.systems.size() - 1; i >= 0; i--) {
            let system = this.systems.getAt(i);
            system.destroy();
        }
    }

    serialize(options: Partial<SerializeOptions>): SerializedWorld {
        options = Object.assign({}, DEFAULT_SERIALIZE_OPTIONS, options) as SerializeOptions;
        let entities: number[];
        if (options.only === undefined) {
            entities = [...this.entities];
        } else {
            entities = [...options.only];
        }

        const serializedFlag = this.getStorage(SERIALIZED_TYPE) as SingleEcsStorage<SerializedFlag>;

        let shouldIgnore = (x: number) => serializedFlag.getFirstComponent(x) === undefined;
        if (options.stripClient && !options.ignoreShared) {
            const shared = this.getStorage(SHARED_TYPE);
            
            const oldShouldIgnore = shouldIgnore;// Just to be sure
            shouldIgnore = (x: number) => oldShouldIgnore(x) || shared.getFirstComponent(x) === undefined;
        }
        entities = entities.filter(x => !shouldIgnore(x));

        let resEnt = entities;
        let mapping = (x: number) => x;
        if (options.remap) {
            resEnt = Array.from(Array(entities.length), (_e, i) => i+1);
            mapping = (x: number) => entities.indexOf(x) + 1;
        }

        let sdata = {
            options,
            entityMapping: mapping,
            shouldIgnore,
        } as SerializeData;
        this.events.emit('serialize', sdata);

        let storages: {[type: string]: any} = {};
        for (let storage of this.storages.values()) {
            if ((options.requireSync && !storage.sync) || (options.requireSave && !storage.save)) continue;
            let data = storage.serialize(sdata);
            if (data === undefined) continue;
            storages[storage.type] = data;
        }

        let resources: {[type: string]: any} | undefined = undefined;

        if (options.resources) {
            resources = {};

            for (let resource of this.resources.values()) {
                // undefined is treated as true so that loaded resources get saved again
                if ((options.requireSave && !resource._save) || (options.requireSync && !resource._sync)) continue;
                let res = {} as any;
                for (let name in resource) {
                    if (name[0] === '_' || name === 'type') continue;
                    res[name] = (resource as any)[name];
                }
                resources[resource.type] = res;
            }
        }

        let res = {
            entities: resEnt,
            storages,
        } as SerializedWorld;

        if (resources !== undefined) res.resources = resources;

        sdata.result = res;
        this.events.emit('serialized', sdata);

        return res;
    }

    deserialize(data: SerializedWorld, options: Partial<DeserializeOptions>) {
        options = Object.assign({}, DEFAULT_DESERIALIZE_OPTIONS, options) as DeserializeOptions;

        let mapping = (x: number) => x;
        if (options.remap) {
            let remapsUndup = new Set<number>();
            let remaps = new Array<number>();
            for (let i = 0; i < data.entities.length; i++) {
                let id = this.allocateId();
                if (remapsUndup.has(id)) {
                    i--;
                    continue;
                }
                remapsUndup.add(id);
                remaps.push(id);
            }
            mapping = (x: number) => remaps[x - 1];
        }

        let dsData = {
            options,
            data,
            entityMapping: mapping,
        } as DeserializeData;

        this.isDeserializing = true;
        this.events.emit('deserialize', dsData);

        if (data.resources !== undefined) {
            for (let type in data.resources) {
                let res = data.resources[type];
                res.type = type;
                this.addResource(res, 'update');
            }
        }

        for (let entity of data.entities) {
            let  realEnt = mapping(entity);
            this.entities.add(realEnt);

            this.events.emit('entity_spawn', realEnt);
        }

        // add serialized component for everyone
        for (let entity of data.entities) {
            let realEnt = mapping(entity);
            this.addComponent(realEnt, { type: SERIALIZED_TYPE, entity: -1 } as SerializedFlag);
            if (options.addShare) this.addComponent(realEnt, { type: SHARED_TYPE, entity: -1 } as SharedFlag);
        }

        for (let storage of this.storages.values()) {
            if (storage.type === SERIALIZED_TYPE) continue;// Already added implicitly
            if (!(storage.type in data.storages)) continue;
            storage.deserialize(this, dsData, data.storages[storage.type]);
        }

        for (let entity of data.entities) {
            this.events.emit('entity_spawned', mapping(entity));
        }

        this.isDeserializing = false;
        this.events.emit('deserialized', dsData);
    }

    populate() {
        this.events.emit('populate');
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
        if (this.entities.size !== 0) throw new Error('Entities spawned while clearing!');
        // TODO: also clear resources
        this.events.emit('cleared');
        this.populate();
    }

    /**
     * TODO: use Vue 3
     * Overrides the `Object.prototype.toString.call(obj)` result.
     * This is done to hide this object and its children from observers (see https://github.com/vuejs/vue/issues/2637)
     * @returns {string} - type name
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag}
     */
    get [Symbol.toStringTag]() {
        // Anything can go here really as long as it's not 'Object'
        return 'ObjectNoObserve';
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

function clearChanges(from: AnyMapType, changes: AnyMapType): boolean {
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
