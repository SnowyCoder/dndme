import { BLEND_MODES, Container, Renderer, Texture } from "pixi.js";
import { VISIBILITY_POLYGON } from "./VisibilityPolygonRenderer";
import { LightProgramType } from "./VisibilityPrograms";

export enum DepthFunc {
    NEVER,
    LESS,
    EQUAL,
    LEQUAL,
    GREATER,
    NOTEQUAL,
    GEQUAL,
    ALWAYS,
}

export class VisibilityPolygonElement extends Container {
    polygon: number[] = [];
    radius: number = 1;

    depth: number = 0;
    depthTest: boolean = false;
    depthFunc: DepthFunc = DepthFunc.LESS;

    program: LightProgramType = 'normal';
    texture: Texture = Texture.WHITE;
    tint: number = 0xFFFFFF;

    blendMode: BLEND_MODES = BLEND_MODES.NORMAL;

    /**
     * Standard renderer draw.
     * @param renderer - Instance to renderer.
     */
    protected _render(renderer: Renderer): void {
        renderer.batch.setObjectRenderer(renderer.plugins[VISIBILITY_POLYGON]);
        renderer.plugins[VISIBILITY_POLYGON].render(this);
    }
}
