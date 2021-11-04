import {Component, HideableComponent, MultiComponent} from "./component";
import {DeserializeData, DeserializeOptions, SerializeData, SerializeOptions, World} from "./world";
import {generateRandomId} from "./ecsUtil";
import { arrayFilterInPlace } from "../util/array";
import { objectFilterInplace, objectMerge } from "../util/jsobj";


export function serializeObj(obj: Component, removeClientVisible: boolean): any {
    let res = {} as any;
    for (let name in obj) {
        if (name[0] === '_' || name === 'entity' ||
            name === 'type' || (removeClientVisible && name === 'clientVisible')) continue;
        res[name] = (obj as any)[name];
    }
    return res;
}

export interface EcsStorage<C extends Component> {
    readonly type: string;
    readonly sync: boolean;
    readonly save: boolean;

    getFirstComponent(entity: number, multiId?: number): C | undefined;

    getComponents(entity?: number): Iterable<C>

    register(component: C): void;

    unregister(component: C): void;

    unregisterAllOf(entity: number): void;

    serialize(options: SerializeData): any | undefined;

    deserialize(ecs: World, dsData: DeserializeData, raw: any): void;

    serializedMerge(to: any, from: any): void;

    serializedStrip(data: any, filter: (x: number) => boolean): void;
}

type MultiEcsStorageSerialized = {[entity: number]: any[]};
export class MultiEcsStorage<C extends MultiComponent> implements EcsStorage<C> {
    readonly type: string;
    readonly sync: boolean;
    readonly save: boolean;

    private data = new Map<number, Array<C>>();

    constructor(type: string, sync: boolean = true, save: boolean = true) {
        this.type = type;
        this.sync = sync;
        this.save = save;
    }

    getFirstComponent(entity: number, multiId?: number): C | undefined {
        if (multiId !== undefined) {
            return this.getComponent(entity, multiId);
        }
        let e = this.data.get(entity);
        if (e === undefined) return undefined;
        return e[0];
    }

    getComponent(entity: number, multiId: number): C | undefined {
        let cmps = this.data.get(entity);
        if (cmps === undefined) return undefined;
        for (let cmp of cmps) {
            if (cmp.multiId === multiId) return cmp;
        }
        return undefined;
    }

    getComponents(entity?: number): Iterable<C> {
        if (entity !== undefined) {
            return this.data.get(entity) || [];
        } else {
            return this.allComponents();
        }
    }

    *allComponents(): Generator<C> {
        for (let comps of this.data.values()) {
            for (let comp of comps) {
                yield comp;
            }
        }
    }

    register(component: C): void {
        let arr = this.data.get(component.entity);

        if (component.multiId >= 0) {// Pre-assigned multi-id
            if (arr === undefined) {
                this.data.set(component.entity, [component]);
            } else {
                for (let c of arr) {
                    if (c.multiId === component.multiId) throw Error('Invalid pre-assigned multiId ' + c.multiId);
                }

                arr.push(component);
            }
            return;
        }

        if (arr === undefined) {
            component.multiId = generateRandomId();
            this.data.set(component.entity, [component]);
        } else {
            let id;
            let found;
            do {
                id = generateRandomId();
                found = false;
                for (let x of arr) {
                    if (x.multiId === id) {
                        found = true;
                        break;
                    }
                }
            } while (found);
            component.multiId = id;
            arr.push(component);
        }
    }

    unregister(component: C): void {
        let arr = this.data.get(component.entity);
        if (arr === undefined) {
            return;
        }
        if (arr.length === 1 && arr[0] === component) {
            this.data.delete(component.entity);
        } else {
            arr.splice(arr.indexOf(component), 1);
        }
    }

    unregisterAllOf(entity: number) {
        this.data.delete(entity);
    }

