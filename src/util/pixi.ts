import { Buffer } from "buffer";
import { BaseTexture, IRenderingContext, ImageBitmapResource, StateSystem, Texture } from "@/pixi";

export const DESTROY_ALL = {
    children: true,
    texture: true,
    baseTexture: true,
};

export const DESTROY_MIN = {
    children: false,
    texture: false,
    baseTexture: false,
};

const ALLOWED_IMAGETYPES = ['jpeg', 'png', 'webp', 'x-jg', 'bmp', 'x-icon', 'ief', 'pjpeg', 'x-portable-bitmap', 'x-rgb', 'tiff', 'x-tiff']

function validateImageMimeType(type: string): void {
    if (!type.startsWith('image/')) throw new Error('Invalid type: it should be an image');
    if (ALLOWED_IMAGETYPES.indexOf(type.substring('image/'.length)) < 0) throw new Error('Unsupported image type');
}

export async function loadTexture(data: ArrayBuffer, dataType: string): Promise<Texture<ImageBitmapResource>> {
    validateImageMimeType(dataType);
    const blob = new Blob([data], { type: dataType } )
    const image = await createImageBitmap(blob)

    return new Texture(new BaseTexture(image));
}

export enum CUSTOM_BLEND_MODES {
    MULTIPLY_COLOR_ONLY = 30,
    ADD_WHERE_ALPHA_1,
}

const oldContextChange = StateSystem.prototype.contextChange;
StateSystem.prototype.contextChange = function(gl: IRenderingContext): void {
    oldContextChange.call(this, gl);
    const bmodes = (this as any).blendModes as number[][];
    bmodes[CUSTOM_BLEND_MODES.MULTIPLY_COLOR_ONLY] = [gl.DST_COLOR, gl.ZERO, gl.ZERO, gl.ONE];// color = src*dst alpha=dst (dst=main canvas)
    bmodes[CUSTOM_BLEND_MODES.ADD_WHERE_ALPHA_1] = [gl.DST_ALPHA, gl.ONE, gl.ZERO, gl.ONE];
}
