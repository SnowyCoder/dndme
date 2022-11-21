import {Resource} from "../../resource";
import {AnyMapType, World} from "../../world";
import {Command, CommandKind} from "./command";

export interface ResourceEditCommand extends Command {
    kind: 'redit';
    add: Resource[];
    edit: {[type: string]: any};
    remove: string[];
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
        for (let name in cmd.edit) {
            // Data gets swapped with the changes
            let data = cmd.edit[name];
            this.world.editResource(name, data);
        }
        inv.edit = cmd.edit;
        for (let c of cmd.remove) {
            let res = this.world.getResource(c);
            if (res === undefined) continue;
            inv.add.push(res);
            this.world.removeResource(c);
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
            if (this.world.getResource(type)?._sync) {
                editc += 1;
                edit[type] = cmd.edit[type];
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
                const fromKeys = Object.keys(from.edit[k]);
                const toKeys = Object.keys(to.edit[k]);
                if (fromKeys.length !== toKeys.length || !fromKeys.every(x => toKeys.includes(x))) return false;
            }
        }
        to.add.push(...from.add)
        to.remove.push(...from.remove)
        for (let type in from.edit) {
            if (type in to.edit) {
                Object.assign(to.edit[type], from.edit[type]);
            } else {
                to.edit[type] = from.edit[type];
            }
        }
        return true;
    }

    isNull(command: ResourceEditCommand): boolean {
        if (command.add.length + command.remove.length !== 0) return false;
        for (let type in command.edit) {
            for (let _change in command.edit[type]) {
                return false;
            }
        }
        return true;
    }
}