    serialize(sdata: SerializeData): MultiEcsStorageSerialized | undefined {
        let res: MultiEcsStorageSerialized = {};

        const stripClient = sdata.options.stripClient;
        const ser = (comps: C[]): Array<any> => {
            let entityRes = new Array<any>();
            for (let component of comps) {
                if (stripClient &&
                    (component as Component as HideableComponent).clientVisible === false
                ) continue;
                entityRes.push(serializeObj(component, stripClient));
            }
            return entityRes;
        }

        const remap = sdata.options.remap;
        let isPresent = false;
        if (sdata.options.only !== undefined) {
            let i = 0;
            for (let entity of sdata.options.only) {
                i += 1;
                let comps = this.data.get(entity);
                if (comps === undefined) continue;
                if (sdata.shouldIgnore(entity)) continue;

                const x = ser(comps);
                if (x.length === 0) continue;

                let e = remap ? i : entity;
                res[e] = x;
                isPresent = true;
            }
        } else {
            for (let [entity, comps] of this.data.entries()) {
                if (sdata.shouldIgnore(entity)) continue;

                const x = ser(comps);
                if (x.length === 0) continue;

                let e = remap ? sdata.entityMapping(entity) : entity;
                res[e] = x;
                isPresent = true;
            }
        }
        if (!isPresent) return undefined;
        return res;
    }

    deserialize(ecs: World, dsdata: DeserializeData, data: MultiEcsStorageSerialized | undefined): void {
        if (data === undefined) return;
        for (let entity in data) {
            let e = parseInt(entity);
            for (let comp of data[entity]) {
                let obj = Object.assign({}, comp, {
                    type: this.type
                });
                ecs.addComponent(dsdata.entityMapping(e), obj);
            }
        }
    }

    serializedMerge(to: MultiEcsStorageSerialized, from: MultiEcsStorageSerialized) {
        objectMerge(to, from);
    }

    serializedStrip(data: MultiEcsStorageSerialized, filter: (x: number) => boolean) {
        objectFilterInplace(data, (name, val) => {
            if (!filter(parseInt(name))) return false;
            arrayFilterInPlace(val, x => {
                if ((x as HideableComponent).clientVisible === false) {
                    return false;
                } else {
                    delete (x as any)['clientVisible'];
                    return true;
                }
            });

            return val.length !== 0;
        });
    }
}

export type SingleEcsStorageSerialzed = {[entity: number]: any};
export class SingleEcsStorage<C extends Component> implements EcsStorage<C> {
    readonly type: string;
    readonly sync: boolean;
    readonly save: boolean;

    private data = new Map<number, C>();

    constructor(type: string, sync: boolean = true, save: boolean = true) {
        this.type = type;
        this.sync = sync;
        this.save = save;
    }

    getComponent(entity: number): C | undefined {
        return this.data.get(entity);
    }

    getFirstComponent(entity: number): C | undefined {
        return this.data.get(entity);
    }

    getComponents(entity?: number): Iterable<C> {
        if (entity !== undefined) {
            let res = this.data.get(entity);
            if (res === undefined) return [];
            else return [res];
        } else {
            return this.allComponents();
        }
    }

    allComponents(): IterableIterator<C> {
        return this.data.values();
    }

    register(component: C): void {
        let arr = this.data.get(component.entity);
        if (arr === undefined) {
            this.data.set(component.entity, component);
        } else {
            throw 'Component of same type already registered';
        }
    }

    unregister(component: C): void {
        let c = this.data.get(component.entity);
        if (c === undefined) {
            return;
        }
        if (c === component) {
            this.data.delete(component.entity);
        }
    }

    unregisterAllOf(entity: number) {
        this.data.delete(entity);
    }

