import {System} from "../system";
import PIXI from "../../PIXI";
import {app} from "../../index";
import {IHitArea} from "pixi.js";
import {World} from "../world";
import {Resource} from "../resource";
import {FOLLOW_MOUSE_TYPE, POSITION_TYPE} from "../component";
import {FlagEcsStorage} from "../storage";
import {getMapPointFromMouseInteraction} from "../tools/utils";

interface PointerData {
    firstX: number,
    firstY: number,
    lastX: number,
    lastY: number,
}

export enum PointerEvents {
    POINTER_MOVE = 'pointer_move',
    POINTER_DOWN = 'pointer_down',
    POINTER_UP = 'pointer_up',
    POINTER_RIGHT_DOWN = 'pointer_right_down',
    POINTER_RIGHT_UP = 'pointer_right_up',
    POINTER_CLICK = 'pointer_click',
}

export interface ConsumableEvent {
    consumed: boolean;
}

export interface HasLastPosition {
    lastPosition: PIXI.IPointData;
}

export type PointerDownEvent = PIXI.InteractionEvent & ConsumableEvent;
export type PointerUpEvent = PIXI.InteractionEvent & HasLastPosition;
export type PointerMoveEvent = PIXI.InteractionEvent & HasLastPosition;
export type PointerRightDownEvent = PIXI.InteractionEvent & ConsumableEvent;
export type PointerRightUpEvent = PIXI.InteractionEvent;
export type PointerClickEvent = PIXI.InteractionEvent;

export type BOARD_TRANSFORM_TYPE = 'board_transform';
export const BOARD_TRANSFORM_TYPE = 'board_transform';
export interface BoardTransformResource extends Resource {
    type: BOARD_TRANSFORM_TYPE;
    _save: true;
    _sync: false;

    posX: number;
    posY: number;
    scaleX: number;
    scaleY: number;
}

export type PIXI_BOARD_TYPE = 'pixi_board';
export const PIXI_BOARD_TYPE = 'pixi_board';
export class PixiBoardSystem implements System {
    name = PIXI_BOARD_TYPE;
    dependencies = [] as string[];

    world: World;

    board: PIXI.Container;

    private wheelListener: any;
    pointers = new Map<number, PointerData>();
    lastMouseDownTime?: number;
    isDraggingBoard: boolean = false;

    constructor(world: World) {
        this.world = world;

        this.world.events.addListener('req_board_center', this.centerBoard, this);
        this.world.events.addListener('resource_edited', this.onResourceEdited, this);

        this.world.addResource(
            {
                type: BOARD_TRANSFORM_TYPE,
                _save: true,
                _sync: false,
                posX: 0,
                posY: 0,
                scaleX: 1,
                scaleY: 1,
            } as BoardTransformResource
        );

        // TODO: we should create render phases, one for the world (using the projection matrix to move the camera)
        //       and the other for the GUI (or other things that do not depend on camera position, as the GridSystem(?)).
        //       to create a custom game loop: https://github.com/pixijs/pixi.js/wiki/v5-Custom-Application-GameLoop
        this.board = new PIXI.Container();
        this.board.interactive = false;
        this.board.interactiveChildren = false;
        this.board.position.set(0, 0);
        this.board.sortableChildren = true;
    }

    zoom(dScale: number, centerX: number, centerY: number) {
        const minScale = 0.05;
        const maxScale = 3;

        if (this.board.scale.x < minScale && dScale < 1 || this.board.scale.x > maxScale && dScale > 1)
            return;

        // Before scaling adjust the position:
        // Takes the vector that goes from the board position (upper-left) to the cursor.
        // Apply the dScale factor to that vector and find the new board position.
        // Finally, the cursor position plus the vector obtained is the new board position.

        let padX = this.board.position.x - centerX;
        let padY = this.board.position.y - centerY;

        padX *= dScale;
        padY *= dScale;

        const position = new PIXI.Point(padX + centerX, padY + centerY);
        const scale = new PIXI.Point(this.board.scale.x * dScale, this.board.scale.y * dScale);

        // TODO
        /*if (this.board.isBoardLost(position, scale)) {
            console.log("You can't no more scale in this direction, you're loosing the board!");
            return;
        }*/

        this.world.editResource(BOARD_TRANSFORM_TYPE, {
            posX: position.x,
            posY: position.y,
            scaleX: scale.x,
            scaleY: scale.y,
        } as BoardTransformResource);
    }

