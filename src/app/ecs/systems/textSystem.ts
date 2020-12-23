import {System} from "../system";
import PIXI from "../../PIXI";
import {DESTROY_ALL} from "../../util/pixi";
import {DisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {app} from "../../index";

export class TextSystem implements System {

    textLayer: PIXI.display.Layer;

    constructor() {
    }

    enable() {
        this.textLayer = new PIXI.display.Layer();
        this.textLayer.zIndex = DisplayPrecedence.TEXT;
        this.textLayer.interactive = false;
        this.textLayer.interactiveChildren = false;

        app.stage.addChild(this.textLayer);
    }

    destroy(): void {
        this.textLayer.destroy(DESTROY_ALL);
    }
}