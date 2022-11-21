
import { VueComponent } from "@/ui/vue";
import { Component, MultiComponent, NameComponent, NAME_TYPE, NoteComponent, NOTE_TYPE, POSITION_TYPE, SHARED_TYPE, TRANSFORM_TYPE } from "@/ecs/component";
import { System } from "../../system";
import { World } from "../../world";
import { SelectionSystem, SELECTION_TYPE } from "./selectionSystem";
import { Resource } from "../../resource";
import { PixiBoardSystem, PIXI_BOARD_TYPE } from "./pixi/pixiBoardSystem";
import PIXI from "@/PIXI";
import { componentEditCommand, ComponentEditCommand } from "../command/componentEdit";
import { DeSpawnCommand } from "../command/despawnCommand";
import { emitCommand } from "../command/command";
import { EventCommand } from "../command/eventCommand";
import { EcsStorage, SingleEcsStorage } from "../../storage";
import { generateRandomId } from "../../ecsUtil";

import EcsName from "@/ui/ecs/EcsName.vue";
import EcsNote from "@/ui/ecs/EcsNote.vue";
import EcsPosition from "@/ui/ecs/EcsPosition.vue";
import EcsTransform from "@/ui/ecs/EcsTransform.vue";
import { arrayFilterInPlace } from "../../../util/array";

export const COMPONENT_INFO_PANEL_TYPE = 'component_info_panel';
export type COMPONENT_INFO_PANEL_TYPE = typeof COMPONENT_INFO_PANEL_TYPE;
export interface ComponentInfoPanel extends Component {
    type: COMPONENT_INFO_PANEL_TYPE;
    // component type
    component: string;
    // Displayed name
    name: string;
    // Sidebar panel (props pased: component)
    panel: VueComponent;
    panelPriority?: number;
    hidePanels?: string[];
    // (only used in single components)
    // If true then it is open
    isOpen?: boolean;
    // if present will open the elements by default (for multi-elements)
    isDefaultOpen?: boolean;
    // Is this component removable? (default: false)
    removable?: boolean;
    // If this field is not present there will not be an add entry (ex. you can't add a position component, but you can always add a note)
    addEntry?: {
        // Every entity in the selection must have this component
        whitelist?: string[];
        // No entity in the selection must have this component
        blacklist?: string[];
        // Custom condition!
        when?: (sys: SelectionSystem) => boolean;
        component: (x: number) => Component[];
    };
}

export interface AddComponent {
    type: string,
    name: string,
}

export const SELECTION_UI_TYPE = 'selection_ui';
export type SELECTION_UI_TYPE = typeof SELECTION_UI_TYPE;
export interface SelectionUiData extends Resource {
    type: SELECTION_UI_TYPE;
    selectedEntities: Array<number>;
    components: Component[];
    hidden: boolean;
    addable: Array<AddComponent>;

    _save: false,
    _sync: false;
}


export class SelectionUiSystem implements System {
    private readonly world: World;
    readonly name = SELECTION_UI_TYPE;
    readonly dependencies = [PIXI_BOARD_TYPE, SELECTION_TYPE] as string[];

    private readonly selectionSys: SelectionSystem;

    private uiResDirty: boolean = true;

    storage = new SingleEcsStorage<ComponentInfoPanel>(COMPONENT_INFO_PANEL_TYPE, false, false);
    private panelInfos = new Map<string, ComponentInfoPanel>();

