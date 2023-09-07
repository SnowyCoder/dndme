import { Component as VComponent, customRef, DefineComponent, getCurrentInstance, inject, onUnmounted, proxyRefs, reactive, ShallowReactive, shallowRef, ShallowRef, toRef, triggerRef, watch, Ref, Directive, ShallowUnwrapRef, isProxy } from "vue";

import { Component, MultiComponent } from "../ecs/component";
import { World } from "../ecs/World";
import { arrayRemoveElem } from "../util/array";
import { ListenerFn } from "../util/safeEventEmitter";

import { objectClone, randombytes } from "../util/jsobj";
import { EcsStorage } from "../ecs/Storage";
import { utils } from "pixi.js";
import { ComponentForType, ComponentType, ResourceForType, ResourceType } from "@/ecs/TypeRegistry";
import { getLogger } from "@/ecs/systems/back/log/Logger";
import { executeAndLogCommand } from "@/ecs/systems/command/command";
import { ResourceEditCommand } from "@/ecs/systems/command/resourceEditCommand";
import { Tooltip } from "bootstrap";

export type VueComponent = VComponent | DefineComponent;

export const isNull = Symbol('isNull');

export function uniqueId(category: string | undefined) {
    return randombytes(16).toString('hex') + (category ? '-' + category : '');
}

export function stupidRef<T>(v: T): ShallowRef<T> {
    let value = v;
    return customRef((track, trigger) => {
        return {
            get() {
                track();
                return value;
            },
            set(x: T) {
                value = x;
                trigger();
            },
        }
    });
}

export function useEvent(world: World, eventName: string, callback: ListenerFn, context?: any, priority?: number): void {
    world.events.on(eventName, callback, context, priority);
    onUnmounted(() => {
        world.events.off(eventName, callback, context);
    });
}

export enum ResourceUpdateHistory {
    // When the resource is edited a command is created and registered in the
    // command history system, this way the user will be able to press undo and cancel the command
    REGISTER_COMMAND_IN_HISTORY,
    // When the resource is edited it WON'T be registered in the command history system, useful for quick
    // changes that aren't needed for propagation.
    QUICK_UPDATE,
    // Resource edits will result in errors!
    READONLY,
}

export function useResource<T extends ResourceType>(world: World, name: T): ShallowRef<ResourceForType<T>> {
    const res = stupidRef(world.getResource(name));
    const sys = world.requireSystem('declarative_listener');
    const listener = (rold: any, rnew: any) => {
        res.value = rnew;
    };
    sys.onResource(name, '' as any, listener);
    onUnmounted(() => {
        sys.offResource(name, '' as any, listener);
    })

    return res as ShallowRef<ResourceForType<T>>;
}


type WithDefaults<T, D extends Partial<Record<keyof T, any>>> = {
    [K in keyof D]: K extends keyof T
      ? T[K] | D[K]
      : never
}

export function useResourceReactive<R extends ResourceType, P extends Partial<Record<keyof ResourceForType<R>, any>>>(world: World, resName: R, properties: P, updateHistory: ResourceUpdateHistory): ShallowUnwrapRef<WithDefaults<ResourceForType<R>, P> & {[isNull]: boolean}> {
    // This, my friends, is how we create abstraction.
    // This is how we teach stones to think, processors to have multiple programs and javascript to do useful shit
    // Ok, enough with that, how does this work?
    // It creates a Proxy with all of the properties inside of "properties", when you get an item from that proxy it gets an item from
    //   the resource, when you set an item to that proxy it gets set to the resource
    // This is glued to the spiky and reactive ECS world, where everything is an event
    // Also another nice property is that we get to have default values for when a resource is missing (altough I don't quite recommend it)
    const res = shallowRef(world.getResource(resName));

    const obj = {} as {[key in string | typeof isNull]: ShallowRef<any>};
    for (let name in properties) {
        obj[name] = customRef((track, _trigger) => {
            return {
                get() {
                    track();
                    const v = res.value;
                    if (v === undefined) return properties[name];
                    return (v as any)[name];
                },
                set(newVal) {
                    if (updateHistory === ResourceUpdateHistory.READONLY) {
                        throw new Error('Tried to edit readonly reactive ref resource');
                    }
                    const changes = {} as any;
                    changes[name] = newVal;
                    const v = res.value;
                    if (v === undefined) {
                        getLogger('ui.vue').warning('Reactive resource: assign to null resource!');
                        const res = Object.assign({ type: resName }, objectClone(properties), changes);
                        world.addResource(res);
                    } else {
                        if (updateHistory == ResourceUpdateHistory.QUICK_UPDATE) {
                            world.editResource(resName, changes);
                        } else if (updateHistory == ResourceUpdateHistory.REGISTER_COMMAND_IN_HISTORY) {
                            const edit = {} as any;
                            edit[resName] = changes;
                            const command = {
                                kind: 'redit',
                                edit: edit,
                                add: [],
                                remove: [],
                            } satisfies ResourceEditCommand;
                            executeAndLogCommand(world, command);
                        }
                    }
                },
            }
        })
    }
    obj[isNull] = customRef((track, _trigger) => {
        return {
            get() {
                track();
                return res.value === undefined;
            },
            set() {
            }
        }
    })
    const reactiveRes = proxyRefs(obj);
    // ERROR does not work with toRefs, TODO
    // TODO: migrate to DeclarativeListener?

    useEvent(world, 'resource_add', (r: ResourceForType<R>) => {
        if (r.type === resName) {
            res.value = r;
            triggerRef(obj[isNull]);
            for (let x in obj) {
                triggerRef(obj[x]);
            }
        }
    });

    useEvent(world, 'resource_edited', (r: ResourceForType<R>, changed: any) => {
        if (r.type === resName) {
            res.value = r;
            for (let x in changed) {
                triggerRef(obj[x]);
            }
        }
    });

    useEvent(world, 'resource_removed', (r: ResourceForType<R>, changed: any) => {
        if (r.type === resName) {
            res.value = undefined;
            triggerRef(obj[isNull]);
            for (let x in obj) {
                triggerRef(obj[x]);
            }
        }
    });
    return reactiveRes as any;// more or less
}

