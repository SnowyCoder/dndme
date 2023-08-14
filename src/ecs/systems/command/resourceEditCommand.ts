import { ResourceForType, ResourceType } from "@/ecs/TypeRegistry";
import {Resource} from "../../resource";
import {AnyMapType, World} from "../../World";
import {Command, CommandKind} from "./command";

export interface ResourceEditCommand extends Command {
    kind: 'redit';
    add: Resource[];
    edit: {[T in ResourceType]?: Partial<ResourceForType<T>>};
    remove: ResourceType[];
}

export class ResourceEditCommandKind implements CommandKind {
    readonly kind = 'redit';
    private readonly world: World;

    constructor(world: World) {
        this.world = world;
    }

    applyInvert(cmd: ResourceEditCommand): ResourceEditCommand {
        let inv = {
            kind: 'redit',
            add: [],
            edit: [],
            remove: [],
        } as ResourceEditCommand;
        for (let c of cmd.add) {
            inv.remove.push(c.type);
            this.world.addResource(c);
        }
        for (let n in cmd.edit) {
            const name = n as ResourceType;
            // Data gets swapped with the changes
            let data = cmd.edit[name] as any;
            this.world.editResource(name, data);
        }
        inv.edit = cmd.edit;
        for (let c of cmd.remove) {
            const name = c as ResourceType;
            let res = this.world.getResource(name);
            if (res === undefined) continue;
            inv.add.push(res);
            this.world.removeResource(name);
        }
        return inv;
    }

    apply(cmd: ResourceEditCommand): void {
        this.applyInvert(cmd);
    }

    stripClient(cmd: ResourceEditCommand): Command[] {
        let add = cmd.add.filter(x => x._sync);
        let edit = {} as AnyMapType;

        let editc = 0;
        for (let type in cmd.edit) {
            if (this.world.getResource(type as ResourceType)?._sync) {
                editc += 1;
                edit[type] = cmd.edit[type as ResourceType];
            }
        }

        let remove = cmd.remove.filter(x => this.world.getResource(x)?._sync);

        if (add.length + editc + remove.length === 0) {
            return [];
        }
        return [{
            kind: 'redit',
            add, edit, remove,
        } as ResourceEditCommand]
    }

    merge(to: ResourceEditCommand, from: ResourceEditCommand, strict: boolean): boolean {
        if (strict) {
            if (to.add.length + to.remove.length + from.add.length + from.remove.length) {
                return false;
            }
            for (let k in from.edit) {
                if (!(k in to.edit)) return false;
            }
            for (let k in to.edit) {
                if (!(k in to.edit)) return false;
                const key = k as ResourceType;
                const fromKeys = Object.keys(from.edit[key] as any);
                const toKeys = Object.keys(to.edit[key] as any);
                if (fromKeys.length !== toKeys.length || !fromKeys.every(x => toKeys.includes(x))) return false;
            }
        }
        to.add.push(...from.add)
        to.remove.push(...from.remove)
        for (let type in from.edit) {
            const name = type as ResourceType;
            if (type in to.edit) {
                Object.assign(to.edit[name] as any, from.edit[name]);
            } else {
                to.edit[name] = from.edit[name] as any;
            }
        }
        return true;
    }

    isNull(command: ResourceEditCommand): boolean {
        if (command.add.length + command.remove.length !== 0) return false;
        for (let type in command.edit) {
            for (let _change in command.edit[type as ResourceType]) {
                return false;
            }
        }
        return true;
    }
}
