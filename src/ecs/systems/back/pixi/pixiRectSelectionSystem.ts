import {World} from "@/ecs/World";
import {PIXI_BOARD_TYPE} from "./pixiBoardSystem";
import {System} from "@/ecs/System";
import {RECTANGULAR_SELECTION_TYPE, RectangularSelectionResource, Resource} from "@/ecs/resource";
import {Aabb} from "@/geometry/aabb";
import { Graphics } from "@/pixi";


export const PIXI_RECTANGULAR_SELECTION_TYPE = "pixi_rect_selection";
export type PIXI_RECTANGULAR_SELECTION_TYPE = typeof PIXI_RECTANGULAR_SELECTION_TYPE;
export class PixiRectSelectionSystem implements System {
    readonly name = PIXI_RECTANGULAR_SELECTION_TYPE;
    readonly dependencies = [PIXI_BOARD_TYPE];

    readonly world: World;
    readonly display: Graphics;

    constructor(world: World) {
        this.world = world;
        this.display = new Graphics();
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
        let board = this.world.requireSystem(PIXI_BOARD_TYPE);
        this.display.parentGroup = board.toolForegroundGroup;
        board.board.addChild(this.display);
    }

    destroy(): void {
    }
}
