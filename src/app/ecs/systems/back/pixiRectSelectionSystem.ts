import {World} from "../../world";
import {PIXI_BOARD_TYPE, PixiBoardSystem} from "./pixiBoardSystem";
import {System} from "../../system";
import {app} from "../../../index";
import {RECTANGULAR_SELECTION_TYPE, RectangularSelectionResource, Resource} from "../../resource";
import {Aabb} from "../../../geometry/aabb";


export const PIXI_RECTANGULAR_SELECTION_TYPE = "pixi_rect_selection";
export type PIXI_RECTANGULAR_SELECTION_TYPE = typeof PIXI_RECTANGULAR_SELECTION_TYPE;

export class PixiRectSelectionSystem implements System {
    name = PIXI_RECTANGULAR_SELECTION_TYPE;
    dependencies = [PIXI_BOARD_TYPE];

    world: World;
    display: PIXI.Graphics;

    constructor(world: World) {
        this.world = world;
        this.display = new PIXI.Graphics();
        world.events.on('resource_add', this.onResourceAdd, this);
        world.events.on('resource_edited', this.onResourceEdit, this);
        world.events.on('resource_removed', this.onResourceRemove, this);
    }

    redraw(box: Aabb) {
        this.display.clear();
        this.display.beginFill(0x7986CB, 0.2);
        this.display.drawRect(box.minX, box.minY, box.maxX - box.minX, box.maxY - box.minY);
        this.display.endFill();
    }

    onResourceAdd(res: Resource) {
        if (res.type === RECTANGULAR_SELECTION_TYPE) {
            let r = res as RectangularSelectionResource;
            this.redraw(r.aabb);
        }
    }

    onResourceEdit(res: Resource) {
        if (res.type === RECTANGULAR_SELECTION_TYPE) {
            let r = res as RectangularSelectionResource;
            this.redraw(r.aabb);
        }
    }

    onResourceRemove(res: Resource) {
        if (res.type === RECTANGULAR_SELECTION_TYPE) {
            this.display.clear();
        }
    }

    enable(): void {
        this.display.zIndex = 100000;
        let board = this.world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
        board.board.addChild(this.display);
    }

    destroy(): void {
    }
}