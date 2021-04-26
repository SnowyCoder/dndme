import {System} from "../../system";
import {PIXI_GRAPHIC_TYPE, PixiDisplayElement, PixiGraphicComponent, PixiGraphicSystem} from "./pixiGraphicSystem";
import {
    BACKGROUND_LAYER_TYPE,
    BackgroundLayerResource,
    Layer,
    LAYER_TYPE,
    LayerComponent,
    LayerSystem,
    PARENT_LAYER_TYPE,
    ParentLayerComponent
} from "./layerSystem";
import {World} from "../../world";
import {Component} from "../../component";
import {PIXI_BOARD_TYPE, PixiBoardSystem} from "./pixiBoardSystem";
import {Resource} from "../../resource";
import {ElementType} from "../../../graphics";

export type CustomLayer = Layer & {
    _pixiLayer?: PIXI.display.Layer;
};

export const PIXI_LAYER_TYPE = 'pixi_layer';
export type PIXI_LAYER_TYPE = 'pixi_layer';
export class PixiLayerSystem implements System {
    readonly dependencies = [PIXI_BOARD_TYPE, PIXI_GRAPHIC_TYPE, LAYER_TYPE];
    readonly name = PIXI_LAYER_TYPE;

    private readonly world: World;
    private readonly pixiBoard: PixiBoardSystem;
    private readonly pixiGraphic: PixiGraphicSystem;
    private readonly layerSys: LayerSystem;

    constructor(world: World) {
        this.world = world;

        this.pixiBoard = this.world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
        this.pixiGraphic = this.world.systems.get(PIXI_GRAPHIC_TYPE) as PixiGraphicSystem;
        this.layerSys = this.world.systems.get(LAYER_TYPE) as LayerSystem;

        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('resource_edit', this.onResourceEdit, this);
    }

    private getLayer(layer: CustomLayer): PIXI.display.Layer {
        if (layer._pixiLayer === undefined) {
            const group = new PIXI.display.Group(layer.priority, false);
            layer._pixiLayer = new PIXI.display.Layer(group);
            this.pixiBoard.root.addChild(layer._pixiLayer);
        }
        return layer._pixiLayer;
    }

    private updateLayer(layer: CustomLayer): PIXI.display.Layer {
        const pixiLayer = this.getLayer(layer);
        pixiLayer.group.zIndex = layer.priority;
        return pixiLayer;
    }

    private getParentLayer(layer: ParentLayerComponent | undefined): PIXI.display.Layer {
        let l = this.layerSys.getLayerById(layer === undefined ? -1 : layer.layer);
        return this.getLayer(l);
    }

    private getEntityParentLayer(entity: number): PIXI.display.Layer {
        return this.getParentLayer(this.world.getComponent(entity, PARENT_LAYER_TYPE) as ParentLayerComponent | undefined);
    }

    private applyParent(obj: PixiDisplayElement, parent: PIXI.display.Group) {
        if (obj.type !== ElementType.TEXT) {
            if (obj._pixi !== undefined) {
                obj._pixi.parentGroup = parent;
            }
        }
        for (let ch of obj.children ?? []) {
            this.applyParent(ch, parent);
        }
    }

    private onComponentAdd(cmp: Component): void {
        if (cmp.type === LAYER_TYPE) {
            const c = cmp as LayerComponent as CustomLayer;
            this.updateLayer(c);
        } else if (cmp.type === PARENT_LAYER_TYPE) {
            const c = cmp as ParentLayerComponent;
            const g = this.pixiGraphic.storage.getComponent(cmp.entity);
            if (g === undefined) return;
            let parent = this.getParentLayer(c);
            this.applyParent(g.display as PixiDisplayElement, parent.group);
        } else if (cmp.type === PIXI_GRAPHIC_TYPE) {
            const c = cmp as PixiGraphicComponent;
            const parent = this.getEntityParentLayer(cmp.entity);
            this.applyParent(c.display as PixiDisplayElement, parent.group);
            c._layer = parent.group;
        }
    }

    private onComponentEdited(cmp: Component): void {
        if (cmp.type === PARENT_LAYER_TYPE) {
            const c = cmp as ParentLayerComponent;
            const g = this.pixiGraphic.storage.getComponent(cmp.entity);
            if (g === undefined) return;
            let parent = this.getParentLayer(c);
            this.applyParent(g.display as PixiDisplayElement, parent.group);
            g._layer = parent.group;
        } else if (cmp.type === LAYER_TYPE) {
            const c = cmp as LayerComponent as CustomLayer;
            this.updateLayer(c);
        }
    }

    private onComponentRemove(cmp: Component) {
        if (cmp.type === LAYER_TYPE) {
            const c = cmp as LayerComponent as CustomLayer;
            if (c._pixiLayer !== undefined) {
                c._pixiLayer.destroy();
                c._pixiLayer = undefined;
            }
        } else if (cmp.type === PARENT_LAYER_TYPE) {
            const g = this.pixiGraphic.storage.getComponent(cmp.entity);
            if (g === undefined) return;
            const layer = this.getParentLayer(undefined);
            this.applyParent(g.display, layer.group);
            g._layer = layer.group;
        }
    }

    private onResourceEdit(res: Resource) {
        if (res.type === BACKGROUND_LAYER_TYPE) {
            const r = res as BackgroundLayerResource as CustomLayer;
            this.updateLayer(r);
        }
    }

    enable(): void {
        this.updateLayer(this.layerSys.backgroundLayer as CustomLayer);
    }

    destroy(): void {
    }
}