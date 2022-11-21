import {System} from "@/ecs/system";
import * as PIXI from "pixi.js";
import {IHitArea, Container} from "pixi.js";
import {World} from "@/ecs/world";
import {Resource} from "@/ecs/resource";
import {FOLLOW_MOUSE_TYPE, POSITION_TYPE} from "@/ecs/component";
import {FlagEcsStorage} from "@/ecs/storage";
import {findEntitiesAt, getBoardPosFromOrigin, snapPoint} from "@/ecs/tools/utils";
import {KEYBOARD_KEY_DOWN, KEYBOARD_TYPE, KeyboardResource} from "../keyboardSystem";
import {addCustomBlendModes} from "@/util/pixi";
import {DEFAULT_BACKGROUND} from "@/ecs/systems/lightSystem";
import {LayerOrder} from "@/phase/editMap/layerOrder";
import { Group, Layer, Stage } from "@pixi/layers";
import { IPoint } from "@/geometry/point";

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

export interface PointerInteractionEvent {
    globalPos: IPoint;
    boardPos: IPoint;
    pointerId: number;
    pointerType: string;
    originalEvent: MouseEvent | TouchEvent | PointerEvent;
    // lazy and cached
    entitiesHovered: () => number[];
}

export interface ConsumableEvent {
    consumed: boolean;
}

export interface HasLastPosition {
    lastPosition: IPoint;
}

export type PointerDownEvent = PointerInteractionEvent & ConsumableEvent & {
    // If set to true after the event the interaction will be used to drag the map around
    consumeDragBoard: boolean;
};
export type PointerUpEvent = PointerInteractionEvent & HasLastPosition & ConsumableEvent & {
    isInside: boolean;
    isClick: boolean;
};
export type PointerMoveEvent = PointerInteractionEvent & HasLastPosition & {
    canBecomeClick: boolean;
};
export type PointerRightDownEvent = PointerInteractionEvent & ConsumableEvent;
export type PointerRightUpEvent = PointerInteractionEvent & ConsumableEvent;
export type PointerClickEvent = PointerInteractionEvent & ConsumableEvent;

export const BOARD_TRANSFORM_TYPE = 'board_transform';
export type BOARD_TRANSFORM_TYPE = typeof BOARD_TRANSFORM_TYPE;
export interface BoardTransformResource extends Resource {
    type: BOARD_TRANSFORM_TYPE;
    _save: true;
    _sync: false;

    posX: number;
    posY: number;
    scaleX: number;
    scaleY: number;
}

export const BOARD_SIZE_TYPE = 'board_size';
export type BOARD_SIZE_TYPE = typeof BOARD_SIZE_TYPE;
export interface BoardSizeResource extends Resource {
    type: BOARD_SIZE_TYPE;
    _save: false;
    _sync: false;

    width: number;
    height: number;
}

export const GAME_CLOCK_TYPE = 'game_clock';
export type GAME_CLOCK_TYPE = typeof GAME_CLOCK_TYPE;
export interface GameClockResource extends Resource {
    type: GAME_CLOCK_TYPE;
    _save: false;
    _sync: false;

    frame: number;
    timestampMs: number;
    elapsedMs: number;
    ticker: PIXI.Ticker;
}

export type PIXI_BOARD_TYPE = 'pixi_board';
export const PIXI_BOARD_TYPE = 'pixi_board';
export class PixiBoardSystem implements System {
    name = PIXI_BOARD_TYPE;
    dependencies = [] as string[];

    world: World;

    renderer: PIXI.Renderer;
    ticker: PIXI.Ticker;
    clock: GameClockResource;
    private resizeReqId?: number;

    root: Stage;
    board: Container;
    toolForegroundGroup: Group;

    private wheelListener: any;
    private resizeListener: any;
    pointers = new Map<number, PointerData>();
    mouseLastX: number = 0;
    mouseLastY: number = 0;
    lastMouseDownTime?: number;
    isDraggingBoard: boolean = false;

