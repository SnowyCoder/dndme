import {System} from "../../System";
import {DESTROY_ALL} from "../../../util/pixi";
import {PIXI_BOARD_TYPE} from "./pixi/pixiBoardSystem";
import {World} from "../../World";
import {LayerOrder} from "../../../phase/editMap/layerOrder";
import { Layer } from "@/pixi";

export const TEXT_TYPE = 'text';
export type TEXT_TYPE = typeof TEXT_TYPE;
export class TextSystem implements System {
    readonly name = TEXT_TYPE;
    readonly dependencies = [PIXI_BOARD_TYPE];

    private world: World;
    textLayer: Layer;

    constructor(world: World) {
        this.world = world;
        this.textLayer = new Layer();
    }

    enable() {
        this.textLayer.zIndex = LayerOrder.TEXT;

        let boardSys = this.world.requireSystem(PIXI_BOARD_TYPE);
        boardSys.root.addChild(this.textLayer);
    }

    destroy(): void {
        this.textLayer.destroy(DESTROY_ALL);
    }
}
