import {World} from "../world";
import {
    Component, HOST_HIDDEN_TYPE, MultiComponent,
    NAME_TYPE,
    NameComponent,
    NOTE_TYPE,
    NoteComponent,
    POSITION_TYPE,
    PositionComponent
} from "../component";
import {LightComponent} from "./lightSystem";
import {PlayerComponent} from "./playerSystem";
import {DOOR_TYPE, DoorComponent, DoorType} from "./doorSystem";
import {PROP_TELEPORT_TYPE, PropTeleport} from "./propSystem";
import {System} from "../system";
import {componentEditCommand, ComponentEditCommand, EditType} from "./command/componentEdit";
import {DeSpawnCommand} from "./command/despawnCommand";
import {Command} from "./command/command";
import {EVENT_COMMAND_LOG, EVENT_COMMAND_PARTIAL_END} from "./command/commandSystem";
import {WALL_TYPE} from "./wallSystem";

const MULTI_TYPES = ['name', 'note'];
const ELIMINABLE_TYPES = ['name', 'note', 'player', 'light', 'door'];
const FULLSCREENABLE_TYPES = ['note'];

// name
// note -> note, position
// position
// room -> room, position
// bkg_img => bkg_img, position

// Possible configurations: (? = 0/1, * = 0+, like regex)
// (bkg_img, pos, transform, name*, notes*)
// (pin, pos, light|player, name*, notes*)
// (prop, pos, transform, teleport?, name*, notes*)
// (wall, pos, door?)

interface TypeData {
    entities: Set<Component>;
}

export interface AddComponent {
    type: string,
    name: string,
}

export type SELECTION_TYPE = 'selection';
export const SELECTION_TYPE = 'selection';
export class SelectionSystem implements System {
    private ecs: World;
    readonly name = SELECTION_TYPE;
    readonly dependencies = [] as string[];

    selectedEntities = new Set<number>();
    dataByType = new Map<string, TypeData>();

    private isTranslating: boolean = false;
    private translateDirty: boolean = false;

    constructor(ecs: World) {
        this.ecs = ecs;
        this.ecs.events.on('tool_move_begin', () => this.isTranslating = true);
        this.ecs.events.on('tool_move_end', () => {
            this.isTranslating = false;
            if (this.translateDirty) {
                this.translateDirty = false;
                this.ecs.events.emit(EVENT_COMMAND_PARTIAL_END);
                this.update();
            }
        });
        this.ecs.events.on('component_add', this.onComponentAdd, this);
        this.ecs.events.on('component_edited', this.onComponentUpdate, this);
        this.ecs.events.on('component_removed', this.onComponentRemove, this);
        this.ecs.events.on('entity_despawn', this.onEntityDespawn, this);
        if (ecs.isMaster) {
            this.ecs.events.on('command_post_execute', (c: Command | undefined) => {
                // a spawn command has been executed
                if (c === undefined || c.kind !== 'despawn') return;
                this.setOnlyEntities((c as DeSpawnCommand).entities);
            });
        }
        this.ecs.events.on('entity_despawn', this.onEntityDespawn, this);
    }

    logSelectionTypes() {
        console.log("--- SELECTION ---");
        for (let entity of this.selectedEntities) {
            let comps = this.ecs.getAllComponents(entity);
            console.log(entity + ": " + comps.map(x => x.type).join(', '));
        }
    }

    canSelect(entity: number): boolean {
        if (this.ecs.isMaster) {
            return true;
        }

        // Make walls not selectable unless a known door is present, this
        // prevents players from bruteforcing wall structures to find doors
        // TODO: other options: merge adiacent walls when possible
        let wallC = this.ecs.getComponent(entity, WALL_TYPE);
        if (wallC !== undefined) {
            let door = this.ecs.getComponent(entity, DOOR_TYPE);
            return door !== undefined;
        }

        return true;
    }

    update() {
        if (this.isTranslating) this.translateDirty = true;
        else this.ecs.events.emit('selection_update', this);
    }

