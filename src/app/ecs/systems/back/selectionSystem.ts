import {DeserializeData, World} from "../../world";
import {
    Component, HOST_HIDDEN_TYPE, MultiComponent,
    NAME_TYPE,
    NameComponent,
    NOTE_TYPE,
    NoteComponent,
    POSITION_TYPE,
    PositionComponent
} from "../../component";
import {LIGHT_TYPE, LightComponent} from "../lightSystem";
import {PLAYER_TYPE, PlayerComponent} from "../playerSystem";
import {DOOR_TYPE, DoorComponent, DoorType} from "../doorSystem";
import {PROP_TELEPORT_TYPE, PROP_TYPE, PropTeleport} from "../propSystem";
import {System} from "../../system";
import {componentEditCommand, ComponentEditCommand, EditType} from "../command/componentEdit";
import {DeSpawnCommand} from "../command/despawnCommand";
import {Command, emitCommand, executeAndLogCommand} from "../command/command";
import {EVENT_COMMAND_LOG, EVENT_COMMAND_PARTIAL_END} from "../command/commandSystem";
import {WALL_TYPE} from "../wallSystem";
import {EcsStorage, SingleEcsStorage} from "../../storage";
import {PIN_TYPE} from "../pinSystem";
import {findForeground, PARENT_LAYER_TYPE, ParentLayerComponent} from "./layerSystem";
import {componentClone, generateRandomId} from "../../ecsUtil";
import {Resource} from "../../resource";
import {PIXI_BOARD_TYPE, PixiBoardSystem} from "./pixiBoardSystem";
import PIXI from "../../../PIXI";
import { EventCommand } from "../command/eventCommand";

const MULTI_TYPES = ['name', 'note'];
const ELIMINABLE_TYPES = ['name', 'note', 'player', 'light', 'door', PARENT_LAYER_TYPE];
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

export const SELECTION_UI_DATA_TYPE = 'selection_ui_data';
export type SELECTION_UI_DATA_TYPE = typeof SELECTION_UI_DATA_TYPE;
export interface SelectionUiData extends Resource {
    type: SELECTION_UI_DATA_TYPE;
    selectedEntities: Array<number>;
    components: Component[];
    hidden: boolean;
    addable: Array<AddComponent>;

    _save: false,
    _sync: false;
}

export const SELECTION_TYPE = 'selection';
export type SELECTION_TYPE = typeof SELECTION_TYPE;
export class SelectionSystem implements System {
    private readonly ecs: World;
    readonly name = SELECTION_TYPE;
    readonly dependencies = [PIXI_BOARD_TYPE] as string[];

    private boardSys: PixiBoardSystem;

    selectedEntities = new Set<number>();
    dataByType = new Map<string, TypeData>();
    translations: {[type: string]: string} = {};

    private isTranslating: boolean = false;
    private translateDirty: boolean = false;
    private uiResDirty: boolean = true;

    constructor(ecs: World) {
        this.ecs = ecs;

        this.boardSys = ecs.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;

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
        this.ecs.events.on('deserialized', (d: DeserializeData) => {
            if (d.options.thenSelect) {
                this.setOnlyEntities(d.data.entities.map(d.entityMapping));
            }
        });
        if (ecs.isMaster) {
            this.ecs.events.on('command_post_execute', (c: Command | undefined) => {
                // a spawn command has been executed
                if (c === undefined || c.kind !== 'despawn') return;
                this.setOnlyEntities((c as DeSpawnCommand).entities);
            });
            this.ecs.events.on('delete', () => {
                const cmd = {
                    kind: 'despawn',
                    entities: [...this.selectedEntities],
                } as DeSpawnCommand;
                this.clear();
                executeAndLogCommand(this.ecs, cmd);
            });
        }
        this.ecs.events.on('entity_despawn', this.onEntityDespawn, this);
        this.boardSys.ticker.add(this.onRender, this, PIXI.UPDATE_PRIORITY.LOW);

        this.setupTranslations();

        this.uiResDirty = true;
        this.onRender();
    }

    setupTranslations() {
        this.translations[PARENT_LAYER_TYPE] = 'foreground';
    }

    private onRender() {
        if (!this.uiResDirty) return;
        this.uiResDirty = false;

        let hostHidden = this.dataByType.get(HOST_HIDDEN_TYPE);

        this.ecs.addResource({
            type: SELECTION_UI_DATA_TYPE,
            selectedEntities: [...this.selectedEntities],
            components: this.getCommonComponents(),
            hidden: hostHidden !== undefined && hostHidden.entities.size === this.selectedEntities.size,
            addable: this.getAddableComponents(),
            _save: false,
            _sync: false,
        } as SelectionUiData, 'update');
    }

    updateUi() {
        this.uiResDirty = true;
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
        else {
            this.updateUi()
            this.ecs.events.emit('selection_update', this);
        }
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
            if (id === undefined) {
                console.warn("Trying to add undefined entity");
                continue;
            }
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
        return {
            _canDelete: ELIMINABLE_TYPES.indexOf(type) >= 0,
            _isFullscreen: FULLSCREENABLE_TYPES.indexOf(type) >= 0 ? false : undefined,
        };
    }

    private addTranslations(cmps: Component[]): Component[] {
        for (let cmp of cmps) {
            let trans = this.translations[cmp.type];
            if (trans === undefined) {
                trans = cmp.type;
            }

            (cmp as any).typeName = trans;
        }
        return cmps;
    }

    private storagePredicate(storage: EcsStorage<Component>): boolean {
        if (storage.type === HOST_HIDDEN_TYPE) return false;
        return storage.save && storage.sync;
    }

