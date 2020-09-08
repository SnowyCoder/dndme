import PIXI from "../PIXI";

export const DESTROY_ALL = {
    children: true,
    texture: true,
    baseTexture: true,
};

const ALLOWED_IMAGETYPES = ['jpeg', 'png', 'x-jg', 'bmp', 'x-icon', 'ief', 'pjpeg', 'x-portable-bitmap', 'x-rgb', 'tiff', 'x-tiff']

function validateImageMimeType(type: string): void {
    if (!type.startsWith('image/')) throw 'Invalid type: it should be an image';
    if (ALLOWED_IMAGETYPES.indexOf(type.substr('image/'.length)) < 0) throw 'Unsupported image type';
}

export function loadTexture(data: ArrayBuffer, dataType: string): Promise<[PIXI.Texture, HTMLImageElement]> {
    validateImageMimeType(dataType);
    let typedArray = new Uint8Array(data);
    let b64 = 'data:' + dataType + ';base64,' + btoa(typedArray.reduce((data, byte) => {
        return data + String.fromCharCode(byte);
    }, ''));

    return new Promise<[PIXI.Texture, HTMLImageElement]>((resolve, reject) => {
        let image = new Image();
        image.onload = () => {
            const tex = new PIXI.Texture(new PIXI.BaseTexture(new PIXI.resources.ImageResource(image)));
            resolve([tex, image]);
        };
        image.onerror = reject;
        image.src = b64;
    });
}