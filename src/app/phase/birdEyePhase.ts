import {Phase} from "./phase";
import {Board} from "../game/board";
import * as PIXI from "pixi.js";
import {app, windowEventEmitter} from "../index";
import {GridOptions, GridType, STANDARD_GRID_OPTIONS} from "../game/grid";
import {EcsTracker} from "../ecs/ecs";
import {registerCommonStorage} from "../ecs/component";
import {GridSystem} from "../ecs/systems/gridSystem";


export class BirdEyePhase extends Phase {
    ecs: EcsTracker;
    board: Board;

    lastMouseDownTime?: number;
    lastMouseDownPos?: PIXI.IPoint;

    isDraggingBoard: boolean = false;

    gridSystem: GridSystem;

    private wheelListener: any;

    constructor(name: string) {
        super(name);

        this.ecs = new EcsTracker();

        this.board = new Board();
        this.board.position.set(0, 0);
        this.board.zIndex = 100;
    }

    setupEcs() {
        registerCommonStorage(this.ecs);
        this.gridSystem = new GridSystem(this.ecs);
    }

    /**
     * Function called when the mouse scrolls.
     * The map is zoomed in and out based on the scroll direction.
     */
    onMouseWheel(event: WheelEvent) {
        const scalingSpeed = 0.1;

        const minScale = 0.05;
        const maxScale = 3;

        const dScale = 1 - Math.sign(event.deltaY) * scalingSpeed;

        //console.log("Scale", this.board.scale.x, this.board.scale.y, "dScale", dScale);
        if (this.board.scale.x < minScale && dScale < 1 || this.board.scale.x > maxScale && dScale > 1)
            return;

        // Before scaling adjust the position:
        // Takes the vector that goes from the board position (upper-left) to the cursor.
        // Apply the dScale factor to that vector and find the new board position.
        // Finally, the cursor position plus the vector obtained is the new board position.

        let padX = this.board.position.x - event.clientX;
        let padY = this.board.position.y - event.clientY;

        padX *= dScale;
        padY *= dScale;

        const position = new PIXI.Point(padX + event.clientX, padY + event.clientY);
        const scale = new PIXI.Point(this.board.scale.x * dScale, this.board.scale.y * dScale);

        // TODO
        /*if (this.board.isBoardLost(position, scale)) {
            console.log("You can't no more scale in this direction, you're loosing the board!");
            return;
        }*/

        this.board.position.copyFrom(position);
        this.board.scale.copyFrom(scale);

        this.gridSystem.posX = position.x;
        this.gridSystem.posY = position.y;
        this.gridSystem.scaleX = scale.x;
        this.gridSystem.scaleY = scale.y;
        this.gridSystem.updatePos();
    }

    onCursorDown(event: PIXI.InteractionEvent) {
        this.isDraggingBoard = true;
        this.lastMouseDownTime = Date.now();
        this.lastMouseDownPos = event.data.global.clone();
    }

    onCursorUp(event: PIXI.InteractionEvent) {
        this.isDraggingBoard = false;
        if (this.lastMouseDownTime === undefined) return;

        let now = Date.now();

        let timeDiff = now - this.lastMouseDownTime;

        let diffX = Math.abs(event.data.global.x - this.lastMouseDownPos.x);
        let diffY = Math.abs(event.data.global.y - this.lastMouseDownPos.y);
        let diffPos = Math.sqrt(diffX * diffX + diffY * diffY);

        let isClick = diffPos < 5 && timeDiff < 500;
        if (isClick) this.onCursorClick(event);
    }

    onCursorUpOutside(event: PIXI.InteractionEvent) {
        this.isDraggingBoard = false;
    }

    /** Function called when the cursor moves around the map. */
    onCursorMove(e: PIXI.InteractionEvent) {
        if (this.isDraggingBoard) {
            let event = e.data.originalEvent as MouseEvent;

            const newPosX = this.board.position.x + event.movementX;
            const newPosY = this.board.position.y + event.movementY;

            /*if (this.board.isBoardLost(new PIXI.Point(newPosX, newPosY), this.scale)) {
                //console.log("You can't go further than this, you'll loose the board!");
                return;
            }*/

            this.board.position.x = newPosX;
            this.board.position.y = newPosY;

            this.gridSystem.posX = newPosX;
            this.gridSystem.posY = newPosY;
            this.gridSystem.updatePos();
        }
    }

    /** Function called when the cursor clicks. */
    onCursorClick(event: PIXI.InteractionEvent) {
    }

    /** Function called when the cursor clicks. */
    onCursorRightDown(event: PIXI.InteractionEvent) {
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
        s.position = "fixed";
        s.width = "100%";
        s.height = "100%";
    }

    enable() {
        super.enable();

        const canvas = app.view;
        this.applyCanvasStyle(canvas);
        document.body.appendChild(canvas);

        //app.renderer.backgroundColor = 0x3e2723; // dark brown

        // PIXI
        app.stage = new PIXI.Container();
        app.stage.addChild(this.board);
        app.stage.addChild(this.gridSystem.sprite);

        app.stage.interactive = true;

        app.stage.on("mousemove", this.onCursorMove, this);
        app.stage.on("mousedown", this.onCursorDown, this);
        app.stage.on("mouseup", this.onCursorUp, this);
        app.stage.on("mouseupoutside", this.onCursorUpOutside, this);
        app.stage.on("rightdown", this.onCursorRightDown, this);

        this.wheelListener = this.onMouseWheel.bind(this);
        canvas.addEventListener("wheel", this.wheelListener);
    }

    disable() {
        this.gridSystem.destroy();

        app.stage.off("mousemove", this.onCursorMove, this);
        app.stage.off("mousedown", this.onCursorDown, this);
        app.stage.off("mouseup", this.onCursorUp, this);
        app.stage.off("mouseupoutside", this.onCursorUpOutside, this);
        app.stage.off("rightdown", this.onCursorRightDown, this);

        app.view.removeEventListener('wheel', this.wheelListener);

        document.body.removeChild(app.view);

        super.disable();
    }
}