    public constructor(world: World) {
        this.world = world;

        this.world.addStorage(this.storage);

        const boardSys = world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
        this.selectionSys = world.systems.get(SELECTION_TYPE) as SelectionSystem;

        boardSys.ticker.add(this.onRender, this, PIXI.UPDATE_PRIORITY.LOW);

        this.world.events.on('selection_update', this.updateUi, this);
        this.world.events.on('component_add', this.onComponentAdd, this);
        this.world.events.on('component_remove', this.onComponentRemove, this);

        if (world.isMaster) {
            world.events.on('populate', () => {
                this.world.spawnEntity({
                    type: COMPONENT_INFO_PANEL_TYPE,
                    entity: -1,
                    component: POSITION_TYPE,
                    name: 'Position',
                    panel: EcsPosition,
                    panelPriority: 500,
                } as ComponentInfoPanel);
                this.world.spawnEntity({
                    type: COMPONENT_INFO_PANEL_TYPE,
                    entity: -1,
                    component: TRANSFORM_TYPE,
                    name: 'Transform',
                    panel: EcsTransform,
                    panelPriority: 400,
                } as ComponentInfoPanel);
                this.world.spawnEntity({
                    type: COMPONENT_INFO_PANEL_TYPE,
                    entity: -1,
                    component: NAME_TYPE,
                    name: 'Name',
                    removable: true,
                    panel: EcsName,
                    panelPriority: 2000,
                    isDefaultOpen: true,
                    addEntry: {
                        component: (entity: number) => {
                            return [{
                                type: NAME_TYPE,
                                entity,
                                name: '',
                                clientVisible: true,
                                multiId: generateRandomId(),
                            } as NameComponent];
                        },
                    }
                } as ComponentInfoPanel);
                this.world.spawnEntity({
                    type: COMPONENT_INFO_PANEL_TYPE,
                    entity: -1,
                    component: NOTE_TYPE,
                    name: 'Note',
                    removable: true,
                    panel: EcsNote,
                    panelPriority: -110,
                    isDefaultOpen: false,
                    addEntry: {
                        component: (entity: number) => {
                            return [{
                                type: NOTE_TYPE,
                                entity,
                                note: '',
                                clientVisible: true,
                                multiId: generateRandomId(),
                            } as NoteComponent];
                        },
                    }
                } as ComponentInfoPanel);
            });
        }

        this.uiResDirty = true;
        this.onRender();
    }

    private onComponentAdd(c: Component) {
        if (c.type === COMPONENT_INFO_PANEL_TYPE) {
            const comp = c as ComponentInfoPanel;
            this.panelInfos.set(comp.component, comp);
            comp.isOpen = comp.isDefaultOpen ?? true;
        }
    }

    private onComponentRemove(c: Component) {
        if (c.type === COMPONENT_INFO_PANEL_TYPE) {
            const comp = c as ComponentInfoPanel;
            this.panelInfos.delete(comp.component);
        }
    }

    updateUi() {
        this.uiResDirty = true;
    }

    private onRender() {
        if (!this.uiResDirty) return;
        this.uiResDirty = false;

        const shared = this.selectionSys.dataByType.get(SHARED_TYPE);
        const selectedEntities = this.selectionSys.selectedEntities;

        this.world.addResource({
            type: SELECTION_UI_TYPE,
            selectedEntities: [...selectedEntities],
            components: this.getCommonComponents(),
            hidden: shared === undefined || shared.entities.size !== selectedEntities.size,
            addable: this.getAddableComponents(),
            _save: false,
            _sync: false,
        } as SelectionUiData, 'update');
    }

    private initialComponent(info: ComponentInfoPanel): Object {
        return {
            _canDelete: !!info.removable,
            _panel: info.panel,
            _name: info.name,
            _infoPanelId: info.entity,
            _open: info.isOpen ?? info.isDefaultOpen,
        };
    }

    private sortSidebarComponents(c: Component[]): Component[] {
        // reversed (higher priority means top!)
        c.sort((a, b) => (this.panelInfos.get(b.type)!.panelPriority ?? 0) - (this.panelInfos.get(a.type)!.panelPriority ?? 0));
        return c;
    }

    private getSingleComponents(): Component[] {
        const res = new Array<Component>();
        const entity = this.selectionSys.selectedEntities.values().next().value;
        // Should we use a set? I think that it introduces more overhead than necessary
        // (there should be at most 1-3 strings in this array at most)
        const hidden = new Array<string>();

        for (let storage of this.world.storages.values()) {
            const info = this.panelInfos.get(storage.type);
            if (info === undefined) continue;

            const comps = storage.getComponents(entity);
            for (let comp of comps) {
                hidden.push(...info.hidePanels ?? []);
                res.push(removePrivate(this.initialComponent(info), comp));
            }
        }
        if (hidden.length > 0) {
            arrayFilterInPlace(res, x =>!hidden.includes(x.type));
        }

        return this.sortSidebarComponents(res);
    }

