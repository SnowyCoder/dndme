import {World} from "../world";
import PIXI from "../../PIXI";
import {PointerDownEvent, PointerEvents, PointerMoveEvent, PointerUpEvent} from "../systems/back/pixiBoardSystem";
import {ToolPart} from "../systems/back/toolSystem";
import {KEYBOARD_TYPE, KeyboardResource} from "../systems/back/keyboardSystem";
import {MeasureResource} from "../resource";
import SafeEventEmitter from "../../util/safeEventEmitter";
import { snapPoint } from "./utils";


export const MEASURE_TYPE = "measure";
export type MEASURE_TYPE = typeof MEASURE_TYPE;
export class MeasureToolPart implements ToolPart {
    readonly name = MEASURE_TYPE;
    private readonly world: World;
    private readonly keyboard: KeyboardResource;

    private startMeasure: PIXI.IPointData = new PIXI.Point();
    private lastMeasure: PIXI.IPointData = new PIXI.Point();
    private isDown: boolean = false;

    constructor(world: World) {
        this.world = world;
        this.keyboard = world.getResource(KEYBOARD_TYPE)! as KeyboardResource;
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

    onPointerDown(event: PointerDownEvent): void {
        if (event.consumed) return;
        event.consumed = true;

        this.isDown = true;
        this.startMeasure = snapPoint(this.world, event.boardPos);
        this.lastMeasure = this.startMeasure;

        this.pushRes();
    }

    onPointerUp(event: PointerUpEvent) {
        if (!this.isDown) return;
        this.isDown = false;

        this.lastMeasure = snapPoint(this.world, event.boardPos);

        this.pushRes();
    }

    onPointerMove(event: PointerMoveEvent): void {
        if (!this.isDown) return;

        this.lastMeasure = snapPoint(this.world, event.boardPos);

        this.pushRes();
    }

    onEnable(): void {
    }

    onDisable(): void {
        this.removeRes();
    }

    initialize(events: SafeEventEmitter) {
        events.on(PointerEvents.POINTER_DOWN, this.onPointerDown, this);
        events.on(PointerEvents.POINTER_UP, this.onPointerUp, this);
        events.on(PointerEvents.POINTER_MOVE, this.onPointerMove, this);
    }

    destroy() {
    }
}
