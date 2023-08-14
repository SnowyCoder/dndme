import { Component, HideableComponent, SHARED_TYPE } from "@/ecs/component";
import { Resource } from "@/ecs/resource";
import { System } from "@/ecs/System";
import { ComponentForType, ComponentTypes, ResourceForType, ResourceType } from "@/ecs/TypeRegistry";
import { World } from "@/ecs/World";
import { Path, PathValue } from "@/util/TypeNavigation";

// ------------- Rationale
// This System helps you listen to your favourite Component/Resource changes!
// Previously all systems listened on component_edit component_add, component_remove
// filtering their components by checking the types.
// Unfortunately this is really slow, as component edits need to happen 20/30 times per frame
// If every system would use this method we would reduce the load on the event system by a lot.
// SO PLEASE, PLEASE, PLEASE REMEMBER TO USE THIS.
// YES, I'M TALKING TO YOU LORENZO FROM THE FUTURE, YOU'RE THE ONLY FUCKIN' DEVELOPER ANYWAYS
// WHY THE FUCK ARE YOU IGNORING HEATMAPS, EVENTS ARE LITERALLY EATING YOUR LIL TOOL ALIVE.
//
// ------------- Syntax
// @name   = for every entity of type "name"
// ^name   = for every SHARED entity (!shared = removed = undefined)
// #name   = for every resource of type "name"
// .name   = navigate attribute name or index
//
// ------------- Examples:
// ^pin.imageId = listen on attribute "imageId" of visible pin
// @wall.vec.0 = listen on attribute vec[0] of wall components
// #grid.color
//
// ------------- Typization
// Now, I know what you're thinking
// Wow, this is pretty awesome but it erases all of the type checks
// AHAH, NO
// Thanks to hundreds of typescript black magic tricks (of whick, only some are in this file)
// we are able to ENFORCE the path and INFER the given types.
//
// How?
// Well, huh, ehm...
// The types in @/ecs/TypeRegistry have all of the available components and resources types.
// The types in @/util/TypeNavigation provide utilities to follow paths inside of objects
// Combine the two and pray that TypeScript doesn't crash, and, well, you have this!


export type DeclarativeListener<T, R> = (oldValue: T | undefined, newValue: T | undefined, r: R, edited: Partial<R>) => void;

interface Entry {
    path: string,
    paths: string[],
    listeners: Array<[DeclarativeListener<any, any>, any]>,
}

type CompletePathComponent<Rest extends string> =
  Rest extends `${infer Name}.${infer RPath}`
  ? Name extends ComponentTypes
    ? RPath extends Path<ComponentForType<Name>>
      ? PathValue<ComponentForType<Name>, RPath>
      : never
    : never
  : Rest extends ComponentTypes
    ? ComponentForType<Rest>
    : never;

type CompletePathResource<Rest extends string> =
  Rest extends `${infer Name}.${infer RPath}`
  ? Name extends ResourceType
    ? RPath extends Path<ResourceForType<Name>>
      ? PathValue<ResourceForType<Name>, RPath>
      : never
    : never
  : Rest extends ResourceType
    ? ResourceForType<Rest>
    : never;

type CompletePathToValue<X extends string> =
  string extends X ? string :
  X extends `${ComponentFirstChar}${infer Rest}` ? CompletePathComponent<Rest> :
  X extends `#${infer Rest}` ? CompletePathResource<Rest> :
  never;

type CompletePathToComponent<X extends string> =
  string extends X ? string :
  X extends `${ComponentFirstChar}${infer Rest}`
  ? Rest extends ComponentTypes
    ? ComponentForType<Rest>
    : Rest extends `${infer Name}.${string}`
      ? Name extends ComponentTypes ? ComponentForType<Name> : never
      : never
  : X extends `#${infer Rest}`
  ? Rest extends ResourceType
    ? ResourceForType<Rest>
    : Rest extends `${infer Name}.${string}`
      ? Name extends ResourceType ? ResourceForType<Name> : never
      : never
  : never;


type ComponentFirstChar = '@' | '^';

// Typescript crashes when you enable this, lol
/*
type AllPaths<C> = Path<ComponentForType<C>>;
type CompletePathForComp<C extends ComponentTypes> = `${ComponentFirstChar}${C}.${AllPaths<C>}` | `${ComponentFirstChar}${C}`;
type CompletePathForRes<C extends ResourceType> = `#${C}.${Path<ResourceForType<C>>}` | `#${C}`;
export type CompletePath = CompletePathForRes<ResourceType> | CompletePathForComp<ComponentTypes>;*/

// We might not be able to create a type with all of the possible instantiations of the CompletePath
// buuuut, we ARE able to validate the CompletePath by checking CompletePathToValue<X> != never
// I can't explicitly raise an error when the constraint is not met, but it works anyways
export type CompletePath = string;

export const DECLARATIVE_LISTENER_TYPE = 'declarative_listener';
export type DECLARATIVE_LISTENER_TYPE = typeof DECLARATIVE_LISTENER_TYPE;
export class DeclarativeListenerSystem implements System {
    readonly name = DECLARATIVE_LISTENER_TYPE;
    readonly dependencies = [];
    private readonly world: World;

    private components_ = new Map<string, Array<Entry>>();
    private visibleComponents = new Map<string, Array<Entry>>();
    private resources_ = new Map<string, Array<Entry>>();

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

