import {Component, HideableComponent, HOST_HIDDEN_TYPE, MultiComponent} from "../../component";
import {AnyMapType, FrozenEntity, World} from "../../world";
import {Command, CommandKind} from "./command";
import {DeSpawnCommand} from "./despawnCommand";
import {SpawnCommand} from "./spawnCommand";
import {filterComponent, filterComponentKeepEntity} from "../../ecsUtil";

export function componentEditCommand(): ComponentEditCommand {
    return {
        kind: 'cedit',
        add: [],
        edit: [],
        remove: [],
    };
}

export interface ComponentEditCommand extends Command {
    kind: 'cedit';
    add: Component[];
    edit: Array<{
        entity: number;
        type: string;
        multiId?: number;
        changes: AnyMapType,
    }>;
    remove: Component[];
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
            add: [],
            edit: [],
            remove: [],
        } as ComponentEditCommand;
        for (let c of cmd.add) {
            inv.remove.push({
                entity: c.entity,
                type: c.type,
                multiId: (c as MultiComponent).multiId,
            } as MultiComponent);
            this.world.addComponent(c.entity, c);
        }
        for (let c of cmd.edit) {
            this.world.editComponent(c.entity, c.type, c.changes, c.multiId, false);
        }
        inv.edit = cmd.edit;
        for (let c of cmd.remove) {
            let component = this.world.getComponent(c.entity, c.type, (c as MultiComponent).multiId);
            if (component !== undefined) {
                this.world.removeComponent(component);
                inv.add.push(filterComponentKeepEntity(component));
            }
        }
        return inv;
    }

    stripClient(cmd: ComponentEditCommand): Command[] {
        let host_hidden = cmd.add.filter(x => x.type === HOST_HIDDEN_TYPE).map(x => x.entity);
        let non_host_hidden = cmd.remove.filter(x => x.type === HOST_HIDDEN_TYPE).map(x => x.entity);

        let predicate = (x: Component) => {
            if ((x as HideableComponent).clientVisible === false) return false;
            if (host_hidden.indexOf(x.entity) > -1) return false;
            if (non_host_hidden.indexOf(x.entity) > -1) return true;
            return this.world.getComponent(x.entity, HOST_HIDDEN_TYPE) === undefined;
        };
        // TODO: clientVisible

        let add = cmd.add.filter(predicate);
        let edit = cmd.edit.filter(predicate);
        let remove = cmd.remove.filter(x => x.type !== HOST_HIDDEN_TYPE && predicate(x));


        edit = edit.filter(x => {
            if (!('clientVisible' in x.changes)) return true;
            let orig = this.world.getComponent(x.entity, x.type, x.multiId) as HideableComponent;
            if (orig === undefined) return false;

            if (x.changes.clientVisible === false && orig.clientVisible !== false) {
                remove.push({
                    entity: x.entity,
                    type: x.type,
                    multiId: x.multiId,
                } as MultiComponent);
            } else if (x.changes.clientVisible !== false && orig.clientVisible === false) {
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
            res.push({
                kind: 'spawn',
                entities: non_host_hidden.map(x => this.createEntitySpawnPacket(x)),
            } as SpawnCommand);
        }
        if (add.length + edit.length + remove.length !== 0) {
            res.push({
                kind: 'cedit',
                add: add.map(clone),
                edit: edit.map(clone),
                remove: remove.map(clone),
            } as ComponentEditCommand);
        }

        return res;
    }

    merge(to: ComponentEditCommand, from: ComponentEditCommand): boolean {
        // TODO: from should remove entities added in to.
        //       handle entities edited in to but removed in from
        to.add.push(...from.add);
        to.remove.push(...from.remove);

        for (let x of from.edit) {
            let z = to.edit.find(y => x.entity === y.entity && x.type === y.type && x.multiId === y.multiId);
            if (z === undefined) {
                to.edit.push(x)
            } else {
                Object.assign(z.changes, x.changes);
            }
        }
        return true;
    }


    isNull(command: ComponentEditCommand): boolean {
        if (command.add.length + command.remove.length !== 0) return false;
        for (let edit of command.edit) {
            for (let c in edit.changes) {
                return false;
            }
        }
        return true;
    }

    private createEntitySpawnPacket(entity: number): FrozenEntity  {
        this.world.events.emit('serialize_entity', entity);
        let components = this.world.getAllComponents(entity);

        let comps = [];

        for (let comp of components) {
            if (this.shouldIgnoreComponent0(comp)) continue;
            comps.push(filterComponent(comp));
        }

        return {
            id: entity,
            components: comps,
        };
    }

    private shouldIgnoreComponent0(component: Component): boolean {
        return ((component as HideableComponent).clientVisible === false) || !this.world.storages.get(component.type)?.sync;
    }
}

// I hate JS
function clone<T>(x: T): T {
    return JSON.parse(JSON.stringify(x));
}