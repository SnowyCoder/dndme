import {Component, HideableComponent, HOST_HIDDEN_TYPE, MultiComponent} from "../../component";
import {AnyMapType, MultiEditType, World} from "../../world";
import {Command, CommandKind} from "./command";
import {DeSpawnCommand} from "./despawnCommand";
import {SpawnCommand} from "./spawnCommand";
import {filterComponent, filterComponentKeepEntity} from "../../ecsUtil";
import { objectClone } from "../../../util/jsobj";

export function componentEditCommand(
    add?: Component[],
    edit?: EditType[],
    remove?: Component[],
    parallel?: boolean,
): ComponentEditCommand {
    return {
        kind: 'cedit',
        add,
        edit,
        remove,
        multi: parallel
    };
}

export function singleEditCommand(edit: EditType) {
    return componentEditCommand(undefined, [edit]);
}

export interface EditType {
    entity: number;
    type: string;
    multiId?: number;
    changes: AnyMapType,
}

export interface ComponentEditCommand extends Command {
    kind: 'cedit';
    add?: Component[];
    multi?: boolean;
    edit?: EditType[];
    pedit?: {[id: number]: MultiEditType};
    remove?: Component[];
}

export class ComponentEditCommandKind implements CommandKind {
    readonly kind = 'cedit';
    private readonly world: World;

    constructor(world: World) {
        this.world = world;
    }

    applyInvert(cmd: ComponentEditCommand): ComponentEditCommand {
        let inv = {
            kind: 'cedit',
        } as ComponentEditCommand;
        for (let c of cmd.add ?? []) {
            inv.remove = inv.remove ?? [];
            inv.remove.push({
                entity: c.entity,
                type: c.type,
                multiId: (c as MultiComponent).multiId,
            } as MultiComponent);
            this.world.addComponent(c.entity, c);
        }
        if (!cmd.multi) {
            for (let c of cmd.edit ?? []) {
                this.world.editComponent(c.entity, c.type, c.changes, c.multiId, false);
            }
        } else {
            let entityMap = new Map<number, MultiEditType>();
            for (let c of cmd.edit ?? []) {
                let x = entityMap.get(c.entity);
                if (x === undefined) {
                    x = [];
                    entityMap.set(c.entity, x);
                }
                x.push({
                    type: c.type,
                    multiId: c.multiId,
                    changes: c.changes,
                });
            }
            for (let [key, val] of entityMap.entries()) {
                this.world.editComponentMultiple(key, val);
            }
        }
        inv.edit = cmd.edit;
        for (let c of cmd.remove ?? []) {
            let component = this.world.getComponent(c.entity, c.type, (c as MultiComponent).multiId);
            if (component !== undefined) {
                this.world.removeComponent(component);
                inv.add = inv.add ?? [];
                inv.add.push(filterComponentKeepEntity(component));
            }
        }
        return inv;
    }

    stripClient(cmd: ComponentEditCommand): Command[] {
        let host_hidden = cmd.add?.filter(x => x.type === HOST_HIDDEN_TYPE).map(x => x.entity) ?? [];
        let non_host_hidden = cmd.remove?.filter(x => x.type === HOST_HIDDEN_TYPE).map(x => x.entity) ?? [];

        let predicate = (x: Component) => {
            if ((x as HideableComponent).clientVisible === false) return false;
            if (host_hidden.indexOf(x.entity) > -1) return false;
            if (non_host_hidden.indexOf(x.entity) > -1) return true;
            return this.world.getComponent(x.entity, HOST_HIDDEN_TYPE) === undefined;
        };
        let partialPredicate = (x: Component) => {
            let real = this.world.getComponent(x.entity, x.type, (x as MultiComponent).multiId)!;
            if ((real as HideableComponent).clientVisible === false && !('clientVisible' in x)) return false;
            return predicate(x);
        }

        let add = cmd.add?.filter(predicate);
        let edit = cmd.edit?.filter(partialPredicate);
        let remove = cmd.remove?.filter(x => x.type !== HOST_HIDDEN_TYPE && partialPredicate(x));

        edit = edit?.filter(x => {
            if (!('clientVisible' in x.changes)) return true;
            let orig = this.world.getComponent(x.entity, x.type, x.multiId) as HideableComponent;
            if (orig === undefined) return false;

            if (x.changes.clientVisible === false && orig.clientVisible !== false) {
                remove = remove ?? [];
                remove.push({
                    entity: x.entity,
                    type: x.type,
                    multiId: x.multiId,
                } as MultiComponent);
            } else if (x.changes.clientVisible !== false && orig.clientVisible === false) {
                add = add ?? [];
                add.push(filterComponentKeepEntity(orig));
            }
            return false;
        })

        let res = new Array<Command>();
        if (host_hidden.length !== 0) {
            res.push({
                kind: 'despawn',
                entities: host_hidden,
            } as DeSpawnCommand)
        }
        if (non_host_hidden.length !== 0) {
            res.push(this.createEntitySpawnPacket(non_host_hidden));
        }
        if ((add?.length || 0) + (edit?.length || 0) + (remove?.length || 0) !== 0) {
            let cedit = {
                kind: 'cedit'
            } as ComponentEditCommand;
            if (add !== undefined) cedit.add = add.map(objectClone);
            if (edit !== undefined) {
                cedit.edit = edit.map(objectClone);
                if (cmd.multi) cedit.multi = true;
            }
            if (remove !== undefined) cedit.remove = remove.map(objectClone);
            res.push(cedit);
        }

        return res;
    }

    merge(to: ComponentEditCommand, from: ComponentEditCommand): boolean {
        if (to.multi !== from.multi) return false;

        // TODO: from should remove entities added in to.
        //       handle entities edited in to but removed in from
        to.add = mergeNullableArrays(to.add, from.add);
        to.remove = mergeNullableArrays(to.remove, from.remove);

        if (from.edit !== undefined) {
            if (to.edit === undefined) {
                to.edit = from.edit;
            } else {
                for (let x of from.edit) {
                    let z = to.edit.find(y => x.entity === y.entity && x.type === y.type && x.multiId === y.multiId);
                    if (z === undefined) {
                        to.edit.push(x)
                    } else {
                        Object.assign(z.changes, x.changes);
                    }
                }
            }
        }

        return true;
    }


    isNull(command: ComponentEditCommand): boolean {
        if ((command.add?.length || 0) + (command.remove?.length || 0) !== 0) return false;
        for (let edit of command.edit ?? []) {
            for (let c in edit.changes) {
                return false;
            }
        }
        return true;
    }

    private createEntitySpawnPacket(entities: number[]): SpawnCommand  {
        let data = this.world.serialize({
            requireSync: true,
            stripClient: true,
            ignoreHostHidden: true,
            only: new Set(entities),
        });
        return {
            kind: 'spawn',
            data,
        };
    }

    private shouldIgnoreComponent0(component: Component): boolean {
        return ((component as HideableComponent).clientVisible === false) || !this.world.storages.get(component.type)?.sync;
    }
}

function mergeNullableArrays<T>(a?: T[], b?: T[]): T[] | undefined {
    if (a === undefined) return b;
    if (b === undefined) return a;
    a.push(...b);
    return a;
}
