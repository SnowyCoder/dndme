import {System} from "../../system";
import {World} from "../../world";
import {Resource} from "../../resource";
import {Component, SerializedFlag, SERIALIZED_TYPE, SharedFlag, SHARED_TYPE} from "../../component";
import {SingleEcsStorage} from "../../storage";
import {DeSpawnCommand} from "../command/despawnCommand";
import {commandRegisterPreConsequence, emitCommand} from "../command/command";
import {LayerOrder} from "../../../phase/editMap/layerOrder";
import { SpawnCommandKind } from "../command/spawnCommand";
import { ComponentInfoPanel, COMPONENT_INFO_PANEL_TYPE } from "./selectionUiSystem";


import EcsLayer from "@/ui/ecs/EcsLayer.vue";

export const LAYER_TYPE = "layer";
export type LAYER_TYPE = typeof LAYER_TYPE;

export interface Layer {
    entity: number;
    name?: string;
    priority: number;
    locked: boolean;
}


export const PARENT_LAYER_TYPE = "layer_p";
export type PARENT_LAYER_TYPE = typeof PARENT_LAYER_TYPE;
export interface ParentLayerComponent extends Component {
    type: PARENT_LAYER_TYPE;
    layer: number;
}

export interface LayerComponent extends Component, Layer {
    type: LAYER_TYPE,
}


export const BACKGROUND_LAYER_TYPE = "layer_bkg";
export type BACKGROUND_LAYER_TYPE = typeof BACKGROUND_LAYER_TYPE;
export interface BackgroundLayerResource extends Resource, Layer {
    type: BACKGROUND_LAYER_TYPE;

    _save: true,
    _sync: true,
}

export const SELECTED_LAYER_TYPE = "layer_sel";
export type SELECTED_LAYER_TYPE = typeof SELECTED_LAYER_TYPE;
export interface SelectedLayerResource extends Resource {
    layer?: number;
}


export class LayerSystem implements System {
    readonly name = LAYER_TYPE;
    readonly dependencies = [];
    readonly optionalDependencies = [];

    private readonly world: World;

    layerStorage = new SingleEcsStorage<LayerComponent>(LAYER_TYPE);
    parentStorage = new SingleEcsStorage<ParentLayerComponent>(PARENT_LAYER_TYPE);

    backgroundLayer: BackgroundLayerResource;
    selectedLayer: SelectedLayerResource;
    layerByName = new Map<string, Layer>();

    // TODO: optimize clear

    constructor(world: World) {
        this.world = world;

        this.backgroundLayer = {
            type: BACKGROUND_LAYER_TYPE,
            entity: -1,
            name: "Background",
            priority: LayerOrder.BACKGROUND,
            locked: true,
            _save: true,
            _sync: true,
        } as BackgroundLayerResource;
        this.selectedLayer = {
            type: SELECTED_LAYER_TYPE,
            layer: -1,
        } as SelectedLayerResource;

        world.addStorage(this.layerStorage);
        world.addStorage(this.parentStorage);
        world.addResource(this.backgroundLayer);
        world.addResource(this.selectedLayer);

        const events = world.events;
        events.on('component_add', this.onComponentAdd, this);
        events.on('component_edited', this.onComponentEdited, this);
        events.on('component_remove', this.onComponentRemove, this);
        events.on('resource_edited', this.onResourceEdited, this);

        if (world.isMaster) {
            events.on('populate', () => {
                this.world.spawnEntity({
                    type: COMPONENT_INFO_PANEL_TYPE,
                    entity: -1,
                    component: PARENT_LAYER_TYPE,
                    name: 'Foreground',
                    removable: true,
                    panel: EcsLayer,
                    panelPriority: 1000,
                    addEntry: {
                        blacklist: [PARENT_LAYER_TYPE],
                        component: (entity: number) => {
                            return [{
                                type: PARENT_LAYER_TYPE,
                                entity,
                                layer: findForeground(this.world),
                            } as ParentLayerComponent];
                        }
                    }
                } as ComponentInfoPanel);
            });
        }
    }

    private onLayerEdited(l: Layer, edits: any): void {
        if ('name' in edits) {
            let oldName = edits.name;
            if (oldName !== undefined) {
                this.layerByName.delete(oldName);
            }
            if (l.name !== undefined) {
                if (this.layerByName.has(l.name)) {
                    console.warn("Layer name conflict");
                    l.name = undefined;
                    return;
                }
                this.layerByName.set(l.name, l);
            }
        }
    }

    private onComponentAdd(c: Component): void {
        if (c.type === LAYER_TYPE) {
            let l = c as LayerComponent;
            if (l.name !== undefined) {
                this.layerByName.set(l.name, l);
            }
        }
    }

    private onComponentEdited(c: Component, edited: any): void {
        if (c.type === LAYER_TYPE) {
            this.onLayerEdited(c as LayerComponent, edited);
        }
    }

    private onComponentRemove(c: Component): void {
        if (c.type === LAYER_TYPE) {
            let l = c as LayerComponent;
            let cmd = {
                kind: 'despawn',
                entities: [],
            } as DeSpawnCommand;
            for (let child of this.parentStorage.allComponents()) {
                if (child.layer !== l.entity) continue;
                cmd.entities.push(child.entity);
            }
            if (cmd.entities.length !== 0) {
                commandRegisterPreConsequence(this.world, cmd);
            }
        }
    }

    private onResourceEdited(r: Resource, edited: any): void {
        if (r.type === BACKGROUND_LAYER_TYPE) {
            this.onLayerEdited(r as BackgroundLayerResource, edited);
        }
    }

    getEntityLayer(entity: number): Layer {
        let cmp = this.parentStorage.getComponent(entity);
        if (cmp === undefined) {
            return this.backgroundLayer;
        }

        let layer = this.layerStorage.getComponent(cmp.layer);
        if (layer === undefined) {
            console.warn("Invalid parent layer of " + cmp.entity + ": " + cmp.layer);
            return this.backgroundLayer;
        }
        return layer;
    }

    getLayerById(id: number): Layer {
        if (id === -1) return this.backgroundLayer;

        let layer = this.layerStorage.getComponent(id);
        if (layer === undefined) {
            console.warn("Invalid layer id: " + id);
            return this.backgroundLayer;
        }
        return layer;
    }

    enable(): void {

    }

    destroy(): void {

    }
}

export function findForeground(world: World): number {
    let sto = world.getStorage(LAYER_TYPE);
    if (sto === undefined) return -1;
    for (let x of sto.getComponents()) {
        return x.entity;// There's only 1 layer for now (foreground)
    }
    // If it's not present we need to create it
    let cmd = SpawnCommandKind.from(world, [
        {
            type: SERIALIZED_TYPE,
        } as SerializedFlag,
        {
            type: SHARED_TYPE
        } as SharedFlag,
        {
            type: LAYER_TYPE,
            name: 'Foreground',
            priority: LayerOrder.FOREGROUND,
            locked: false,
        } as LayerComponent
    ]);

    emitCommand(world, cmd, true);
    return cmd.data.entities[0];
}
