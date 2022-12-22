import {distSquared2d} from "../../util/geometry";
import {DESTROY_ALL} from "../../util/pixi";
import {GridGraphicalOptions, GridType, STANDARD_GRID_OPTIONS} from "../../game/grid";
import {GridResource, Resource} from "../resource";
import {World} from "../world";
import {System} from "../system";
import {BOARD_TRANSFORM_TYPE, BoardTransformResource, PIXI_BOARD_TYPE, PixiBoardSystem} from "./back/pixi/pixiBoardSystem";
import {TOOL_TYPE, ToolSystem} from "./back/toolSystem";
import {SELECTION_TYPE} from "./back/selectionSystem";
import {ToolType} from "../tools/toolType";
import {LayerOrder} from "../../phase/editMap/layerOrder";

import GridEditComponent from "@/ui/edit/GridEdit.vue";
import { VueComponent } from "@/ui/vue";
import { Group, Layer } from "@pixi/layers";
import { StandardToolbarOrder } from "@/phase/editMap/standardToolbarOrder";
import { BaseTexture, Extract, FORMATS, Point, RenderTexture, Texture, TilingSprite } from "pixi.js";


const SQRT3 = Math.sqrt(3);

export const GRID_TYPE = 'grid';
export type GRID_TYPE = 'grid';


export class GridSystem implements System {
    readonly name = GRID_TYPE;
    readonly dependencies = [PIXI_BOARD_TYPE, SELECTION_TYPE, TOOL_TYPE];

    world: World;
    private boardSys: PixiBoardSystem;
    sprite: TilingSprite;

    private readonly gridRes: GridResource;
    private internalScale: number = 1;

    posX: number = 0;
    posY: number = 0;
    scaleX: number = 1;
    scaleY: number = 1;

    constructor(world: World) {
        this.world = world;
        this.boardSys = world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
        let screen = this.boardSys.renderer.screen;

        this.sprite = new TilingSprite(Texture.EMPTY, screen.width, screen.height);
        this.sprite.zIndex = LayerOrder.GRID;

        if (world.isMaster) {
            let toolSys = world.systems.get(TOOL_TYPE) as ToolSystem;
            toolSys.addToolAsCopy(ToolType.GRID, ToolType.INSPECT, {
                sideBar: GridEditComponent as any as VueComponent,
                sideBarProps: {},
                toolbarEntry: {
                    icon: 'fas fa-border-all',
                    title: 'Edit Grid',
                    priority: StandardToolbarOrder.GRID_EDIT,
                },
            });
        }

        world.events.on('resource_edited', this.onResourceEdited, this);
        world.events.on('resource_remove', this.onResourceRemove, this);
        world.events.on('grid_export', this.onGridExport, this);

        this.gridRes = Object.assign({
            type: GRID_TYPE,
            _save: true,
            _sync: true,
        }, STANDARD_GRID_OPTIONS)  as GridResource;
        world.addResource(this.gridRes);

        this.updateTex();
        this.updatePos();
    }

    onResourceEdited(res: Resource, changed: any) {
        if (res.type === GRID_TYPE) {
            // Redraw
            this.updateTex();
            this.updatePos();
        } else if (res.type === BOARD_TRANSFORM_TYPE) {
            this.onBoardTransform(res as BoardTransformResource);
        }
    }

    onResourceRemove(res: Resource) {
        if (res.type !== GRID_TYPE) return;
        throw new Error('Fool! Thou shall not remove thy grid!');
    }

    onBoardTransform(data: BoardTransformResource) {
        this.posX = data.posX;
        this.posY = data.posY;
        this.scaleX = data.scaleX;
        this.scaleY = data.scaleY;
        this.updatePos();
    }

    onResize(width: number, height: number) {
        this.sprite.width = width;
        this.sprite.height = height;
    }

    onGridExport(width: number, height: number) {
        const sprite = new TilingSprite(Texture.EMPTY, width, height);
        sprite.texture = this.sprite.texture;
        sprite.tilePosition.copyFrom(this.sprite.tilePosition);
        sprite.tileScale.copyFrom(this.sprite.tileScale);

        const r = this.boardSys.renderer;

        const renderTexture = RenderTexture.create({
            width, height,
            format: FORMATS.RGBA,
        });

        r.render(sprite, {
            renderTexture,
            clear: true,
        });
        const canvas = (r.plugins.extract as Extract).canvas(renderTexture) as HTMLCanvasElement;
        canvas.toBlob(blob => {
            console.log("Saving exported image!");
            this.world.events.emit('blob_save', blob, "grid.png");
        }, "image/png");
    }

    private updateTex() {
        this.sprite.texture.destroy(true);

        if (!this.gridRes.visible) {
            this.sprite.texture = Texture.EMPTY;
            return;
        }

        let tex = drawGridTexture(512, this.gridRes.gridType, this.gridRes);
        this.internalScale = this.gridRes.size / 512;
        this.sprite.texture = new Texture(tex);
    }

    updatePos() {
        this.sprite.tileScale.set(this.scaleX * this.internalScale, this.scaleY * this.internalScale);
        this.sprite.tilePosition.set(this.posX + this.scaleX * this.gridRes.offX  * this.gridRes.size , this.posY + this.scaleY * this.gridRes.offY * this.gridRes.size);
    }