    serialize(sdata: SerializeData): SingleEcsStorageSerialzed | undefined {
        let res: SingleEcsStorageSerialzed = {};

        const stripClient = sdata.options.stripClient;
        const remap = sdata.options.remap;
        let isPresent = false;
        if (sdata.options.only !== undefined) {
            let i = 0;
            for (let entity of sdata.options.only) {
                i += 1;
                const comp = this.data.get(entity)
                if (comp === undefined) continue;
                if (stripClient &&
                    (sdata.shouldIgnore(comp.entity) ||
                    (comp as Component as HideableComponent).clientVisible === false)
                ) continue;

                let e = remap ? i : entity;
                res[e] = serializeObj(comp, stripClient);
                isPresent = true;
            }
        } else {
            for (let comp of this.data.values()) {
                if (stripClient &&
                    (sdata.shouldIgnore(comp.entity) ||
                    (comp as Component as HideableComponent).clientVisible === false)
                ) continue;

                let e = remap ? sdata.entityMapping(comp.entity) : comp.entity;
                res[e] = serializeObj(comp, stripClient);
                isPresent = true;
            }
        }
        if (!isPresent) return undefined;
        return res;
    }

    deserialize(ecs: World, dsData: DeserializeData, data: SingleEcsStorageSerialzed | undefined): void {
        if (data === undefined) return;
        for (let entity in data) {
            let obj = Object.assign({}, data[entity], {
                type: this.type
            })
            ecs.addComponent(dsData.entityMapping(parseInt(entity)), obj);
        }
    }

    serializedMerge(to: SingleEcsStorageSerialzed, from: SingleEcsStorageSerialzed) {
        objectMerge(to, from);
    }

    serializedStrip(data: SingleEcsStorageSerialzed, filter: (x: number) => boolean) {
        objectFilterInplace(data, (name, val) => {
            if (!filter(parseInt(name))) return false;
            if ((val as HideableComponent).clientVisible === false) return false;

            return true;
        });
    }
}

export type FlagEcsStorageSerialzed = number[];
export class FlagEcsStorage implements EcsStorage<Component> {
    readonly type: string;
    readonly sync: boolean;
    readonly save: boolean;

    private data = new Map<number, Component>();

    constructor(type: string, sync: boolean = true, save: boolean = true) {
        this.type = type;
        this.sync = sync;
        this.save = save;
    }

    getComponent(entity: number): Component | undefined {
        return this.data.get(entity);
    }

    getFirstComponent(entity: number): Component | undefined {
        return this.getComponent(entity);
    }

    getComponents(entity?: number): Iterable<Component> {
        if (entity !== undefined) {
            let res = this.getComponent(entity);
            if (res === undefined) return [];
            else return [res];
        } else {
            return this.allComponents();
        }
    }

    allComponents(): IterableIterator<Component> {
        return this.data.values();
    }

    register(component: Component): void {
        if (this.data.has(component.entity)) throw 'Component of same type already registered';
        this.data.set(component.entity, component);
    }

    unregister(component: Component): void {
        this.data.delete(component.entity);
    }

    unregisterAllOf(entity: number) {
        this.data.delete(entity);
    }

    serialize(sdata: SerializeData): number[] | undefined {
        let data;
        if (sdata.options.only === undefined) {
            data = [...this.data.keys()];
            if (sdata.options.stripClient) {
                data = data.filter(e => !sdata.shouldIgnore(e));
            }
            if (sdata.options.remap) {
                data = data.map(sdata.entityMapping);
            }
        } else {
            data = [];
            let i = 0;
            for (let e of sdata.options.only) {
                i += 1;
                if (!this.data.has(e) || sdata.shouldIgnore(e)) continue;
                data.push(sdata.options.remap ? i : e);
            }
        }

        if (data.length === 0) return undefined;
        return data;
    }

    deserialize(ecs: World, dsData: DeserializeData, data: number[] | undefined): void {
        if (data === undefined) return;
        for (let entity of data) {
            ecs.addComponent(dsData.entityMapping(entity), {
                type: this.type,
                entity: -1
            });
        }
    }

    serializedMerge(to: FlagEcsStorageSerialzed, from: FlagEcsStorageSerialzed) {
        to.push(...from);
    }

    serializedStrip(data: FlagEcsStorageSerialzed, filter: (x: number) => boolean) {
        arrayFilterInPlace(data, filter);
    }
}
