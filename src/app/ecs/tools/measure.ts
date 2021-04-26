import {World} from "../world";
import PIXI from "../../PIXI";
import {PointerClickEvent, PointerDownEvent, PointerMoveEvent, PointerUpEvent} from "../systems/back/pixiBoardSystem";
import {ToolDriver} from "../systems/back/toolSystem";
import {getMapPointFromMouseInteraction} from "./utils";
import {Tool} from "./toolType";
import {KEYBOARD_TYPE, KeyboardResource} from "../systems/back/keyboardSystem";
import {MEASURE_TYPE, MeasureResource} from "../resource";


export class MeasureToolDriver implements ToolDriver {
    readonly name = Tool.MEASURE;
    private readonly world: World;
    private readonly keyboard: KeyboardResource;

    private startMeasure: PIXI.IPoint = new PIXI.Point();
    private lastMeasure: PIXI.IPoint = new PIXI.Point();
    private isDown: boolean = false;

    constructor(world: World) {
        this.world = world;
        this.keyboard = world.getResource(KEYBOARD_TYPE)! as KeyboardResource;
    }

    onPointerClick(event: PointerClickEvent) {
    }

    pushRes() {
        this.world.addResource({
            type: MEASURE_TYPE,
            fromX: this.startMeasure.x,
            fromY: this.startMeasure.y,
            toX: this.lastMeasure.x,
            toY: this.lastMeasure.y,
            _save: false,
            _sync: false,
        } as MeasureResource, 'update');
    }

    removeRes() {
        this.world.removeResource(MEASURE_TYPE, false);
    }

    onPointerDown(event: PointerDownEvent) {
        event.consumed = true;

        this.isDown = true;
        this.startMeasure = getMapPointFromMouseInteraction(this.world, event);
        this.lastMeasure = this.startMeasure;

        this.pushRes();
    }

    onPointerUp(event: PointerUpEvent) {
        this.isDown = false;

        this.lastMeasure = getMapPointFromMouseInteraction(this.world, event);

        this.pushRes();
    }

    onPointerMove(event: PointerMoveEvent): void {
        if (!this.isDown) return;

        this.lastMeasure = getMapPointFromMouseInteraction(this.world, event);

        this.pushRes();
    }

    onEnd(): void {
        this.removeRes();
    }
}