export function useResourcePiece<T extends ResourceType, K extends keyof ResourceForType<T>>(name: T, attrName: K, defValue: ResourceForType<T>[K], updateHistory: ResourceUpdateHistory):  Ref<ResourceForType<T>[K]> {
    const world = (inject('world') as ShallowRef<World>).value;

    const properties = {} as Record<K, ResourceForType<T>[K]>;
    properties[attrName] = defValue;

    // message to typescript: SHUT UP NERD
    const res = useResourceReactive(world, name, properties as any, updateHistory);

    return toRef(res, attrName);
}


export function useComponentReactive<T>(component: ShallowRef<Component>,  properties: T):  ShallowReactive<T> {
    const { emit } = getCurrentInstance()!;

    const obj = {} as {[key: string]: ShallowRef<any>};
    for (let name in properties) {
        obj[name] = customRef((track, _trigger) => {
            return {
                get() {
                    track();
                    const v = component.value;
                    const prop = (v as any)[name];
                    return prop ?? properties[name];
                },
                set(newVal) {
                    emit('ecs-property-change', component.value.type, name, newVal, (component.value as MultiComponent).multiId);
                },
            }
        })
    }
    watch(component, () => {
        for (let x in obj) {
            triggerRef(obj[x]);
        }
    });
    return proxyRefs(obj) as ShallowReactive<T>;
}

export function useComponentPiece<C extends Component, N extends keyof C, V=NonNullable<C[N]>>(component: ShallowRef<C>, name: N, defValue: V):  ShallowRef<V> {
    const { emit } = getCurrentInstance()!;

    return customRef((track, trigger) => {
        watch(component, trigger);
        return {
            get() {
                track();
                const rawVal = (component.value as any)[name];
                return rawVal ?? defValue;
            },
            set(newVal: V) {
                emit('ecs-property-change', component.value.type, name, newVal, (component.value as any as MultiComponent).multiId);
            },
        };
    });
}

export function uhex2str(hex: number | undefined) {
    return hex === undefined ? '' : utils.hex2string(hex);
}

export function useComponentsOfType<T extends ComponentType>(type: T): ShallowRef<ComponentForType<T>[]> {
    const world = (inject('world') as ShallowRef<World>).value;

    const res = shallowRef(new Array<ComponentForType<T>>());

    const sys = world.requireSystem('declarative_listener');

    const listener = (cold: ComponentForType<T>, cnew: ComponentForType<T>) => {
        if (cold === undefined) {
            res.value.push(cnew);
        } else if (cnew === undefined) {
            arrayRemoveElem(res.value, cold);
        }
        triggerRef(res);
    }

    sys.onComponent(type, '' as any, listener as any);

    onUnmounted(() => {
        sys.offComponent(type, '' as any, listener as any);
    });

    const sto = world.getStorage(type) as any as EcsStorage<ComponentForType<T>>;
    for (let x of sto.getComponents()) {
        res.value.push(x);
    }

    return res;
}

export function useWorld(): World {
    const res = inject<ShallowRef<World>>("world");
    if (res == undefined) {
        throw new Error("World is undefined!");
    }
    return res.value;
}

export const vTooltip: Directive<HTMLElement, string> = {
    mounted(el, binding) {
        new Tooltip(el, {
            placement: binding.arg as Tooltip.PopoverPlacement || 'top',
            title: binding.value
        });
    }
}

export const vTooltipSlow: Directive<HTMLElement, string> = {
    mounted(el, binding) {
        new Tooltip(el, {
            placement: binding.arg as Tooltip.PopoverPlacement || 'top',
            title: binding.value,
            delay: 1000,
        });
    }
}
