import {World} from "../World";
import {PointerDownEvent, PointerEvents, PointerMoveEvent, PointerUpEvent} from "../systems/back/pixi/pixiBoardSystem";
import {ToolPart} from "../systems/back/ToolSystem";
import {KEYBOARD_TYPE, KeyboardResource} from "../systems/back/KeyboardSystem";
import {MeasureResource} from "../resource";
import SafeEventEmitter from "../../util/safeEventEmitter";
import { snapPoint } from "./utils";
import { IPoint } from "@/geometry/point";
import { Point } from "pixi.js";


export const MEASURE_TYPE = "measure";
export type MEASURE_TYPE = typeof MEASURE_TYPE;
export class MeasureToolPart implements ToolPart {
    readonly name = MEASURE_TYPE;
    private readonly world: World;

    private startMeasure: IPoint = new Point();
    private lastMeasure: IPoint = new Point();
    private isDown: boolean = false;

    constructor(world: World) {
        this.world = world;
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