    getCommonComponents(): Component[] {
        const selectedEntities = this.selectionSys.selectedEntities;
        if (selectedEntities.size === 0) return [];

        const selCount = selectedEntities.size;

        if (selCount === 1) return this.getSingleComponents();
        const commonTypes = new Array<EcsStorage<Component>>();
        const hidden = new Array<String>();

        for (let sto of this.world.storages.values()) {
            const info = this.panelInfos.get(sto.type);
            if (info === undefined) continue;

            const type = sto.type;

            let data = this.selectionSys.dataByType.get(type);
            if (data != undefined && info.hidePanels) {
                hidden.push(...info.hidePanels);
            }
            if (data != undefined && data.entities.size === selCount && !sto.isMulti) {
                commonTypes.push(sto);
            }
        }
        arrayFilterInPlace(commonTypes, x => !hidden.includes(x.type));

        const res = new Array<Component>();

        for (let sto of commonTypes) {
            const info = this.panelInfos.get(sto.type)!;
            let component = undefined;
            for (let entity of selectedEntities) {
                let comps = sto.getComponents(entity);
                for (let comp of comps) {
                    if (component === undefined) {
                        component = removePrivate(this.initialComponent(info), comp);// copy
                    } else {
                        biFilterObj(component, comp);
                    }
                }
            }
            res.push(component);
        }

        return this.sortSidebarComponents(res);
    }

    getAddableComponents(): Array<AddComponent> {
        let res = new Array<AddComponent>();

        for (const info of this.storage.getComponents()) {
            const entry = info.addEntry;
            if (entry === undefined) continue;
            if (entry.whitelist !== undefined && !entry.whitelist.every(x => this.selectionSys.hasEveryoneType(x))) {
                continue;
            }
            if (entry.blacklist !== undefined && entry.blacklist.some(x => this.selectionSys.hasComponentType(x))) {
                continue;
            }
            if (entry.when !== undefined && !entry.when(this.selectionSys)) {
                continue;
            }
            res.push({
                type: info.component,
                name: info.name,
            });
        }

        return res;
    }

    setProperty(entities: number[], type: string, propertyName: string, propertyValue: any, multiId?: number): void {
        //console.log("setProperty(" + entities + "," + type + "," + propertyName + "," + propertyValue + "," + multiId + ")");
        if (type === '$') {
            // Special management
            switch (propertyName) {
                case 'hidden': {
                    let add = [];
                    let remove = [];
                    for (let entity of entities) {
                        let cmp = this.world.getComponent(entity, SHARED_TYPE);

                        if (cmp !== undefined) {
                            remove.push({
                                type: SHARED_TYPE,
                                entity: entity,
                            });
                        } else {
                            add.push({
                                type: SHARED_TYPE,
                                entity: entity,
                            });
                        }
                    }
                    let cmd = {
                        kind: "cedit",
                        add, remove,
                        edit: [],
                    } as ComponentEditCommand;
                    this.world.events.emit("command_log", cmd);
                    break;
                }
                case 'delete': {
                    let cmd = {
                        kind: 'despawn',
                        entities: [...entities],
                    } as DeSpawnCommand;
                    this.selectionSys.clear();
                    this.world.events.emit("command_log", cmd);
                    break;
                }
                case 'forget': {
                    const res = confirm("Do you want the roleplayers to forget " + this.selectionSys.selectedEntities.size + " entities?\nThis cannot be undone");
                    if (res) {
                        emitCommand(this.world, {
                            kind: 'event',
                            do: { name: 'forget', args: [{ entities: [...entities] }] },
                            undo: { name: '', args: [] },
                        } as EventCommand, true);
                    }
                    break;
                }
                case 'addComponent': {
                    const info = this.panelInfos.get(propertyValue)!;

                    if (info === undefined) {
                        console.warn("Error: cannot add component of type " + propertyValue + ": unknown");
                        return;
                    }

                    let add = [];
                    for (let entity of [...entities]) {
                        add.push(...info.addEntry!.component(entity));
                    }
                    this.world.events.emit("command_log", componentEditCommand(add));
                    break;
                }
                case 'removeComponent':
                    let remove = [];
                    for (let entity of [...entities]) {
                        let comp = this.world.getComponent(entity, propertyValue, multiId);
                        if (comp === undefined) continue;
                        remove.push({
                            type: comp.type,
                            entity: comp.entity,
                            multiId: multiId,
                        } as MultiComponent);
                    }
                    let cmd = componentEditCommand(undefined, undefined, remove);
                    this.world.events.emit("command_log", cmd);
                    break;
                default:
                    console.warn("Unknown special event: " + propertyName);
            }
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
        this.world.events.emit("command_log", cmd);
        this.selectionSys.update();
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