    closestPoint(point: Point): Point | undefined {
        if (this.gridRes === undefined) return undefined;
        this.sprite.worldTransform.apply(point, point);

        let pointX = point.x / this.gridRes.size - this.gridRes.offX;
        let pointY = point.y / this.gridRes.size - this.gridRes.offY;

        let resX: number;
        let resY: number;
        switch (this.gridRes.gridType) {
            case GridType.SQUARE: {
                let fx = Math.floor(pointX);
                let fy = Math.floor(pointY);

                resX = fx;
                resY = fy;

                if (pointX > fx + 0.5) {
                    resX += 1;
                }
                if (pointY > fy + 0.5) {
                    resY += 1;
                }

                // Also check grid center
                if (distSquared2d(pointX, pointY, fx + 0.5, fy + 0.5) < distSquared2d(pointX, pointY, resX, resY)) {
                    resX = fx + 0.5;
                    resY = fy + 0.5;
                }
            } break;
            case GridType.HEXAGON: {
                // The algorithm here is quite complex and I couldn't find any of this online, so this is my own solution:
                // (note: hexagon side = 1 because of the initial transformation).
                // First we can notice that if we colour each point in a different colour depending on which vertex
                // is closer to him (in a hexagonal grid) we find a grid of equilateral triangles of side 1.
                // We then transform our grid by 2 / sqrt(3) on the horizontal side so that the height of the triangles
                // will be the same as their base.
                // With that done we can put a square grid on top of our triangle grid, each square will hold one
                // triangle at its center and two halfes at the top and bottom.
                // We can see which square the point belongs to by flooring the transformed x and y components, then
                // we can check which triangle the points belongs to by chechinkg if the point is above or below
                // the diagonal lines of equation: y < 0.5 - x/2 and y > x/2 + 0.5
                // Note that each triangle column has half of a hexagon so the odd-ones will be flipped.

                const s = 1 / SQRT3;// Hexagon Side = 1/sqrt(3)
                let px = (pointX - s / 2) * 2 / SQRT3;// align the point with the triangle grid, and transform the grid
                let py = pointY;

                let sx = Math.floor(px);
                let sy = Math.floor(py);

                let gx = (px - sx);
                let gy = (py - sy);

                let rx = sx * SQRT3 / 2 + s / 2;
                if (sx % 2 == 0) {
                    // Left side hexagon
                    if (gy < 0.5 - gx / 2) {
                        resY = sy;
                        resX = rx + s / 2;
                    } else if (gy > gx / 2 + 0.5) {
                        resY = sy + 1;
                        resX = rx + s / 2;
                    } else {
                        resY = sy + 0.5;
                        resX = rx + s;
                    }
                } else {
                    // Flipped hexagon: right side hex.
                    if (gy > 1 - gx / 2) {
                        resY = sy + 1;
                        resX = rx + s;
                    } else if (gy < gx / 2) {
                        resY = sy;
                        resX = rx + s;
                    } else {
                        resY = sy + 0.5;
                        resX = rx + s / 2;
                    }
                }
            } break;
        }
        point.set(
            (resX + this.gridRes.offX) * this.gridRes.size,
            (resY + this.gridRes.offY) * this.gridRes.size
        );
        this.sprite.worldTransform.applyInverse(point, point);

        return point;
    }

    enable() {
        this.boardSys.renderer.on('resize', this.onResize, this);

        const layer = new Layer(new Group(LayerOrder.GRID, false));
        this.sprite.parentLayer = layer;
        this.boardSys.root.addChild(layer, this.sprite);
        const screen = this.boardSys.renderer.screen;
        this.onResize(screen.width, screen.height);
    }

    destroy() {
        this.sprite.destroy(DESTROY_ALL);
    }
}

// ----------------------------------------- DRAW -----------------------------------------

function drawGridTexture(size: number, type: GridType, options: GridGraphicalOptions): BaseTexture {
    let canvas: ImageData;
    switch (type) {
        case GridType.HEXAGON:
            canvas = drawHex(size, options);
            break;
        case GridType.SQUARE:
            canvas = drawSquare(size, options);
            break;
        default:
            throw new Error('Cannot draw unknown type: ' + type);
    }

    return BaseTexture.fromBuffer(new Uint8Array(canvas.data.buffer), canvas.width, canvas.height);
}

function drawSquare(size: number, opt: GridGraphicalOptions): ImageData {
    //let canvas = new OffscreenCanvas(size, size);
    let canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    let ctx = canvas.getContext("2d")!;

    ctx.lineWidth = opt.thick;
    ctx.strokeStyle = colorToHex(opt.color, opt.opacity);

    ctx.strokeRect(0, 0, size + 1, size + 1);
    return ctx.getImageData(0, 0, size, size);
}

function drawHex(size: number, opt: GridGraphicalOptions): ImageData {
    let s = size / SQRT3;// Side

    let width = Math.floor(3 * s);
    //let canvas = new OffscreenCanvas(width, size);
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = size;
    let ctx = canvas.getContext("2d")!;

    let d = size;

    ctx.lineWidth = opt.thick;
    ctx.strokeStyle =  colorToHex(opt.color, opt.opacity);


    ctx.moveTo(0, 0);
    ctx.lineTo(s, 0);
    ctx.lineTo(s + s / 2, d / 2);
    ctx.lineTo(2 * s + s / 2, d / 2);
    ctx.lineTo(3 * s, 0);
    ctx.moveTo(0, d);
    ctx.lineTo(s, d);
    ctx.lineTo(s + s / 2, d / 2);
    ctx.moveTo(2 * s + s / 2, d / 2);
    ctx.lineTo(3 * s, d);

    // Lines before the image:
    ctx.moveTo(0, 0);
    ctx.lineTo(-s / 2, d / 2);
    ctx.lineTo(0, d);

    ctx.stroke();

    return ctx.getImageData(0, 0, width, size);
}

function colorToHex(color: number, opacity: number): string {
    return '#' + color.toString(16).padStart(6, '0')
        + ((255 * opacity) | 0).toString(16).padStart(2, '0');
}
