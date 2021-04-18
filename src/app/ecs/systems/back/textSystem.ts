import {System} from "../../system";
import PIXI from "../../../PIXI";
import {DESTROY_ALL} from "../../../util/pixi";
import {DisplayPrecedence} from "../../../phase/editMap/displayPrecedence";
import {PIXI_BOARD_TYPE, PixiBoardSystem} from "./pixiBoardSystem";
import {World} from "../../world";

export const TEXT_TYPE = 'text';
export type TEXT_TYPE = typeof TEXT_TYPE;
export class TextSystem implements System {
    name = TEXT_TYPE;
    dependencies = [PIXI_BOARD_TYPE] as string[];

    private world: World;
    textLayer: PIXI.display.Layer;

    constructor(world: World) {
        this.world = world;
        this.textLayer = new PIXI.display.Layer();
    }

    enable() {
        this.textLayer.zIndex = DisplayPrecedence.TEXT;
        this.textLayer.interactive = false;
        this.textLayer.interactiveChildren = false;

        let boardSys = this.world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
        boardSys.root.addChild(this.textLayer);
    }

    destroy(): void {
        this.textLayer.destroy(DESTROY_ALL);
    }
}