    private getSingleComponents(): Component[] {
        let res = new Array<Component>();
        let entity = this.selectedEntities.values().next().value;

        for (let storage of this.ecs.storages.values()) {
            if (!this.storagePredicate(storage)) continue;

            let comps = storage.getComponents(entity);
            for (let comp of comps) {
                let c =
                res.push(componentClone(removePrivate(this.initialComponent(storage.type), comp)));
            }
        }

        return this.addTranslations(res);
    }

    getCommonComponents(): Component[] {
        if (this.selectedEntities.size === 0) return [];

        let selCount = this.selectedEntities.size;

        if (selCount === 1) return this.getSingleComponents();
        let commonTypes = new Array<EcsStorage<Component>>();

        for (let sto of this.ecs.storages.values()) {
            if (!this.storagePredicate(sto)) continue;

            const type = sto.type;

            let data = this.dataByType.get(type);
            if (data != undefined && data.entities.size === selCount && MULTI_TYPES.indexOf(type) === -1) {
                commonTypes.push(sto);
            }
        }

        let res = new Array<Component>();

        for (let sto of commonTypes) {
            let component = undefined;
            for (let entity of this.selectedEntities) {
                let comps = sto.getComponents(entity);
                for (let comp of comps) {
                    if (component === undefined) {
                        component = removePrivate(this.initialComponent(sto.type), comp);// copy
                    } else {
                        biFilterObj(component, comp);
                    }
                }
            }
            res.push(componentClone(component));
        }

        return this.addTranslations(res);
    }

    getAddableComponents(): Array<AddComponent> {
        let res = new Array<AddComponent>();

        res.push(
            {
                type: NAME_TYPE,
                name: 'Name'
            }, {
               type: NOTE_TYPE,
               name: 'Note'
            }
        );

        if (!this.hasComponentType(PARENT_LAYER_TYPE)) {
            // TODO: layers
            res.push({
                type: PARENT_LAYER_TYPE,
                name: 'Foreground'
            });
        }

        if (this.hasEveryoneType(PIN_TYPE)) {
            if (!this.hasComponentType(LIGHT_TYPE)) {
                res.push({
                    type: LIGHT_TYPE,
                    name: 'Light',
                });
            }
            if (!this.hasComponentType(PLAYER_TYPE)) {
                res.push({
                    type: PLAYER_TYPE,
                    name: 'Player',
                });
            }
        } else if (this.hasEveryoneType(WALL_TYPE) && !this.hasComponentType(DOOR_TYPE)) {
            res.push({
                type: DOOR_TYPE,
                name: "Door"
            });
        } else if (this.hasEveryoneType(PROP_TYPE) && !this.hasComponentType(PROP_TELEPORT_TYPE)) {
            res.push({
                type: PROP_TELEPORT_TYPE,
                name: "Teleporter",
            });
        }

        return res;
    }

    setProperty(entities: number[], type: string, propertyName: string, propertyValue: any, multiId?: number): void {
        if (type === '$') {
            // Special management
            switch (propertyName) {
                case 'hidden': {
                    let add = [];
                    let remove = [];
                    for (let entity of entities) {
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
                        entities: [...entities],
                    } as DeSpawnCommand;
                    this.clear();
                    this.ecs.events.emit("command_log", cmd);
                    break;
                }
                case 'forget': {
                    const res = confirm("Do you want the roleplayers to forget " + this.selectedEntities.size + " entities?\nThis cannot be undone");
                    if (res) {
                        emitCommand(this.ecs, {
                            kind: 'event',
                            do: { name: 'forget', args: [{ entities: [...entities] }] },
                            undo: { name: '', args: [] },
                        } as EventCommand, true);
                    }
                    break;
                }
                case 'addComponent': {
                    let comp: Component;
                    switch (propertyValue) {
                        case NAME_TYPE:
                            comp = {
                                type: NAME_TYPE,
                                name: '',
                                clientVisible: true,
                                multiId: generateRandomId(),
                            } as NameComponent;
                            break;
                        case NOTE_TYPE:
                            comp = {
                                type: NOTE_TYPE,
                                note: '',
                                clientVisible: true,
                                multiId: generateRandomId(),
                            } as NoteComponent;
                            break;
                        case LIGHT_TYPE:
                            comp = {
                                type: LIGHT_TYPE,
                                color: 0xFFFFFF,
                                range: 8,
                            } as LightComponent;
                            break;
                        case PLAYER_TYPE:
                            comp = {
                                type: PLAYER_TYPE,
                                nightVision: false,
                                range: 50,
                            } as PlayerComponent;
                            break;
                        case DOOR_TYPE:
                            comp = {
                                type: DOOR_TYPE,
                                doorType: DoorType.NORMAL_LEFT,
                                locked: false,
                                open: false,
                                clientVisible: true,
                            } as DoorComponent;
                            break;
                        case PARENT_LAYER_TYPE:
                            comp = {
                                type: PARENT_LAYER_TYPE,
                                layer: findForeground(this.ecs),
                            } as ParentLayerComponent;
                            break;
                        case PROP_TELEPORT_TYPE:
                            comp = {
                                type: PROP_TELEPORT_TYPE,
                                targetProp: -1,
                            } as PropTeleport;
                            break;
                        default:
                            throw new Error('Cannot add unknown component: ' + propertyValue);
                    }
                    let add = [];
                    for (let entity of [...entities]) {
                        add.push(Object.assign({ entity }, comp));
                    }
                    this.ecs.events.emit("command_log", componentEditCommand(add));
                    break;
                }
                case 'removeComponent':
                    let remove = [];
                    for (let entity of [...entities]) {
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

        let edit = [];
        for (let entity of entities) {
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

    moveAll(diffX: number, diffY: number, entities: Iterable<number>) {
        let edit = [];

        let posSto = this.ecs.getStorage(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        for (let entity of entities) {
            let pos = posSto.getComponent(entity);
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
