import {Component, HideableComponent, MultiComponent} from "./component";
import {World} from "./ecs";


export function serializeObj(obj: Component): any {
    let res = {} as any;
    for (let name in obj) {
        if (name[0] === '_' || name === 'entity' || name === 'type') continue;
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

    serialize(): any;

    serializeClient(shouldIgnore: (entity: number) => boolean): any;

    deserialize(ecs: World, raw: any): void;
}

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
                    if (c.multiId === component.multiId) throw 'Invalid pre-assigned multiId';
                }

                arr.push(component);
            }
            return;
        }

        if (arr === undefined) {
            component.multiId =  Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            this.data.set(component.entity, [component]);
        } else {
            let id;
            let found;
            do {
                id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
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

    serialize(): {[entity: number]: any[]} {
        let res: {[entity: number]: any[]} = {};
        for (let [entity, comps] of this.data.entries()) {
            let entityRes = new Array<any>();
            for (let component of comps) {
                entityRes.push(serializeObj(component));
            }
            res[entity] = entityRes;
        }
        return res;
    }

    serializeClient(shouldIgnore: (entity: number) => boolean): {[entity: number]: any[]} {
        let res: {[entity: number]: any[]} = {};
        for (let [entity, comps] of this.data.entries()) {
            if (shouldIgnore(entity)) continue;
            let entityRes = new Array<any>();
            for (let component of comps) {
                if ((component as Component as HideableComponent).clientVisible === false) continue;
                entityRes.push(serializeObj(component));
            }
            if (entityRes.length !== 0) {
                res[entity] = entityRes;
            }
        }
        return res;
    }

    deserialize(ecs: World, data: {[entity: number]: any[]}): void {
        for (let entity in data) {
            let e = parseInt(entity);
            for (let comp of data[entity]) {
                let obj = Object.assign({}, comp, {
                    type: this.type
                });
                ecs.addComponent(e, obj);
            }
        }
    }
}

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

    serialize(): {[entity: number]: any} {
        let res: {[entity: number]: any} = {};
        for (let comp of this.data.values()) {
            res[comp.entity] = serializeObj(comp);
        }
        return res;
    }

    serializeClient(shouldIgnore: (entity: number) => boolean): {[entity: number]: any} {
        let res: {[entity: number]: any} = {};
        for (let comp of this.data.values()) {
            if (shouldIgnore(comp.entity) || (comp as Component as HideableComponent).clientVisible === false) continue;
            res[comp.entity] = serializeObj(comp);
        }
        return res;
    }

    deserialize(ecs: World, data: { [entity: number]: any}): void {
        for (let entity in data) {
            let obj = Object.assign({}, data[entity], {
                type: this.type
            })
            ecs.addComponent(parseInt(entity), obj);
        }
    }
}

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

    serialize(): number[] {
        return [...this.data.keys()];
    }

    serializeClient(shouldIgnore: (entity: number) => boolean): number[] {
        return [...this.data.keys()].filter((e) => !shouldIgnore(e));
    }

    deserialize(ecs: World, data: number[]): void {
        for (let entity of data) {
            ecs.addComponent(entity, {
                type: this.type,
                entity: -1
            });
        }
    }
}