    private unRegister(reg: Map<string, Array<Entry>>, name: string, path: string,
        listener: DeclarativeListener<any, any>, context?: any): void {
        let regs = reg.get(name);
        if (regs === undefined) {
            return;
        }
        let regIndex = -1;
        for (let i = 0; i < regs.length; i++) {
            if (regs[i].path == path) {
                regIndex = i;
                break;
            }

        }
        if (regIndex == -1) return;
        const entry = regs[regIndex];

        // found!
        let index = -1;
        for (let i = 0; i < entry.listeners.length; i++) {
            if (entry.listeners[i][0] == listener && entry.listeners[i][0] == context) {
                index = i;
                break;
            }
        }
        if (index === -1) return;

        entry.listeners.splice(index, 1);
        if (entry.listeners.length === 0) {
            regs.splice(regIndex, 1);
        }
    }

    private extractPathRestReg(path: string): [string, string, Map<string, Entry[]>] {
        // We can't use split here since js split is quite useless
        if (path.length === 0) {
            throw new Error("Invalid parameter: empty path");
        }
        let i = path.indexOf('.');
        let name: string = path;
        let rest;
        if (i >= 0) {
            name = path.slice(1, i);
            rest = path.slice(i+1);
        } else {
            name = path.slice(1);
            rest = '';
        }
        let reg: Map<string, Entry[]>;
        switch (path[0]) {
            case '@': reg = this.components_;        break;
            case '^': reg = this.visibleComponents; break;
            case '#': reg = this.resources_;         break;
            default: throw new Error('Invalid parameter: unknown root char');
        }
        return [name, rest, reg];
    }

    on<P extends string>(path: P, listener: DeclarativeListener<CompletePathToValue<P>, CompletePathToComponent<P>>, context?: any): void {
        const [name, rest, reg] = this.extractPathRestReg(path);

        this.register(reg, name, rest, listener, context);
    }

    off<P extends string>(path: P, listener: DeclarativeListener<CompletePathToValue<P>, CompletePathToComponent<P>>, context?: any): void {
        const [name, rest, reg] = this.extractPathRestReg(path);

        this.unRegister(reg, name, rest, listener, context);
    }

    onComponent<T extends ComponentTypes, P extends Path<ComponentForType<T>>>(
        name: T,
        path: P,
        listener: DeclarativeListener<PathValue<ComponentForType<T>, P>, ComponentForType<T>>,
        context?: any
    ): void {
        this.register(this.components_, name, path, listener, context);
    }

    offComponent<T extends ComponentTypes, P extends Path<ComponentForType<T>>>(
        name: T,
        path: P,
        listener: DeclarativeListener<PathValue<ComponentForType<T>, P>, ComponentForType<T>>,
        context?: any
    ): void {
        this.unRegister(this.components_, name, path, listener, context);
    }

    onComponentVisible<T extends ComponentTypes, P extends Path<ComponentForType<T>>>(
        name: T,
        path: P,
        listener: DeclarativeListener<PathValue<ComponentForType<T>, P>, ComponentForType<T>>,
        context?: any
    ): void {
        this.register(this.visibleComponents, name, path, listener, context);
    }

    offComponentVisible<T extends ComponentTypes, P extends Path<ComponentForType<T>>>(
        name: T,
        path: P,
        listener: DeclarativeListener<PathValue<ComponentForType<T>, P>, ComponentForType<T>>,
        context?: any
    ): void {
        this.unRegister(this.visibleComponents, name, path, listener, context);
    }

    onResource<T extends ResourceType, P extends Path<ResourceForType<T>>>(
        name: T,
        path: P,
        listener: DeclarativeListener<PathValue<ResourceForType<T>, P>, ResourceForType<T>>,
        context?: any
    ): void {
        this.register(this.resources_, name, path, listener, context);
    }

    offResource<T extends ResourceType, P extends Path<ResourceForType<T>>>(
        name: T,
        path: P,
        listener: DeclarativeListener<PathValue<ResourceForType<T>, P>, ResourceForType<T>>,
        context?: any
    ): void {
        this.unRegister(this.resources_, name, path, listener, context);
    }

    private onNew(entries: Entry[] | undefined, newObj: any): void {
        if (entries === undefined) return;
        for (let entry of entries) {
            const val = this.nagivatePath(newObj, entry.paths);
            for (let l of entry.listeners) {
                l[0].call(l[1], undefined, val, newObj, {});
            }
        }
    }

    private onEdit(entries: Entry[] | undefined, obj: any, changed: any): void {
        if (entries === undefined) return;
        for (let entry of entries) {
            if (!(entry.path.length == 0 || entry.paths[0] in changed)) continue;

            const old = this.nagivatePath(changed, entry.paths);
            const val = this.nagivatePath(obj, entry.paths);
            // should we filter for equality?
            for (let l of entry.listeners) {
                l[0].call(l[1], old, val, obj, changed);
            }
        }
    }

    private onDel(entries: Entry[] | undefined, oldObj: any): void {
        if (entries === undefined) return;
        for (let entry of entries) {
            const val = this.nagivatePath(oldObj, entry.paths);
            for (let l of entry.listeners) {
                l[0].call(l[1], val, undefined, oldObj, {});
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
        this.onNew(this.components_.get(c.type), c);
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
        this.onEdit(this.components_.get(c.type), c, changes);
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
        this.onDel(this.components_.get(c.type), c);
    }

    private onResourceAdd(r: Resource): void {
        this.onNew(this.resources_.get(r.type), r);
    }

    private onResourceEdited(r: Resource, changes: any): void {
        this.onEdit(this.resources_.get(r.type), r, changes);
    }

    private onResourceRemoved(r: Resource): void {
        this.onDel(this.resources_.get(r.type), r);
    }

    enable(): void {
    }

    destroy(): void {
    }
}
