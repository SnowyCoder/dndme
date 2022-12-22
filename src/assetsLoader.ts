import { Assets } from "pixi.js";

import PropsSpritesheet from "./assets/spritesheets/props.json?url";

export async function loadAssets() {
    Assets.add('props', PropsSpritesheet);
    await Assets.load('props');
}
