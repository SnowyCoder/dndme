import {System} from "../../system";
import {DESTROY_ALL} from "../../../util/pixi";
import {PIXI_BOARD_TYPE, PixiBoardSystem} from "./pixi/pixiBoardSystem";
import {World} from "../../world";
import {LayerOrder} from "../../../phase/editMap/layerOrder";
import { Layer } from "@pixi/layers";

export const TEXT_TYPE = 'text';
export type TEXT_TYPE = typeof TEXT_TYPE;
export class TextSystem implements System {
    name = TEXT_TYPE;
    dependencies = [PIXI_BOARD_TYPE] as string[];

    private world: World;
    textLayer: Layer;

    constructor(world: World) {
        this.world = world;
        this.textLayer = new Layer();
    }

    enable() {
        this.textLayer.zIndex = LayerOrder.TEXT;
        this.textLayer.interactive = false;
        this.textLayer.interactiveChildren = false;

        let boardSys = this.world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
        boardSys.root.addChild(this.textLayer);
    }

    destroy(): void {
        this.textLayer.destroy(DESTROY_ALL);
    }
}