    onComponentAdd(component: Component) {
        if (!this.selectedEntities.has(component.entity)) return;
        if (!this.canSelect(component.entity)) {
            this.removeEntities([component.entity]);
            return;
        }
        this.getOrCreateData(component.type).entities.add(component);
        this.update();
    }

    onComponentUpdate(component: Component) {
        if (this.selectedEntities.has(component.entity)) {
            if (!this.canSelect(component.entity)) {
                this.removeEntities([component.entity]);
                return;
            }
            this.update();
        }
    }

    onComponentRemove(component: Component) {
        if (!this.selectedEntities.has(component.entity)) return;
        let data = this.dataByType.get(component.type)!;
        data.entities.delete(component);
        if (data.entities.size === 0) this.dataByType.delete(component.type);

        if (!this.canSelect(component.entity)) {
            this.removeEntities([component.entity]);
            return;
        }

        this.update();
    }

    onEntityDespawn(entity: number) {
        if (!this.selectedEntities.has(entity)) return;
        this.removeEntities([entity]);
    }

    clear(callListeners: boolean = true, update: boolean = true) {
        if (callListeners) {
            for (let id of this.selectedEntities) {
                this.ecs.events.emit('selection_end', id);
            }
        }
        this.selectedEntities.clear();
        this.dataByType.clear();
        if (update) {
            this.update();
        }
    }

    setOnlyEntity(id: number): void {
        this.clear(true, false);
        this.addEntities([id]);
    }

    setOnlyEntities(ids: number[]): void {
        let idSet = new Set(ids);

        let removeIds = new Array<number>();
        for (let id of this.selectedEntities) {
            if (!idSet.has(id)) removeIds.push(id);
        }
        this.removeEntities(removeIds, false);
        this.addEntities(ids, false);
        this.update();
    }

    toggleEntities(ids: number[], update: boolean=true): void {
        for (let id of ids) {
            if (this.selectedEntities.has(id)) {
                this.removeEntities([id], false);
            } else {
                this.addEntities([id], false);
            }
        }
        if (update) this.update();
    }

    addEntities(ids: number[], update: boolean=true): void {
        let count = 0;
        for (let id of ids) {
            if (this.selectedEntities.has(id)) continue;
            if (!this.canSelect(id)) {
                continue;
            }
            count++;
            this.selectedEntities.add(id);

            let comps = this.ecs.getAllComponents(id);
            for (let c of comps) {
                this.getOrCreateData(c.type).entities.add(c);
            }
            this.ecs.events.emit('selection_begin', id);
        }
        if (update && count !== 0) this.update();
    }

    removeEntities(ids: number[], update: boolean=true): void {
        let count = 0;
        for (let id of ids) {
            if (!this.selectedEntities.has(id)) continue;
            count++;
            this.selectedEntities.delete(id)
            let comps = this.ecs.getAllComponents(id);
            for (let c of comps) {
                let data = this.dataByType.get(c.type)!;
                data.entities.delete(c);
                if (data.entities.size === 0) this.dataByType.delete(c.type);
            }
            this.ecs.events.emit('selection_end', id);
        }
        if (update && count !== 0) this.update();
    }

    getSelectedByType(type: string): Iterable<Component> {
        let data = this.dataByType.get(type);
        if (data === undefined) return [];
        return data.entities;
    }

    private initialComponent(type: string): Object {
        let storage = this.ecs.storages.get(type)!;
        return {
            _canDelete: ELIMINABLE_TYPES.indexOf(type) >= 0,
            _isFullscreen: FULLSCREENABLE_TYPES.indexOf(type) >= 0 ? false : undefined,
            _sync: storage.sync,
            _save: storage.save,
        };
    }

    private getSingleComponents(): Component[] {
        let res = new Array<Component>();
        let entity = this.selectedEntities.values().next().value;

        for (let [type, storage] of this.ecs.storages.entries()) {
            if (type.startsWith('host_')) continue;

            let comps = storage.getComponents(entity);
            for (let comp of comps) {
                res.push(removePrivate(this.initialComponent(type), comp));
            }
        }

        return res;
    }

