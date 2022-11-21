import {Component, HideableComponent, MultiComponent, SHARED_TYPE} from "../../component";
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

    apply(cmd: ComponentEditCommand): void {
        this.applyInvert(cmd);
    }

    stripClient(cmd: ComponentEditCommand): Command[] {
        // Get all of the new entitites that have been shown
        let shared = cmd.add?.filter(x => x.type === SHARED_TYPE).map(x => x.entity) ?? [];
        // Get all fof the new entities that have been un-shown (hidden)
        let unshared = cmd.remove?.filter(x => x.type === SHARED_TYPE).map(x => x.entity) ?? [];

        // Checks if a component is visible (a component is visible if clientVisible !== false and if it's shared)
        let predicate = (x: { entity: number, clientVisible?: boolean}) => {
            if (x.clientVisible === false) return false;
            if (unshared.includes(x.entity)) return false;
            if (shared.includes(x.entity)) return true;
            return this.world.getComponent(x.entity, SHARED_TYPE) !== undefined;
        };
        // Filters a component based on the old component, for example:
        // if the old component is hidden and the new edits do not change that, the component is filtered
        // if the old component is hidden and the new edits might change it, it's not hidden
        // if the old component is not hidden, it's not hidden
        let partialPredicate = (entity: number, type: string, multiId: number | undefined, changes: AnyMapType) => {
            let real = this.world.getComponent(entity, type, multiId)!;
            if ((real as HideableComponent).clientVisible === false && !('clientVisible' in changes)) return false;
            return predicate({ entity });
        }

        // get added components that are only visible to the client
        let add = cmd.add?.filter(x => x.type !== SHARED_TYPE && predicate(x));
        // get edited components that are only visible to the client
        let edit = cmd.edit?.filter(x => partialPredicate(x.entity, x.type, x.multiId, x.changes));
        // get removed components that are only visible to the client
        let remove = cmd.remove?.filter(x => partialPredicate(x.entity, x.type, (x as MultiComponent).multiId, {}));

        // If we set clientVisible === false in a component we need a way to remove it on the client
        //  and we also need to do the same thing in reverse
        // We need to propagate the changes in edit to add and remove components with clientVisible
        edit = edit?.filter(x => {
            // if the edits did not change the visibility the old filter has finished all of the work
            if (!('clientVisible' in x.changes)) return true;

            let orig = this.world.getComponent(x.entity, x.type, x.multiId) as HideableComponent;
            if (orig === undefined) return false;

            if (x.changes.clientVisible === false && orig.clientVisible !== false) {
                // if the edits have hidden the component (and it wasn't hidden already) then remove it
                remove = remove ?? [];
                remove.push({
                    entity: x.entity,
                    type: x.type,
                    multiId: x.multiId,
                } as MultiComponent);
            } else if (x.changes.clientVisible !== false && orig.clientVisible === false) {
                // If the edits have unhidden the component (and it was hidden before) then add it
                add = add ?? [];
                add.push(filterComponentKeepEntity(orig));
            }
            return false;
        })

        let res = new Array<Command>();
        if (unshared.length !== 0) {
            res.push({
                kind: 'despawn',
                entities: unshared,
            } as DeSpawnCommand)
        }
        if (shared.length !== 0) {
            res.push(this.createEntitySpawnPacket(shared));
        }
        if ((add?.length || 0) + (edit?.length || 0) + (remove?.length || 0) !== 0) {
            let cedit = {
                kind: 'cedit'
            } as ComponentEditCommand;
            if (add !== undefined && add.length > 0) cedit.add = add.map(objectClone);
            if (edit !== undefined && edit.length > 0) {
                cedit.edit = edit.map(objectClone);
                if (cmd.multi) cedit.multi = true;
            }
            if (remove !== undefined && remove.length > 0) cedit.remove = remove.map(objectClone);
            res.push(cedit);
        }

        return res;
    }

    merge(to: ComponentEditCommand, from: ComponentEditCommand, strict: boolean): boolean {
        if (to.multi !== from.multi) return false;
        if (strict) {
            if ((to.add?.length ?? 0) + (to.remove?.length  ?? 0) + (from.add?.length  ?? 0) + (from.remove?.length  ?? 0) +
                    Object.keys(to.pedit ?? {}).length + Object.keys(from.pedit ?? {}).length  ||
                from.edit === undefined || to.edit === undefined || from.edit.length !== to.edit.length) {
                return false;
            }
            for (let x of from.edit) {
                if (to.edit.find(y => x.entity === y.entity && x.type === y.type && x.multiId === y.multiId) === undefined) {
                    return false;
                }
            }
        }

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
            ignoreShared: true,
            only: new Set(entities),
        });
        return {
            kind: 'spawn',
            data,
        };
    }
}

function mergeNullableArrays<T>(a?: T[], b?: T[]): T[] | undefined {
    if (a === undefined) return b;
    if (b === undefined) return a;
    a.push(...b);
    return a;
}
