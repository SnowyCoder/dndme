import {Phase} from "./phase";
import PIXI from "../PIXI";
import {app} from "../index";
import {World} from "../ecs/ecs";
import {registerCommonStorage} from "../ecs/component";
import {GridSystem} from "../ecs/systems/gridSystem";
import {IHitArea} from "pixi.js";

interface PointerData {
    firstX: number,
    firstY: number,
    lastX: number,
    lastY: number,
}

export class BirdEyePhase extends Phase {
    ecs: World;
    board: PIXI.Container;

    lastMouseDownTime?: number;
    isDraggingBoard: boolean = false;

    gridSystem: GridSystem;

    private wheelListener: any;

    pointers = new Map<number, PointerData>();

    constructor(name: string, isMaster: boolean) {
        super(name);

        this.ecs = new World(isMaster);

        // TODO: we should create render phases, one for the world (using the projection matrix to move the camera)
        //       and the other for the GUI (or other things that do not depend on camera position, as the GridSystem(?)).
        //       to create a custom game loop: https://github.com/pixijs/pixi.js/wiki/v5-Custom-Application-GameLoop
        this.board = new PIXI.Container();
        this.board.interactive = false;
        this.board.interactiveChildren = false;
        this.board.position.set(0, 0);
    }

    setupEcs() {
        registerCommonStorage(this.ecs);
        this.gridSystem = new GridSystem(this.ecs);
    }

    zoom(dScale: number, centerX: number, centerY: number) {
        const minScale = 0.05;
        const maxScale = 3;

        //console.log("Scale", this.board.scale.x, this.board.scale.y, "dScale", dScale);
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

        this.board.position.copyFrom(position);
        this.board.scale.copyFrom(scale);

        this.gridSystem.posX = position.x;
        this.gridSystem.posY = position.y;
        this.gridSystem.scaleX = scale.x;
        this.gridSystem.scaleY = scale.y;
        this.gridSystem.updatePos();
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
            this.onPointerRightDown(event);
            return;
        }
        let pos = event.data.global;
        this.pointers.set(event.data.pointerId, {
            firstX: pos.x,
            firstY: pos.y,
            lastX: pos.x,
            lastY: pos.y,
        } as PointerData);

        if (this.pointers.size === 1) {
            this.isDraggingBoard = true;
        }

        this.lastMouseDownTime = Date.now();
    }

    onPointerUp(event: PIXI.InteractionEvent): void {
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
            if (isClick) this.onPointerClick(event);
        }
    }

    onPointerUpOutside(event: PIXI.InteractionEvent) {
        this.onPointerUp(event);
    }

    /** Function called when the cursor moves around the map. */
    onPointerMove(e: PIXI.InteractionEvent) {
        let pdata = this.pointers.get(e.data.pointerId);
        if (pdata === undefined) return;

        let pos = e.data.global;

        if (this.pointers.size === 1 && this.isDraggingBoard) {// Move
            const newPosX = this.board.position.x + (pos.x - pdata.lastX);
            const newPosY = this.board.position.y + (pos.y - pdata.lastY);

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

    /** Function called when the cursor clicks. */
    onPointerClick(event: PIXI.InteractionEvent) {
    }

    /** Function called when the cursor clicks. */
    onPointerRightDown(event: PIXI.InteractionEvent) {
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

    enable() {
        super.enable();

        const canvas = app.view;
        this.applyCanvasStyle(canvas);
        let cnt = document.getElementById('canvas-container');
        app.resizeTo = cnt;
        cnt.appendChild(canvas);

        //app.renderer.backgroundColor = 0x3e2723; // dark brown

        // PIXI
        let stage = new PIXI.display.Stage();
        app.stage = stage;
        stage.group.enableSort = true;
        stage.addChild(this.board);
        stage.addChild(this.gridSystem.sprite);

        app.stage.interactive = true;
        app.stage.hitArea = {
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

    disable() {
        this.gridSystem.destroy();

        app.stage.off("pointermove", this.onPointerMove, this);
        app.stage.off("pointerdown", this.onPointerDown, this);
        app.stage.off("pointerup", this.onPointerUp, this);
        app.stage.off("pointerupoutside", this.onPointerUpOutside, this);

        app.view.removeEventListener('wheel', this.wheelListener);

        let cnt = document.getElementById('canvas-container');
        cnt.removeChild(app.view);
        app.resizeTo = undefined;

        super.disable();
    }
}