    getCommonComponents(): Component[] {
        if (this.selectedEntities.size === 0) return [];

        let selCount = this.selectedEntities.size;

        if (selCount === 1) return this.getSingleComponents();
        let commonTypes = new Array<string>();

        for (let type of this.ecs.storages.keys()) {
            if (type === 'host_hidden') continue;

            let data = this.dataByType.get(type);
            if (data != undefined && data.entities.size === selCount && MULTI_TYPES.indexOf(type) === -1) {
                commonTypes.push(type);
            }
        }

        let res = new Array<Component>();

        for (let type of commonTypes) {
            if (type === 'host_hidden') continue;
            let component = undefined;
            for (let entity of this.selectedEntities) {
                let comps = this.ecs.storages.get(type)!.getComponents(entity);
                for (let comp of comps) {
                    if (component === undefined) {
                        component = removePrivate(this.initialComponent(type), comp);// copy
                    } else {
                        biFilterObj(component, comp);
                    }
                }
            }
            res.push(component);
        }

        return res;
    }

    getCommonEntityOpts(): any {
        let hostHidden = this.dataByType.get('host_hidden');

        return {
            hidden: hostHidden !== undefined && hostHidden.entities.size === this.selectedEntities.size,
            ids: Array.from(this.selectedEntities),
        };
    }

    getAddableComponents(): Array<AddComponent> {
        let res = new Array<AddComponent>();

        res.push(
            {
                type: 'name',
                name: 'Name'
            }, {
               type: 'note',
               name: 'Note'
            }
        );

        if (this.hasEveryoneType('pin') && !(this.hasComponentType('light') || this.hasComponentType('player'))) {
            res.push({
                type: 'light',
                name: 'Light'
            }, {
                type: 'player',
                name: 'Player',
            });
        } else if (this.hasEveryoneType('wall') && !this.hasComponentType('door')) {
            res.push({
                type: "door",
                name: "Door"
            });
        } else if (this.hasEveryoneType('prop') && !this.hasComponentType('prop_teleport')) {
            res.push({
                type: 'prop_teleport',
                name: "Teleporter",
            });
        }

        return res;
    }

