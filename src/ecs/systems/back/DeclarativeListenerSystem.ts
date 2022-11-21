import { Component, HideableComponent, SHARED_TYPE } from "@/ecs/component";
import { Resource } from "@/ecs/resource";
import { System } from "@/ecs/system";
import { World } from "@/ecs/world";
import { SHARE_ENV } from "worker_threads";

/// Syntax
// @name   = for every entity of type "name"
// ^name   = for every SHARED entity (!shared = removed = undefined)
// #name   = for every resource of type "name"
// .name   = navigate attribute name or index
// Example:
// ^pin.imageId = listen on attribute "imageId" of visible pin
// @wall.vec.0 = listen on attribute vec[0] of wall components
// #grid.color


export type DeclarativeListener<T, R> = (oldValue: T | undefined, newValue: T | undefined, r: R) => void;

interface Entry {
    path: string,
    paths: string[],
    listeners: Array<[DeclarativeListener<any, any>, any]>,
}

export const DECLARATIVE_LISTENER_TYPE = 'declarative_listener';
export type DECLARATIVE_LISTENER_TYPE = typeof DECLARATIVE_LISTENER_TYPE;
export class DeclarativeListenerSystem implements System {
    readonly name = DECLARATIVE_LISTENER_TYPE;
    readonly dependencies = [];
    private readonly world: World;

    private components = new Map<string, Array<Entry>>();
    private visibleComponents = new Map<string, Array<Entry>>();
    private resources = new Map<string, Array<Entry>>();

