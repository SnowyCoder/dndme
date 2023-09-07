// Common info about the graphical systems, this should be a semi-abstraction.
// NONE OF THIS SHOULD BE SERIALIZED! THIS IS ALL RUNTIME DEPENDANT! DETAILS WILL CHANGE BETWEEN MINOR VERSIONS!

import { Texture } from "pixi.js";
import {Component} from "./ecs/component";
import { IPoint } from "./geometry/point";
import { FileIndex } from "./map/FileDb";

export const EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE = 'remember_bit_by_bit_vis_update';

export type GRAPHIC_TYPE = "graphic";
export const GRAPHIC_TYPE = "graphic";
export interface GraphicComponent extends Component {
    type: GRAPHIC_TYPE,
    display: DisplayElement;
    // Why does this flag exist? good thing you asked! Walls have a special performance optimization that does
    // not use imprecise collision detection, they use data extracted from the visibility polygon algorithm.
    // If you think about it a bit it's not that far-fetched, the algorithm computes all of the visibility paths, it
    // should also know what walls are being used (and we get that info for free!).
    isWall?: true;
    interactive: boolean;// When true this element will be added to the Interaction system
}

export enum ElementType {
    CONTAINER,
    IMAGE,
    LINE,
    POINT,
    TEXT,
}

export interface DisplayElement extends VisibilityOptions {
    type: ElementType;
    tag?: string;// used sometimes to differentiate elements between systems
    ignore: boolean;
    priority: number;// (ignored if text for performance reasons)
    offset?: IPoint;
    children?: DisplayElement[];
    // These are akin to function calls, upon updating the system in charge of
    // GUI editing will add/remove/replace the childrens contained
    _childrenAdd?: DisplayElement[];
    _childrenRemove?: DisplayElement[];
    _childrenReplace?: DisplayElement[];
}

export interface AnchorableElement {
    anchor: IPoint;
}

export interface ScaleableElement {
    scale: number;
}

export interface ColorableElement {
    color: number;
    alpha?: number;
}

export enum VisibilityType {
    // Never visible, by anyone!
    INVISIBLE,
    // You only see one thing when you see it! seems stupid but you can also remember things
    NORMAL,
    // A player can always see itself, even with no light, "I think therefore I am"
    ALWAYS_VISIBLE,
    // You'll remember once you see it
    REMEMBER,
    // Used in images, you only remember what you see! (only support images for now)
    REMEMBER_BIT_BY_BIT,
}

export interface VisibilityOptions {
    visib: VisibilityType;
}

// Real components

export interface ContainerElement extends DisplayElement {
    type: ElementType.CONTAINER;
}

export enum ImageScaleMode {
    // 1 pixel = 1*scale pixels
    REAL,
    // 1 pixel = 1*gridSize*scale pixels
    GRID,
    // scale = 1 => image will be 1 grid in width
    CONSTRAINED,
}

export enum ImageWhileLoading {
    WHITE,
    HIDE,
}

// TODO: create a shared resources resource and put textures in them (then put backgrounds in it!).
export interface ImageElement extends DisplayElement, AnchorableElement, ScaleableElement {
    type: ElementType.IMAGE;
    scaleMode: ImageScaleMode;
    texture: {// external
        type: 'external';
        value: FileIndex;
        priority?: number;
    } | {
        type: 'raw';
        value: Texture;
    };
    whileLoading: ImageWhileLoading,
    tint: number;
    // Output of the visible image, only available if visib=REMEMBER_BIT_BY_BIT and it's an image
    // updated when the entity is serialized, when it is EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE is fired with a list
    // of updated entities.
    visMap?: FileIndex;
}

export interface ImageMeta {
    dims: [number, number];
    format: string;
}

export interface LineElement extends DisplayElement, ColorableElement {
    type: ElementType.LINE;
    vec: IPoint;
    thickness?: number,
}

export interface PointElement extends DisplayElement, ColorableElement, ScaleableElement {
    type: ElementType.POINT;
}

export interface TextElement extends DisplayElement, AnchorableElement, ColorableElement, ScaleableElement {
    type: ElementType.TEXT;
    text: string;
    lineAlign?: 'left' | 'center' | 'right';
}