    /**
     * Function called when the mouse scrolls.
     * The map is zoomed in and out based on the scroll direction.
     */
    onMouseWheel(event: WheelEvent) {
        const scalingSpeed = 0.1;
        const dScale = 1 - Math.sign(event.deltaY) * scalingSpeed;
        this.zoom(dScale, event.clientX, event.clientY);
    }

    onPointerDown(event: PIXI.InteractionEvent) {
        if (event.data.pointerType === 'mouse' && event.data.button === 2) {
            // Right button
            let prde = event as PointerRightDownEvent;
            prde.consumed = false;
            this.world.events.emit(PointerEvents.POINTER_RIGHT_DOWN, prde);
            return;
        }

        let pos = event.data.global;
        this.pointers.set(event.data.pointerId, {
            firstX: pos.x,
            firstY: pos.y,
            lastX: pos.x,
            lastY: pos.y,
        } as PointerData);

        this.lastMouseDownTime = Date.now();

        let e = event as PointerDownEvent;
        e.consumed = false;
        this.world.events.emit(PointerEvents.POINTER_DOWN, event);

        if (!e.consumed && this.pointers.size === 1) {// TODO: better tool management
            this.isDraggingBoard = true;
        }
    }

    onPointerUp(event: PIXI.InteractionEvent): void {
        if (event.data.pointerType === 'mouse' && event.data.button === 2) {
            // Right button
            this.world.events.emit(PointerEvents.POINTER_RIGHT_UP, event);
        }

        let pdata = this.pointers.get(event.data.pointerId);
        if (pdata === undefined) return;

        this.pointers.delete(event.data.pointerId);

        if (this.lastMouseDownTime === undefined) return;

        if (this.pointers.size === 0) {
            this.isDraggingBoard = false;

            let now = Date.now();

            let timeDiff = now - this.lastMouseDownTime;

            let diffX = Math.abs(event.data.global.x - pdata.firstX);
            let diffY = Math.abs(event.data.global.y - pdata.firstY);
            let diffPos = Math.sqrt(diffX * diffX + diffY * diffY);

            let isClick = diffPos < 5 && timeDiff < 500;

            let pue = event as PointerUpEvent;
            pue.lastPosition = {
                x: pdata.lastX,
                y: pdata.lastY
            };
            this.world.events.emit(PointerEvents.POINTER_UP, pue);
            if (isClick) {
                this.world.events.emit(PointerEvents.POINTER_CLICK, event);
            }
        }
    }

    onPointerUpOutside(event: PIXI.InteractionEvent) {
        this.onPointerUp(event);
    }

