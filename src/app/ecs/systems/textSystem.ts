import {System} from "../system";
import {World} from "../ecs";
import PIXI from "../../PIXI";
import {DESTROY_ALL} from "../../util/pixi";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {app} from "../../index";

export class TextSystem implements System {
    readonly ecs: World;

    textLayer: PIXI.display.Layer;

    constructor(world: World) {
        this.ecs = world;
    }

    enable() {
        this.textLayer = new PIXI.display.Layer();
        this.textLayer.zIndex = EditMapDisplayPrecedence.TEXT;
        this.textLayer.interactive = false;
        this.textLayer.interactiveChildren = false;

        app.stage.addChild(this.textLayer);
    }

    destroy(): void {
        this.textLayer.destroy(DESTROY_ALL);
    }
}