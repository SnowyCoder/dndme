import { Assets, Spritesheet, Texture } from "@/pixi";

import PropsImage from "./assets/spritesheets/props.png";
import PropsSpritesheet from "./assets/spritesheets/props.json";

export async function loadAssets() {
    const texture = await Assets.loader.load(PropsImage) as Texture;
    const spritesheet = new Spritesheet(texture.baseTexture, PropsSpritesheet);

    await spritesheet.parse();
    Assets.cache.set('props', spritesheet);
}