    constructor(world: World) {
        this.world = world;

        this.world.events.on('req_board_center', this.centerBoard, this);
        this.world.events.on('resource_edited', this.onResourceEdited, this);
        this.world.events.on(KEYBOARD_KEY_DOWN, this.onKeyDown, this);

        this.world.addResource({
            type: BOARD_TRANSFORM_TYPE,
            _save: true,
            _sync: false,
            posX: 0,
            posY: 0,
            scaleX: 1,
            scaleY: 1,
        } as BoardTransformResource);

        this.ticker = new PIXI.Ticker();
        this.clock = {
            type: GAME_CLOCK_TYPE,
            frame: 0,
            timestampMs: 0,
            elapsedMs: this.ticker.elapsedMS,
            ticker: this.ticker,
            _save: false,
            _sync: false,
        } as GameClockResource;
        this.world.addResource(this.clock);

        this.world.addResource({
            type: BOARD_SIZE_TYPE,
            _save: false,
            _sync: false,
            width: 100,
            height: 100,
        } as BoardSizeResource);

        // We cannot work without webgl
        PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;
        this.renderer = new PIXI.Renderer({
            backgroundColor: DEFAULT_BACKGROUND,
            backgroundAlpha: 1,
            useContextAlpha: false,
            powerPreference: 'low-power',
        });
        addCustomBlendModes(this.renderer);
        this.renderer.view.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        this.root = new Stage();
        this.root.interactive = false;
        this.root.interactiveChildren = false;
        this.root.sortableChildren = true;
        this.root.group.enableSort = true;

        this.root.interactive = true;
        this.root.hitArea = {
            contains(x: number, y: number): boolean {
                return true;
            }
        } as IHitArea;

        this.ticker.add(() => {
            this.world.editResource(GAME_CLOCK_TYPE, {
                frame: this.clock.frame + 1,
                timestampMs: Date.now(),
                elapsedMs: this.ticker.elapsedMS,
            })
            this.renderer.render(this.root);
        }, PIXI.UPDATE_PRIORITY.LOW);

        // TODO: we should create render phases, one for the world (using the projection matrix to move the camera)
        //       and the other for the GUI (or other things that do not depend on camera position, as the GridSystem(?)).
        //       to create a custom game loop: https://github.com/pixijs/pixi.js/wiki/v5-Custom-Application-GameLoop
        this.board = new PIXI.Container();
        this.board.interactive = false;
        this.board.interactiveChildren = false;
        this.board.position.set(0, 0);
        this.board.sortableChildren = true;

        this.toolForegroundGroup = new Group(LayerOrder.TOOLS, false);
        const toolLayer = new Layer(this.toolForegroundGroup);
        toolLayer.interactive = false;
        toolLayer.interactiveChildren = false;
        this.root.addChild(toolLayer);

        this.root.addChild(this.board);
    }

    onKeyDown(key: string) {
        let keyboard = this.world.getResource(KEYBOARD_TYPE) as KeyboardResource | undefined;
        if (keyboard === undefined) return;

        let ctrl = keyboard.ctrl;
        let shift = keyboard.shift;
        let event_name = undefined;

        if (ctrl) {
            switch (key) {
                case 'z':
                    if (shift) event_name = 'command_redo';
                    else event_name = 'command_undo';
                    break;
                case 'y': event_name = 'command_redo';  break;
            }
        } else {
            switch (key) {
                case 'delete':
                    event_name = 'delete';
                    break;
            }
        }
        if (event_name !== undefined) {
            this.world.events.emit(event_name);
        }
    }

    toGeneralEvent(pixi: PIXI.InteractionEvent): PointerInteractionEvent {
        const boardPos = getBoardPosFromOrigin(this.world, pixi);

        let hoveredCache: number[] | undefined = undefined;
        const entitiesHovered = () => {
            if (hoveredCache === undefined) {
                hoveredCache = findEntitiesAt(this.world, boardPos, true);
            }
            return hoveredCache;
        }

        return {
            globalPos: pixi.data.global,
            boardPos,
            pointerId: pixi.data.pointerId,
            pointerType: pixi.data.pointerType,
            originalEvent: pixi.data.originalEvent,
            entitiesHovered,
        } as PointerInteractionEvent;
    }

    canBecomeClick(pdata: PointerData, p: IPoint) {
        let now = Date.now();

        let timeDiff = now - (this.lastMouseDownTime || 0);

        let diffX = p.x - pdata.firstX;
        let diffY = p.y - pdata.firstY;
        let diffPos = Math.sqrt(diffX * diffX + diffY * diffY);

        return diffPos < 5 && timeDiff < 500;
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
            let prde = this.toGeneralEvent(event) as PointerRightDownEvent;
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

        let e = this.toGeneralEvent(event) as PointerDownEvent;
        e.consumed = false;
        e.consumeDragBoard = false;
        if (event.data.pointerType === 'mouse' && event.data.button === 1) {
            // If middle button is pressed ignore, we force it to drag the board
            // (and prevent the paste event)
            event.data.originalEvent.preventDefault();
            event.data.originalEvent.stopPropagation();
            e.consumeDragBoard = true;// middle click to drag is always enabled
        } else {
            this.world.events.emit(PointerEvents.POINTER_DOWN, e);
        }

        if (e.consumeDragBoard && this.pointers.size === 1) {
            this.isDraggingBoard = true;
        }
    }