    /** Function called when the cursor moves around the map. */
    onPointerMove(e: PIXI.InteractionEvent) {
        // TODO: magnet snap system
        let localPos = getMapPointFromMouseInteraction(this.world, e);
        this.updatePointerFollowers(localPos);

        let pdata = this.pointers.get(e.data.pointerId);
        if (pdata === undefined) return;

        let pos = e.data.global;
        if (this.pointers.size === 1) {// Move
            if (this.isDraggingBoard) {
                const newPosX = this.board.position.x + (pos.x - pdata.lastX);
                const newPosY = this.board.position.y + (pos.y - pdata.lastY);

                /*if (this.board.isBoardLost(new PIXI.Point(newPosX, newPosY), this.scale)) {
                    //console.log("You can't go further than this, you'll loose the board!");
                    return;
                }*/

                this.world.editResource(BOARD_TRANSFORM_TYPE, {
                    posX: newPosX,
                    posY: newPosY,
                } as BoardTransformResource);
            }

            let pme = e as PointerMoveEvent;
            pme.lastPosition = {
                x: pdata.lastX, y: pdata.lastY
            };
            this.world.events.emit(PointerEvents.POINTER_MOVE, pme);
        }

        let firstDist = 0;

        if (this.pointers.size === 2) {
            let [pa, pb] = this.pointers.values();

            let dx = pa.lastX - pb.lastX;
            let dy = pa.lastY - pb.lastY;
            firstDist = Math.sqrt(dx * dx + dy * dy);
        }

        pdata.lastX = pos.x;
        pdata.lastY = pos.y;

        if (this.pointers.size === 2) {
            let [pa, pb] = this.pointers.values();

            let dx = pa.lastX - pb.lastX;
            let dy = pa.lastY - pb.lastY;
            let secondDist = Math.sqrt(dx * dx + dy * dy);

            let center = new PIXI.Point(
                (pa.lastX + pb.lastX) / 2,
                (pa.lastY + pb.lastY) / 2,
            );
            this.zoom((secondDist / firstDist), center.x, center.y);
        }
    }

    private onResourceEdited(res: Resource, changes: any): void {
        if (res.type !== BOARD_TRANSFORM_TYPE) return;
        let t = res as BoardTransformResource;
        this.board.position.set(t.posX, t.posY);
        this.board.scale.set(t.scaleX, t.scaleY);
    }

    updatePointerFollowers(point: PIXI.IPointData) {
        for (let c of (this.world.storages.get(FOLLOW_MOUSE_TYPE) as FlagEcsStorage).allComponents()) {
            this.world.editComponent(c.entity, POSITION_TYPE, {
                x: point.x,
                y: point.y,
            });
        }
    }

    /**
     * Make the board's center and the window's center overlap.
     * This way the initial board position is centered to the root card.
     */
    centerBoard() {
        let boardScreenWidth = app.renderer.width;
        let boardScreenHeight = app.renderer.height;

        let screenMidPointWidth = boardScreenWidth / 2;
        let screenMidPointHeight = boardScreenHeight / 2;

        let bounds = this.board.getBounds();

        this.board.position.set(
            screenMidPointWidth - bounds.x - bounds.width / 2,
            screenMidPointHeight - bounds.y - bounds.height / 2
        );
    }

    applyCanvasStyle(canvas: HTMLCanvasElement) {
        const s = canvas.style;
        s.width = "100%";
        s.height = "100%";
    }

    enable(): void {
        const canvas = app.view;
        this.applyCanvasStyle(canvas);
        let cnt = document.getElementById('canvas-container');
        app.resizeTo = cnt;
        cnt.appendChild(canvas);

        //app.renderer.backgroundColor = 0x3e2723; // dark brown

        // PIXI
        let stage = new PIXI.display.Stage();
        app.stage = stage;
        stage.sortableChildren = true;
        stage.group.enableSort = true;
        stage.addChild(this.board);

        stage.interactive = true;
        stage.hitArea = {
            contains(x: number, y: number): boolean {
                return true;
            }
        } as IHitArea;

        app.stage.on("pointermove", this.onPointerMove, this);
        app.stage.on("pointerdown", this.onPointerDown, this);
        app.stage.on("pointerup", this.onPointerUp, this);
        app.stage.on("pointerupoutside", this.onPointerUpOutside, this);

        this.wheelListener = this.onMouseWheel.bind(this);
        canvas.addEventListener("wheel", this.wheelListener);
    }

    destroy(): void {
        app.stage.off("pointermove", this.onPointerMove, this);
        app.stage.off("pointerdown", this.onPointerDown, this);
        app.stage.off("pointerup", this.onPointerUp, this);
        app.stage.off("pointerupoutside", this.onPointerUpOutside, this);

        app.view.removeEventListener('wheel', this.wheelListener);

        let cnt = document.getElementById('canvas-container');
        cnt?.removeChild(app.view);
        app.resizeTo = undefined;
    }
}