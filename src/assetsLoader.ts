import * as PIXI from "pixi.js";

import PropsImage from "./assets/props.png";
import * as PropsSpritesheet from "./assets/spritesheets/props.json";

import BaseTexture = PIXI.BaseTexture;
import ImageResource = PIXI.ImageResource;

async function loadSpritesheet(loader: PIXI.Loader, name: string, imgUrl: string, data: any) {
    return new Promise((resolve, reject) => {
        console.log("[Spritesheet] Loading: " + name);
        const imgElm = new Image();
        imgElm.crossOrigin = 'anonymous';
        imgElm.onload = async () => {
            const tex = new PIXI.Texture(new BaseTexture(new ImageResource(imgElm)));
            const spritesheet = new PIXI.Spritesheet(tex, data);
            loader.resources[name] = new PIXI.LoaderResource(name, "");
            loader.resources[name].spritesheet = spritesheet;
            await spritesheet.parse();
            console.log("[Spritesheet] Loaded: " + name);
            resolve(spritesheet);
        };
        imgElm.onerror = () => reject("Error loading image " + name);
        imgElm.src = imgUrl; // When the listeners are set, we can finally start downloading the image.
    });
}

export async function loadAssets() {
    const loader = PIXI.Loader.shared;
    await Promise.all([
        loadSpritesheet(loader, "props", PropsImage, PropsSpritesheet),
    ]);
}
