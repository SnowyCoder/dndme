import {World} from "../../world";
import {BOARD_TRANSFORM_TYPE, BoardTransformResource, PIXI_BOARD_TYPE, PixiBoardSystem} from "./pixiBoardSystem";
import {System} from "../../system";
import {GridResource, MEASURE_TYPE, MeasureResource, Resource} from "../../resource";
import {distSquared2d} from "../../../util/geometry";
import {STANDARD_GRID_OPTIONS} from "../../../game/grid";
import {GRID_TYPE} from "../gridSystem";


export const PIXI_MEASURE_TYPE = "pixi_measure";
export type PIXI_MEASURE_TYPE = typeof PIXI_MEASURE_TYPE;
export class PixiMeasureSystem implements System {
    readonly name = PIXI_MEASURE_TYPE;
    readonly dependencies = [PIXI_BOARD_TYPE];

    private readonly world: World;
    private display: PIXI.Graphics;
    private text: PIXI.Text;

    private gridSize: number = STANDARD_GRID_OPTIONS.size;
    private boardScale: number = 1;

    constructor(world: World) {
        this.world = world;
        const pixiBoard = this.world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;

        this.display = new PIXI.Graphics();
        this.display.parentGroup = pixiBoard.toolForegroundGroup;
        this.text = new PIXI.Text("");
        this.text.anchor.set(0.5, 1);
        this.text.style.fill = 0xff0000;
        this.text.style.fontSize = 40;
        this.text.parentGroup = pixiBoard.toolForegroundGroup;

        world.events.on('resource_add', this.onResourceAdd, this);
        world.events.on('resource_edited', this.onResourceEdit, this);
        world.events.on('resource_removed', this.onResourceRemove, this);
    }

    setEnabled(enabled: boolean) {
        this.display.visible = enabled;
        this.text.visible = enabled;
    }

    redraw(fromX: number, fromY: number, toX: number, toY: number) {
        this.setEnabled(true);
        this.display.clear();

        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        let distSq = distSquared2d(fromX, fromY, toX, toY) / (this.gridSize ** 2);

        const scale = 1/this.boardScale;
        this.text.scale.set(scale);

        if (distSq < 0.1**2) {
            this.display.beginFill(0xff0000);
            this.display.drawCircle(midX, midY, 10 * scale);
            this.display.endFill();
            this.text.rotation = 0;
            this.text.text = (midX / this.gridSize).toFixed(4) + ", " + (midY / this.gridSize).toFixed(4);
            this.text.position.set(midX, midY - 10);
        } else {
            this.display.beginFill(0xff0000);
            this.display.drawCircle(fromX, fromY, 10 * scale);
            this.display.endFill();

            this.display.beginFill(0xff0000);
            this.display.drawCircle(toX, toY, 10 * scale);
            this.display.endFill();

            this.display.lineStyle(3 * scale, 0xff0000)
            this.display.moveTo(fromX, fromY);
            this.display.lineTo(toX, toY);

            let rot = Math.atan2(toY - fromY, toX - fromX);
            if (rot < Math.PI / 2) rot += Math.PI;
            if (rot > Math.PI / 2) rot -= Math.PI;
            this.text.position.set(midX, midY);
            this.text.rotation = rot;
            this.text.text = '' + Math.sqrt(distSq).toFixed(4);
        }
    }

    redrawRes(res: MeasureResource) {
        this.redraw(res.fromX, res.fromY, res.toX, res.toY);
    }

    onResourceAdd(res: Resource) {
        if (res.type === MEASURE_TYPE) {
            let r = res as MeasureResource;
            this.redrawRes(r);
        }
    }

    onResourceEdit(res: Resource) {
        let redraw = false;
        if (res.type === MEASURE_TYPE) {
            this.redrawRes(res as MeasureResource);
        } else if (res.type === GRID_TYPE) {
            this.gridSize = (res as GridResource).size;
            redraw = true;
        } else if (res.type === BOARD_TRANSFORM_TYPE) {
            this.boardScale = (res as BoardTransformResource).scaleX || 1;
            redraw = true;
        }

        if (redraw) {
            const r = this.world.getResource(MEASURE_TYPE) as MeasureResource | undefined;
            if (r !== undefined) this.redrawRes(r);
        }
    }

    onResourceRemove(res: Resource) {
        if (res.type === MEASURE_TYPE) {
            this.setEnabled(false);
        } else if (res.type === BOARD_TRANSFORM_TYPE) {
            const r = res as BoardTransformResource;
            this.boardScale = r.scaleX;
        }
    }

    enable(): void {
        let board = this.world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
        board.board.addChild(this.display);
        board.board.addChild(this.text);

        let grid = this.world.getResource(GRID_TYPE);
        if (grid !== undefined) {
            this.gridSize = (grid as GridResource).size;
        }
        this.boardScale = (this.world.getResource(BOARD_TRANSFORM_TYPE) as BoardTransformResource | undefined)?.scaleX || 1;
    }

    destroy(): void {
    }
}