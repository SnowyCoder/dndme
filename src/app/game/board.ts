import * as PIXI from "pixi.js";
import InteractionEvent = PIXI.InteractionEvent;

export class Board extends PIXI.Container{
    private left: number = Infinity;
    private right: number = -Infinity;
    private bottom: number = Infinity;
    private top: number = -Infinity;

    // Pixi
    isDragging: boolean = false;

    constructor() {
        super();
        this.initPixi();
    }

    /**
     * Checks if at the given position and scale the board is considered lost.
     * The board is lost if its cards' bounding-box doesn't intersect with the window.
     */
    isBoardLost(position: PIXI.IPoint, scale: PIXI.IPoint) {
        const rLeft = position.x + this.left * scale.x;
        const rRight = position.x + this.right * scale.x;
        const rBottom = position.y + this.bottom * scale.y;
        const rTop = position.y + this.top * scale.y;

        return rTop < 0 || rBottom > window.innerHeight || rLeft > window.innerWidth || rRight < 0;
    }

    private initPixi() {
        this.sortableChildren = true;
        this.hitArea = {
            contains(x: number, y: number): boolean {
                return true;
            }
        };

        // Drag
        this.interactive = true;
        this.interactiveChildren = true;
        this.isDragging = false;

        this.on("mousedown", (e: InteractionEvent) => {
            this.isDragging = true;
        });
        this.on("mouseup", (e: InteractionEvent) => {
            this.isDragging = false;
        });
        this.on("mouseupoutside", (e: InteractionEvent) => {
            this.isDragging = false;
        });
        this.on("mousemove", (e: InteractionEvent) => {
            if (this.isDragging) {
                let event = e.data.originalEvent as MouseEvent;

                const newPosX = this.position.x + event.movementX;
                const newPosY = this.position.y + event.movementY;

                if (this.isBoardLost(new PIXI.Point(newPosX, newPosY), this.scale)) {
                    //console.log("You can't go further than this, you'll loose the board!");
                    return;
                }

                this.position.x = newPosX;
                this.position.y = newPosY;
            }
        });
    }
}