    setProperty(type: string, propertyName: string, propertyValue: any, multiId?: number): void {
        if (type === '$') {
            // Special management
            switch (propertyName) {
                case 'hidden': {
                    let add = [];
                    let remove = [];
                    for (let entity of this.selectedEntities) {
                        let cmp = this.ecs.getComponent(entity, HOST_HIDDEN_TYPE);

                        if (cmp !== undefined) {
                            remove.push({
                                type: HOST_HIDDEN_TYPE,
                                entity: entity,
                            });
                            this.ecs.removeComponent(cmp);
                        } else {
                            add.push({
                                type: HOST_HIDDEN_TYPE,
                                entity: entity,
                            });
                        }
                    }
                    let cmd = {
                        kind: "cedit",
                        add, remove,
                        edit: [],
                    } as ComponentEditCommand;
                    this.ecs.events.emit("command_log", cmd);
                    break;
                }
                case 'delete': {
                    let cmd = {
                        kind: 'despawn',
                        entities: [...this.selectedEntities],
                    } as DeSpawnCommand;
                    this.clear();
                    this.ecs.events.emit("command_log", cmd);
                    break;
                }
                case 'addComponent': {
                    let comp: Component;
                    switch (propertyValue) {
                        case 'name':
                            comp = {
                                type: NAME_TYPE,
                                name: '',
                                clientVisible: true,
                            } as NameComponent;
                            break;
                        case 'note':
                            comp = {
                                type: NOTE_TYPE,
                                note: '',
                                clientVisible: true,
                            } as NoteComponent;
                            break;
                        case 'light':
                            comp = {
                                type: 'light',
                                color: 0xFFFFFF,
                                range: 2,
                            } as LightComponent;
                            break;
                        case 'player':
                            comp = {
                                type: 'player',
                                nightVision: false,
                                range: 50,
                            } as PlayerComponent;
                            break;
                        case 'door':
                            comp = {
                                type: 'door',
                                doorType: DoorType.NORMAL_LEFT,
                                locked: false,
                                open: false,
                                clientVisible: true,
                            } as DoorComponent;
                            break;
                        case 'prop_teleport':
                            comp = {
                                type: PROP_TELEPORT_TYPE,
                                entity: -1,
                                targetProp: -1,
                            } as PropTeleport;
                            break;
                        default:
                            throw 'Cannot add unknown component: ' + propertyValue;
                    }
                    let add = [];
                    for (let entity of [...this.selectedEntities]) {
                        add.push(Object.assign({ entity }, comp));
                    }
                    this.ecs.events.emit("command_log", componentEditCommand(add));
                    break;
                }
                case 'removeComponent':
                    let remove = [];
                    for (let entity of [...this.selectedEntities]) {
                        let comp = this.ecs.getComponent(entity, propertyValue, multiId);
                        if (comp === undefined) continue;
                        remove.push({
                            type: comp.type,
                            entity: comp.entity,
                            multiId: multiId,
                        } as MultiComponent);
                    }
                    let cmd = componentEditCommand(undefined, undefined, remove);
                    this.ecs.events.emit("command_log", cmd);
                    break;
                default:
                    console.warn("Unknown special event: " + propertyName);
            }
            return;
        } else if (type === '@') {
            // Event call (yeah I know this is ugly) TODO please next me clean it up
            // TODO: command log
            this.ecs.events.emit(propertyName, propertyValue, multiId);
            return;
        }

        if (!this.hasEveryoneType(type)) {
            this.logSelectionTypes();
            console.error("Trying to change type of selection when not everyone has that type: " + type);
        }
        let oldEntities = Array.from(this.selectedEntities);
        let edit = [];
        for (let entity of oldEntities) {
            let changes = {} as any;
            changes[propertyName] = propertyValue;
            edit.push({
                type,
                entity,
                multiId,
                changes
            });
        }
        let cmd = {
            kind: 'cedit',
            edit,
        } as ComponentEditCommand;
        this.ecs.events.emit("command_log", cmd);
        this.update();
    }

    moveAll(diffX: number, diffY: number) {
        let edit = [];

        for (let entity of this.selectedEntities) {
            let pos = this.ecs.getComponent(entity, POSITION_TYPE) as PositionComponent;
            if (pos === undefined) continue;

            edit.push({
                type: POSITION_TYPE,
                entity: entity,
                changes: {
                    x: pos.x + diffX,
                    y: pos.y + diffY,
                },
            });
        }

        let cmd = {
            kind: 'cedit',
            edit,
        } as ComponentEditCommand;
        // partial = isTranslating (and ignore the results)
        this.ecs.events.emit(EVENT_COMMAND_LOG, cmd, undefined, this.isTranslating);
        if (this.isTranslating) this.translateDirty = true;
        else this.update();
    }

    private getOrCreateData(type: string): TypeData {
        let data = this.dataByType.get(type);
        if (data === undefined) {
            data = {
                entities: new Set<Component>(),
            } as TypeData;
            this.dataByType.set(type, data);
        }
        return data;
    }

    hasComponentType(type: string): boolean {
        let data = this.dataByType.get(type);
        if (data === undefined) return false;
        return data.entities.size > 0;
    }

    hasEveryoneType(type: string): boolean {
        let data = this.dataByType.get(type);
        if (data === undefined) return false;
        return data.entities.size === this.selectedEntities.size;
    }


    enable(): void {
    }

    destroy(): void {
    }
}

function removePrivate(target: any, filter: any): any {
    for (let name in filter) {
        if (name[0] === '_') continue;
        target[name] = filter[name];
    }
    return target;
}

function biFilterObj(target: any, filter: any): void {
    for (let name in filter) {
        if (name[0] === '_') continue;
        if (target[name] !== filter[name]) {
            target[name] = undefined;
        }
    }
    for (let name in target) {
        if (name[0] === '_') continue;
        if (filter[name] === undefined) {
            target[name] = undefined;
        }
    }
}


