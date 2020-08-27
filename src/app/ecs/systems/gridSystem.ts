import * as PIXI from "pixi.js";
import {app} from "../../index";
import {Point} from "../../util/geometry";
import {DESTROY_ALL} from "../../util/pixi";
import {GridGraphicalOptions, GridType} from "../../game/grid";
import {GridResource, Resource} from "../resource";
import {EcsTracker} from "../ecs";
import {System} from "../system";


const SQRT3 = Math.sqrt(3);


export class GridSystem implements System {
    readonly type = 'grid';
    ecs: EcsTracker;
    sprite: PIXI.TilingSprite;

    private gridRes?: GridResource;
    private internalScale: number;

    posX: number = 0;
    posY: number = 0;
    scaleX: number = 1;
    scaleY: number = 1;

    constructor(ecs: EcsTracker) {
        this.ecs = ecs;
        this.sprite = new PIXI.TilingSprite(PIXI.Texture.EMPTY, app.screen.width, app.screen.height);
        this.sprite.zIndex = 5000;

        ecs.events.on('resource_add', this.onResourceAdd, this);
        ecs.events.on('resource_edited', this.onResourceEdited, this);
        ecs.events.on('resource_remove', this.onResourceRemove, this);
        app.renderer.on('resize', this.onResize, this);
    }

    onResourceAdd(res: Resource) {
        if (res.type !== 'grid') return;
        this.gridRes = res as GridResource;
        this.updateTex();
        this.updatePos();
    }

    onResourceEdited(res: Resource, changed: any) {
        if (res.type !== 'grid') return;
        this.updateTex();
        this.updatePos();
    }

    onResourceRemove(res: Resource) {
        if (res.type !== 'grid') return;
        this.gridRes = undefined;
        this.disable();
    }

    onResize(width: number, height: number) {
        this.sprite.width = width;
        this.sprite.height = height;
    }

    private disable() {
        this.sprite.texture.destroy(true);
        this.sprite.texture = PIXI.Texture.EMPTY;
    }

    private updateTex() {
        if (this.gridRes === undefined) return;

        this.sprite.texture.destroy(true);
        let tex = drawGridTexture(512, this.gridRes.gridType, this.gridRes);
        this.internalScale = this.gridRes.size / 512;
        this.sprite.texture = new PIXI.Texture(tex);
    }

    updatePos() {
        if (this.gridRes === undefined) return;

        this.sprite.tileScale.set(this.scaleX * this.internalScale, this.scaleY * this.internalScale);
        this.sprite.tilePosition.set(this.posX + this.scaleX * this.gridRes.offX  * this.gridRes.size , this.posY + this.scaleY * this.gridRes.offY * this.gridRes.size);
    }

    closestPoint(point: Point): Point | undefined {
        if (this.gridRes === undefined) return undefined;
        let pnt = new PIXI.Point(point[0], point[1]);
        this.sprite.worldTransform.apply(pnt, pnt);

        let pointX = pnt.x / this.gridRes.size - this.gridRes.offX;
        let pointY = pnt.y / this.gridRes.size - this.gridRes.offY;

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
        pnt.set(
            (resX + this.gridRes.offX) * this.gridRes.size,
            (resY + this.gridRes.offY) * this.gridRes.size
        );
        this.sprite.worldTransform.applyInverse(pnt, pnt);

        return [pnt.x, pnt.y];
    }


    destroy() {
        this.sprite.destroy(DESTROY_ALL);
        app.renderer.off('resize', this.onResize, this);
    }
}


// ----------------------------------------- DRAW -----------------------------------------

function drawGridTexture(size: number, type: GridType, options: GridGraphicalOptions): PIXI.BaseTexture {
    let canvas: ImageData;
    switch (type) {
        case GridType.HEXAGON:
            canvas = drawHex(size, options);
            break;
        case GridType.SQUARE:
            canvas = drawSquare(size, options);
            break;
        default:
            throw 'Cannot draw unknown type: ' + type;
    }

    return PIXI.BaseTexture.fromBuffer(new Uint8Array(canvas.data.buffer), canvas.width, canvas.height);
}

function drawSquare(size: number, opt: GridGraphicalOptions): ImageData {
    //let canvas = new OffscreenCanvas(size, size);
    let canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    let ctx = canvas.getContext("2d");

    ctx.lineWidth = opt.width;
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
    let ctx = canvas.getContext("2d");

    let d = size;

    ctx.lineWidth = opt.width;
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
    return '#' + (color << 8 | (255 * opacity)).toString(16).padStart(8, '0');
}
