import * as PIXI from "pixi.js";

import PropsImage from "./assets/props.png";
import PropsSpritesheet from "./assets/spritesheets/props.json";

import BaseTexture = PIXI.BaseTexture;
import ImageResource = PIXI.ImageResource;

async function loadSpritesheet(loader: PIXI.Loader, name: string, imgUrl: string, data: any) {
    return new Promise((resolve, reject) => {
        console.log("[Spritesheet] Loading: " + name);
        const imgElm = new Image();
        imgElm.crossOrigin = 'anonymous';
        imgElm.onload = () => {
            const tex = new PIXI.Texture(new BaseTexture(new ImageResource(imgElm)));
            const spritesheet = new PIXI.Spritesheet(tex, data);
            loader.resources[name] = new (PIXI.LoaderResource as any)(name, "");
            loader.resources[name].spritesheet = spritesheet;
            spritesheet.parse(() => {
                console.log("[Spritesheet] Loaded: " + name);
                resolve(spritesheet);
            });
        };
        imgElm.src = imgUrl; // When the listeners are set, we can finally start downloading the image.
    });
}

export async function loadAssets() {
    const loader = PIXI.Loader.shared;
    await Promise.all([
        loadSpritesheet(loader, "props", PropsImage, PropsSpritesheet),
    ]);
}
