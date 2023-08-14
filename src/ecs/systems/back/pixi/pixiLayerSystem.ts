import {System} from "@/ecs/System";
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
} from "../LayerSystem";
import {World} from "@/ecs/World";
import {Component} from "@/ecs/component";
import {PIXI_BOARD_TYPE, PixiBoardSystem} from "./pixiBoardSystem";
import {Resource} from "@/ecs/resource";
import {ElementType, GRAPHIC_TYPE} from "@/graphics";
import { Group, Layer as PixiLayer } from "@pixi/layers";
import { RegisteredComponent } from "@/ecs/TypeRegistry";

export type CustomLayer = Layer & {
    _pixiLayer?: PixiLayer;
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

        this.pixiBoard = this.world.requireSystem(PIXI_BOARD_TYPE);
        this.pixiGraphic = this.world.requireSystem(PIXI_GRAPHIC_TYPE);
        this.layerSys = this.world.requireSystem(LAYER_TYPE);

        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('resource_edit', this.onResourceEdit, this);
    }

    private getLayer(layer: CustomLayer): PixiLayer {
        if (layer._pixiLayer === undefined) {
            const group = new Group(layer.priority, false);
            layer._pixiLayer = new PixiLayer(group);
            this.pixiBoard.root.addChild(layer._pixiLayer);
        }
        return layer._pixiLayer;
    }

    private updateLayer(layer: CustomLayer): PixiLayer {
        const pixiLayer = this.getLayer(layer);
        pixiLayer.group.zIndex = layer.priority;
        return pixiLayer;
    }

    private getParentLayer(layer: ParentLayerComponent | undefined): PixiLayer {
        let l = this.layerSys.getLayerById(layer === undefined ? -1 : layer.layer);
        return this.getLayer(l);
    }

    private getEntityParentLayer(entity: number): PixiLayer {
        return this.getParentLayer(this.world.getComponent(entity, PARENT_LAYER_TYPE));
    }

    private applyParent(obj: PixiDisplayElement, parent: Group) {
        if (obj.type !== ElementType.TEXT) {
            if (obj._pixi !== undefined) {
                obj._pixi.parentGroup = parent;
            }
        }
        for (let ch of obj.children ?? []) {
            this.applyParent(ch, parent);
        }
    }

    private onComponentAdd(cmp: RegisteredComponent): void {
        if (cmp.type === LAYER_TYPE) {
            const c = cmp as CustomLayer;
            this.updateLayer(c);
        } else if (cmp.type === PARENT_LAYER_TYPE) {
            const c = cmp;
            const g = this.pixiGraphic.storage.getComponent(cmp.entity);
            if (g === undefined) return;
            let parent = this.getParentLayer(c);
            this.applyParent(g.display as PixiDisplayElement, parent.group);
        } else if (cmp.type === GRAPHIC_TYPE) {
            const c = cmp;
            const parent = this.getEntityParentLayer(cmp.entity);
            this.applyParent(c.display as PixiDisplayElement, parent.group);
            c._layer = parent.group;
        }
    }

    private onComponentEdited(cmp: RegisteredComponent): void {
        if (cmp.type === PARENT_LAYER_TYPE) {
            const c = cmp;
            const g = this.pixiGraphic.storage.getComponent(cmp.entity);
            if (g === undefined) return;
            let parent = this.getParentLayer(c);
            this.applyParent(g.display as PixiDisplayElement, parent.group);
            g._layer = parent.group;
        } else if (cmp.type === LAYER_TYPE) {
            const c = cmp as CustomLayer;
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