    onPointerUp(event: PIXI.InteractionEvent, isInside: boolean = true): void {
        const e = this.toGeneralEvent(event) as PointerUpEvent;
        e.isInside = isInside;

        if (event.data.pointerType === 'mouse' && event.data.button === 2) {
            // Right button
            this.world.events.emit(PointerEvents.POINTER_RIGHT_UP, e as PointerRightUpEvent);
        } else if (event.data.pointerType === 'mouse' && event.data.button === 1) {
            // If middle button is pressed ignore, we force it to drag the board
            // (and prevent the paste event)
            event.data.originalEvent.preventDefault();
            event.data.originalEvent.stopPropagation();
            // of course every browser ignores the preventDefault so we have to ignore it ourself
            this.world.events.emit('ignore_next_paste');
        }

        let pdata = this.pointers.get(event.data.pointerId);
        if (pdata === undefined) return;

        this.pointers.delete(event.data.pointerId);

        if (this.lastMouseDownTime === undefined) return;

        if (this.pointers.size === 0) {
            this.isDraggingBoard = false;

            let isClick = this.canBecomeClick(pdata, event.data.global);

            let pue = e as PointerUpEvent;
            pue.lastPosition = {
                x: pdata.lastX,
                y: pdata.lastY
            };
            pue.isClick = isClick;
            pue.consumed = false;
            this.world.events.emit(PointerEvents.POINTER_UP, pue);
            if (isClick) {
                let pce = pue as PointerClickEvent;
                this.world.events.emit(PointerEvents.POINTER_CLICK, pce);
            }
        }
    }

    onPointerUpOutside(event: PIXI.InteractionEvent) {
        this.onPointerUp(event, false);
    }

    /** Function called when the cursor moves around the map. */
    onPointerMove(e: PIXI.InteractionEvent) {
        let pos = e.data.global;
        let event = this.toGeneralEvent(e);

        // TODO: magnet snap system
        let localPos = snapPoint(this.world, event.boardPos);
        this.updatePointerFollowers(localPos);

        let pdata = this.pointers.get(e.data.pointerId);

        if (this.pointers.size <= 1 && !this.isDraggingBoard) {
            let pme = event as PointerMoveEvent;
            pme.lastPosition = {
                x: this.mouseLastX, y: this.mouseLastY,
            };
            pme.canBecomeClick = pdata === undefined ? false : this.canBecomeClick(pdata, pos);
            this.world.events.emit(PointerEvents.POINTER_MOVE, pme);
            this.mouseLastX = pos.x;
            this.mouseLastY = pos.y;
        }

        if (pdata === undefined) return;

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

    updatePointerFollowers(point: IPoint) {
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
        let boardScreenWidth = this.renderer.width;
        let boardScreenHeight = this.renderer.height;

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

    resize() {
        if (this.resizeReqId !== undefined) return;
        this.resizeReqId = requestAnimationFrame(this.doResize.bind(this));
    }

    private doResize() {
        if (this.resizeReqId !== undefined) {
            this.resizeReqId = undefined;
        }
        let { clientWidth, clientHeight } = this.renderer.view;
        this.renderer.resize(clientWidth, clientHeight);
        this.world.editResource(BOARD_SIZE_TYPE, {
            width: clientWidth,
            height: clientHeight,
        });
    }

    enable(): void {
        const canvas = this.renderer.view;
        this.applyCanvasStyle(canvas);
        let cnt = document.getElementById('canvas-container');
        if (cnt === null) {
            throw new Error("Cannot find canvas container");
        }
        cnt.replaceChildren(canvas)
        cnt.appendChild(canvas);

        // PIXI
        this.root.on("pointermove", this.onPointerMove, this);
        this.root.on("pointerdown", this.onPointerDown, this);
        this.root.on("pointerup", this.onPointerUp, this);
        this.root.on("pointerupoutside", this.onPointerUpOutside, this);

        this.wheelListener = this.onMouseWheel.bind(this);
        canvas.addEventListener("wheel", this.wheelListener);
        this.resizeListener = this.resize.bind(this);
        window.addEventListener("resize", this.resizeListener);

        this.resize();
        this.ticker.start();
    }

    destroy(): void {
        this.ticker.stop();
        window.removeEventListener("resize", this.resizeListener);

        this.root.off("pointermove", this.onPointerMove, this);
        this.root.off("pointerdown", this.onPointerDown, this);
        this.root.off("pointerup", this.onPointerUp, this);
        this.root.off("pointerupoutside", this.onPointerUpOutside, this);

        this.renderer.view.removeEventListener('wheel', this.wheelListener);

        let cnt = document.getElementById('canvas-container');
        cnt?.removeChild(this.renderer.view);
    }
}