    constructor(world: World) {
        this.world = world;
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_removed', this.onComponentRemoved, this);
        world.events.on('resource_add', this.onResourceAdd, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
        world.events.on('resource_removed', this.onResourceRemoved, this);
    }

    private nagivatePath(obj: any, path: string[]): unknown {
        let curr = obj;
        let nullable = false;
        for (let i = 0; i < path.length; i++) {
            const nextNullable = path[i][path[i].length - 1] === '?';
            const currPath = nextNullable ? path[i].slice(0, path[i].length - 1) : path[i];
            curr = (nullable && curr == null) ? undefined : curr[currPath];
            nullable = nextNullable;
        }
        return curr;
    }

    private register(reg: Map<string, Array<Entry>>, name: string, path: string,
                      listener: DeclarativeListener<any, any>, context?: any): void {
        let regs = reg.get(name);
        if (regs === undefined) {
            regs = [];
            reg.set(name, regs);
        }
        for (let l of regs) {
            if (l.path == path) {
                // Piggyback on previous one
                l.listeners.push([listener, context]);
                return;
            }
        }
        const paths = path === '' ? [] : path.split('.');
        regs.push({
            path,
            paths,
            listeners: [[listener, context]],
        });
    }

    on<T>(path: string, listener: DeclarativeListener<T, Component | Resource>, context?: any): void {
        // We can't uise split here since js script is quite useless
        if (path.length === 0) {
            throw new Error("Invalid parameter: empty path");
        }
        let i = path.indexOf('.');
        let name = path;
        let rest;
        if (i >= 0) {
            name = path.slice(1, i);
            rest = path.slice(i+1);
        } else {
            name = path.slice(1);
            rest = '';
        }
        let reg;
        switch (path[0]) {
            case '@': reg = this.components;        break;
            case '^': reg = this.visibleComponents; break;
            case '#': reg = this.resources;         break;
            default: throw new Error('Invalid parameter: unknown root char');
        }
        this.register(reg, name, rest, listener, context);
    }

    onComponent<T>(name: string, path: string, listener: DeclarativeListener<T, Component>, context?: any): void {
        this.register(this.components, name, path, listener, context);
    }

    onComponentVisible<T>(name: string, path: string, listener: DeclarativeListener<T, Component>, context?: any): void {
        this.register(this.visibleComponents, name, path, listener, context);
    }

    onResource<T>(name: string, path: string, listener: DeclarativeListener<T, Resource>, context?: any): void {
        this.register(this.resources, name, path, listener, context);
    }

    private onNew(entries: Entry[] | undefined, newObj: any): void {
        if (entries === undefined) return;
        for (let entry of entries) {
            const val = this.nagivatePath(newObj, entry.paths);
            for (let l of entry.listeners) {
                l[0].call(l[1], undefined, val, newObj);
            }
        }
    }

    private onEdit(entries: Entry[] | undefined, obj: any, changed: any): void {
        if (entries === undefined) return;
        for (let entry of entries) {
            if (entry.path.length === 0) continue;
            if (!(entry.path[0] in changed)) continue;

            const old = this.nagivatePath(changed, entry.paths);
            const val = this.nagivatePath(obj, entry.paths);
            // should we filter for equality?
            for (let l of entry.listeners) {
                l[0].call(l[1], old, val, obj);
            }
        }
    }

    private onDel(entries: Entry[] | undefined, oldObj: any): void {
        if (entries === undefined) return;
        for (let entry of entries) {
            const val = this.nagivatePath(oldObj, entry.paths);
            for (let l of entry.listeners) {
                l[0].call(l[1], val, undefined, oldObj);
            }
        }
    }

    private onComponentAdd(c: Component): void {
        // Visible components
        if (c.type === SHARED_TYPE) {
            for (let [name, data] of this.visibleComponents.entries()) {
                for (let comp of this.world.storages.get(name)?.getComponents(c.entity) ?? []) {
                    if ((comp as HideableComponent).clientVisible === false) continue;
                    this.onNew(data, comp);
                }
            }
            return;
        }
        if (this.visibleComponents.has(c.type)) {
            if (this.world.getComponent(c.entity, SHARED_TYPE) !== undefined && (c as HideableComponent).clientVisible !== false) {
                this.onNew(this.visibleComponents.get(c.type), c);
            }
        }
        // All components
        this.onNew(this.components.get(c.type), c);
    }

    private onComponentEdited(c: Component, changes: any): void {
        if (this.visibleComponents.has(c.type)) {
            const data = this.visibleComponents.get(c.type);
            const comp = c as HideableComponent;
            let visibilityChanged = false;
            if ('clientVisible' in changes) {
                if (comp.clientVisible === false && changes['clientVisible'] !== false) {
                    this.onDel(data, c);
                    visibilityChanged = true;
                } else if (comp.clientVisible !== false && changes['clientVisible'] === false) {
                    this.onNew(data, c);
                    visibilityChanged = true;
                }
            }
            if (!visibilityChanged && this.world.getComponent(c.entity, SHARED_TYPE) !== undefined && (c as HideableComponent).clientVisible !== false) {
                this.onEdit(data, c, changes);
            }
        }
        this.onEdit(this.components.get(c.type), c, changes);
    }

    private onComponentRemoved(c: Component): void {
        if (c.type === SHARED_TYPE) {
            for (let [name, data] of this.visibleComponents.entries()) {
                for (let comp of this.world.storages.get(name)?.getComponents(c.entity) ?? []) {
                    if ((comp as HideableComponent).clientVisible === false) continue;
                    this.onDel(data, comp);
                }
            }
            return;
        }
        if (this.visibleComponents.has(c.type)) {
            if (this.world.getComponent(c.entity, SHARED_TYPE) !== undefined && (c as HideableComponent).clientVisible !== false) {
                this.onDel(this.visibleComponents.get(c.type), c);
            }
        }
        this.onDel(this.components.get(c.type), c);
    }

    private onResourceAdd(r: Resource): void {
        this.onNew(this.resources.get(r.type), r);
    }

    private onResourceEdited(r: Resource, changes: any): void {
        this.onEdit(this.resources.get(r.type), r, changes);
    }

    private onResourceRemoved(r: Resource): void {
        this.onDel(this.resources.get(r.type), r);
    }

    enable(): void {
    }

    destroy(): void {
    }
}
