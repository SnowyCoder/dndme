import {
    Component,
    POSITION_TYPE,
    PositionComponent,
    TRANSFORM_TYPE,
    TransformComponent,
    SHARED_TYPE
} from "@/ecs/component";
import {FlagEcsStorage, SingleEcsStorage} from "@/ecs/Storage";
import {ForgetData, World} from "@/ecs/World";
import {System} from "@/ecs/System";
import {
    DisplayElement,
    ElementType,
    GRAPHIC_TYPE,
    GraphicComponent,
    ImageElement,
    ImageScaleMode,
    LineElement,
    PointElement,
    TextElement,
    VisibilityType
} from "@/graphics";
import {GridResource, Resource} from "@/ecs/resource";
import {DESTROY_MIN} from "@/util/pixi";
import {STANDARD_GRID_OPTIONS} from "@/game/grid";
import {
    PLAYER_TYPE,
    PLAYER_VISIBLE_TYPE,
    PlayerSystem,
    PlayerVisibleComponent,
} from "../../playerSystem";
import {LIGHT_TYPE, LightSystem, LocalLightSettings} from "../../lightSystem";
import {
    INTERACTION_TYPE,
    InteractionComponent,
    InteractionSystem,
    Shape,
    shapeLine,
    shapeCircle,
    CircleShape
} from "../InteractionSystem";
import {Line} from "@/geometry/line";
import {arrayRemoveElem} from "@/util/array";
import {GRID_TYPE} from "../../gridSystem";
import {PIXI_BOARD_TYPE, PixiBoardSystem} from "./pixiBoardSystem";
import {TEXT_TYPE, TextSystem} from "../TextSystem";
import { VISIBILITY_AWARE_TYPE } from "../VisibilityAwareSystem";
import { Group } from "@pixi/layers";
import { IPoint } from "@/geometry/point";
import { ImageRenderer, PixiImageElement } from "./ImageRenderer";
import { Container, DisplayObject, Graphics, ImageBitmapResource, Point, Sprite, Text, TextStyle, Texture } from "pixi.js";
import { FileIndex } from "@/map/FileDb";

export interface PixiGraphicComponent extends GraphicComponent {
    _selected?: boolean;
    _visibListener?: VisibListenerLevel;// Default: NOT_NEEDED
    _bitByBit?: boolean;
    _layer?: Group;
}

export interface PixiDisplayElement extends DisplayElement {
    _oldType?: ElementType;
    _pixi?: DisplayObject;
}

export const REMEMBER_TYPE = 'remember';
export type REMEMBER_TYPE = 'remember';
export interface RememberComponent extends Component {
    type: REMEMBER_TYPE,
}

enum VisibListenerLevel {
    NOT_NEEDED,
    REMEMBER,
    PERSISTENT,
}

function lerpColor(a: number, b: number, t: number): number {
    let tr = ((a >> 16) & 0xFF) * (1 - t) + ((b >> 16) & 0xFF) * t;
    let tg = ((a >> 8) & 0xFF) * (1 - t) + ((b >> 8) & 0xFF) * t;
    let tb = (a & 0xFF) * (1 - t) + (b & 0xFF) * t;
    return tr << 16 | tg << 8 | tb;
}

export const POINT_RADIUS = 42;
export const DEFAULT_LINE_THICKNESS = 5;

export const PIXI_GRAPHIC_TYPE = 'pixi_graphic';
export type PIXI_GRAPHIC_TYPE = typeof PIXI_GRAPHIC_TYPE;

/**
 * Manages:
 * - Drawing elements
 * - Selection highlighting
 * - Element visibility/remembering
 * - Layer ordering
 * - Position/Translation updates
 * - Bit-by-bit remembering (background discovery)
 * - Interaction setup
 *
 * TODO: we could use a ParticleSystem in some instances
 */
export class PixiGraphicSystem implements System {
    readonly name = PIXI_GRAPHIC_TYPE;
    readonly dependencies = [PIXI_BOARD_TYPE, INTERACTION_TYPE];
    readonly provides = [GRAPHIC_TYPE];

    readonly components?: [PixiGraphicComponent, RememberComponent];

    world: World;
    storage = new SingleEcsStorage<PixiGraphicComponent>(GRAPHIC_TYPE, false, false);
    rememberStorage = new FlagEcsStorage<RememberComponent>(REMEMBER_TYPE, true, true);

    textSystem: TextSystem;
    pixiBoardSystem: PixiBoardSystem;
    interactionSystem: InteractionSystem;
    playerSystem?: PlayerSystem;

    private renImage: ImageRenderer;

    masterVisibility: boolean = false;
    gridSize: number = STANDARD_GRID_OPTIONS.size;


    constructor(world: World) {
        this.world = world;

        this.textSystem = world.requireSystem(TEXT_TYPE);
        this.pixiBoardSystem = world.requireSystem(PIXI_BOARD_TYPE);
        this.interactionSystem = world.requireSystem(INTERACTION_TYPE);

        world.addStorage(this.rememberStorage);
        world.addStorage(this.storage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_removed', this.onComponentRemoved, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
        world.events.on('selection_begin', this.onSelectionBegin, this);
        world.events.on('selection_end', this.onSelectionEnd, this);
        world.events.on('forget', this.onForget, this);

        this.renImage = new ImageRenderer(this);
    }

    getTexture(id: FileIndex): Promise<Texture<ImageBitmapResource> | 'unused'> {
        return this.renImage.getTexturePromise(id);
    }

    private onComponentAdd(c: Component): void {
        let spreadVis = false;
        let com: PixiGraphicComponent | undefined = undefined;

        if (c.type === GRAPHIC_TYPE) {
            com = c as PixiGraphicComponent;
            let pos = this.world.getComponent(c.entity, POSITION_TYPE)!;
            let trans = this.world.getComponent(c.entity, TRANSFORM_TYPE)!;
            this.updateElement(com, com.display, pos, trans, true);
            this.updateInteractive(com, pos, trans);
            this.updateVisibilityListener(com);

            let pv = this.world.getComponent(c.entity, PLAYER_VISIBLE_TYPE);
            let remembered = this.world.getComponent(c.entity, REMEMBER_TYPE) !== undefined;
            this.updateElementVisibility(com, com.display, true, !!pv?.visible, remembered);
            com._bitByBit = this.needsBitByBit(com, com.display);
            spreadVis = com._bitByBit;
        } else if (c.type === TRANSFORM_TYPE) {
            com = this.storage.getComponent(c.entity);
            if (com === undefined) return;
            let pos = this.world.getComponent(c.entity, POSITION_TYPE)!;
            let trans = c as TransformComponent;
            this.updateElement(com, com.display, pos, trans, true);
            spreadVis = !!com._bitByBit;
        } else if (c.type === REMEMBER_TYPE) {
            com = this.storage.getComponent(c.entity);
            if (com === undefined) return;
            this.updateElementVisibility(com, com.display, true, true, true);
        } else if (c.type === SHARED_TYPE) {
            let com = this.storage.getComponent(c.entity);
            if (com === undefined || !com._bitByBit) return;
            // Now you're visible! say hello
            let pv = this.world.getComponent(c.entity, PLAYER_VISIBLE_TYPE);
            let remembered = this.world.getComponent(c.entity, REMEMBER_TYPE) !== undefined;
            this.updateElementVisibility(com, com.display, true, !!pv?.visible, remembered);
            this.renImage.updateBBBVisAround(com);
        }

        if (spreadVis && com !== undefined) {
            this.renImage.updateBBBVisAround(com);
        }
    }

    private onComponentEdited(c: Component, changes: any): void {
        let spreadVis = false;
        let com: PixiGraphicComponent | undefined = undefined;

        if (c.type === GRAPHIC_TYPE) {
            com = c as PixiGraphicComponent;
            let pos = this.world.getComponent(c.entity, POSITION_TYPE)!;
            let trans = this.world.getComponent(c.entity, TRANSFORM_TYPE)!;
            this.runMethods(com, com.display);// run delayed methods (like _childrenAdd, _childrenReplace & co).
            this.updateInteractive(com, pos, trans);
            this.updateElement(com, com.display, pos, trans, true);
            let pv = this.world.getComponent(c.entity, PLAYER_VISIBLE_TYPE);
            let remembered = this.rememberStorage.getComponent(c.entity) !== undefined;
            this.updateElementVisibility(com, com.display, true, pv?.visible ?? true, remembered);
            com._bitByBit = this.needsBitByBit(com, com.display);
            spreadVis = com._bitByBit;
        } else if (c.type === POSITION_TYPE) {
            com = this.storage.getComponent(c.entity);
            if (com === undefined) return;
            let pos = c as PositionComponent;
            let trans = this.world.getComponent(c.entity, TRANSFORM_TYPE)!;
            this.updateElement(com, com.display, pos, trans, true);
            spreadVis = !!com._bitByBit;
        } else if (c.type === TRANSFORM_TYPE) {
            com = this.storage.getComponent(c.entity);
            if (com === undefined) return;
            let pos = this.world.getComponent(c.entity, POSITION_TYPE)!;
            let trans = c as TransformComponent;
            this.updateElement(com, com.display, pos, trans, true);
            spreadVis = !!com._bitByBit;
        } else if (c.type === PLAYER_VISIBLE_TYPE) {
            let pv = c as PlayerVisibleComponent;

            com = this.storage.getComponent(pv.entity);
            if (com === undefined) return;

            let remembered = false;
            if (com._visibListener === VisibListenerLevel.REMEMBER && pv.visible) {
                this.world.addComponent(c.entity, {
                    type: REMEMBER_TYPE,
                    entity: c.entity,
                } as RememberComponent);
                this.playerSystem!.removePlayerVisListener(c.entity);
                remembered = true;
            }

            if (!this.masterVisibility) {
                this.updateElementVisibility(com, com.display, true, pv.visible, remembered);
            }
        }

        if (spreadVis && com !== undefined) {
            this.renImage.updateBBBVisAround(com);
        }
    }

    private onComponentRemoved(c: Component): void {
        if (c.type === GRAPHIC_TYPE) {
            this.destroyElement(c.entity, (c as GraphicComponent).display, true);
        } else if (c.type === TRANSFORM_TYPE) {
            let com = this.storage.getComponent(c.entity);
            if (com === undefined) return;
            let pos = this.world.getComponent(c.entity, POSITION_TYPE)!;
            this.updateElement(com, com.display, pos, (c as TransformComponent), true);
        } else if (c.type === SHARED_TYPE) {
            const com = this.storage.getComponent(c.entity);
            if (com !== undefined) {
                this.updateElementVisibility(com, com.display, true, false, false);
            }
            // TODO: here?
        } else if (c.type === REMEMBER_TYPE && !this.world.isDespawning.includes(c.entity)) {
            const comp = this.storage.getComponent(c.entity);
            if (comp === undefined) return;
            if (comp._visibListener === VisibListenerLevel.REMEMBER) {
                this.playerSystem!.addPlayerVisListener(comp.entity, comp.isWall);
                // The wall is already there so we don't need to recompute visibility polygons
                // We just need to see if it's already being counted on.
                this.world.getSystem(VISIBILITY_AWARE_TYPE)?.manualRecomputeWall(comp.entity);
            }

            let pv = this.world.getComponent(c.entity, PLAYER_VISIBLE_TYPE)!;
            let remembered = this.world.getComponent(c.entity, REMEMBER_TYPE) !== undefined;
            this.updateElementVisibility(comp, comp.display, true, !!pv?.visible, remembered);
        }
    }

    private onResourceEdited(res: Resource, changes: any): void {
        if (res.type === 'local_light_settings') {
            let set = res as LocalLightSettings;
            if (!('visionType' in changes)) return;

            if (set.visionType === 'dm') {
                this.masterVisibility = true;
                for (let c of this.storage.allComponents()) {
                    this.updateElementVisibility(c, c.display, true, true, true);
                }
            } else if (set.visionType === 'rp') {
                this.masterVisibility = false;
                for (let c of this.storage.allComponents()) {
                    let pv = this.world.getComponent(c.entity, PLAYER_VISIBLE_TYPE)!;
                    let rem = this.rememberStorage.getComponent(c.entity);
                    this.updateElementVisibility(c, c.display, true, pv?.visible, rem !== undefined);
                }
            } else {
                throw new Error('Unknown vision type');
            }
        } else if (res.type === GRID_TYPE) {
            if (!('size' in changes)) return;
            // You are literally satan, I hate you.

            let posSto = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;
            let tranSto = this.world.storages.get(TRANSFORM_TYPE) as SingleEcsStorage<TransformComponent>;
            this.gridSize = (res as GridResource).size;

            for (let c of this.storage.allComponents()) {
                this.forEachEl(c, c.display,e => {
                    if ((e.type === ElementType.IMAGE && (e as ImageElement).scale === ImageScaleMode.GRID) || e.type === ElementType.TEXT) {
                        let pos = posSto.getComponent(c.entity)!;
                        let tran = tranSto.getComponent(c.entity)!;
                        this.updateElement(c, e, pos, tran, false);
                        if (e.type !== ElementType.TEXT) {
                            this.world.editComponent(c.entity, INTERACTION_TYPE, { shape: this.createShape(e, pos, tran)});
                        }
                    }
                });
            }
        }
    }

    private onSelectionBegin(entity: number): void {
        let c = this.storage.getComponent(entity);
        if (c !== undefined) {
            c._selected = true;
            let pos = this.world.getComponent(entity, POSITION_TYPE)!;
            let trans = this.world.getComponent(entity, TRANSFORM_TYPE)!;
            this.updateElement(c, c.display, pos, trans, true);
        }
    }

    private onSelectionEnd(entity: number): void {
        let c = this.storage.getComponent(entity);
        if (c !== undefined) {
            c._selected = false;
            let pos = this.world.getComponent(entity, POSITION_TYPE)!;
            let trans = this.world.getComponent(entity, TRANSFORM_TYPE)!;
            this.updateElement(c, c.display, pos, trans, true);
        }
    }

    private onForget(data: ForgetData) {
        for (let entity of data.entities) {
            const comp = this.storage.getComponent(entity);
            if (comp === undefined) continue;

            const rem = this.rememberStorage.getComponent(entity);
            if (rem !== undefined) {
                // We remember this!
                this.world.removeComponent(rem);

                /*let pv = this.world.getComponent(comp.entity, PLAYER_VISIBLE_TYPE);
                let remembered = this.rememberStorage.getComponent(comp.entity) !== undefined;
                this.updateElementVisibility(comp, comp.display, true, pv?.visible ?? true, remembered);

                this.updateVisibilityListener(comp);*/
            }

            if (comp._bitByBit) {
                this.renImage.doOnBitByBit(comp, comp.display, img => {
                    let w = new Container();
                    this.pixiBoardSystem.renderer.render(w, {
                        renderTexture: img._renTex,
                        clear: true,
                    });
                    img._visMapChanged = true;
                })

                this.renImage.updateBBBVisAround(comp);
            }
        }
    }

    forceShapeUpdate(comp: PixiGraphicComponent) {
        const pos = this.world.getComponent(comp.entity, POSITION_TYPE)!;
        const trans = this.world.getComponent(comp.entity, TRANSFORM_TYPE);
        this.updateInteractive(comp, pos, trans, true);
    }
    // -------------------------- LISTENERS DONE --------------------------

    private updateInteractive(comp: PixiGraphicComponent, pos: IPoint, trans: TransformComponent | undefined, forceRecreate: boolean = false) {
        let interactiveCmp = this.world.getComponent(comp.entity, INTERACTION_TYPE)!;

        if (comp.interactive && (interactiveCmp === undefined || forceRecreate)) {
            const newComp = {
                type: INTERACTION_TYPE,
                selectPriority: comp.display.priority,
                snapEnabled: true,
                shape: this.createShape(comp.display, pos, trans),
            } as InteractionComponent;
            if (interactiveCmp !== undefined) {
                this.world.editComponent(comp.entity, INTERACTION_TYPE, newComp);
            } else {
                this.world.addComponent(comp.entity, newComp);
            }
        } else if (!comp.interactive && interactiveCmp !== undefined) {
            this.world.removeComponent(interactiveCmp);
        } else if (comp.interactive) {
            const recFirst = (x: DisplayElement): DisplayElement => x.type === ElementType.CONTAINER ? recFirst(x.children![0]) : x;
            const elem = recFirst(comp.display);
            // Check for component changes in interactor
            if (elem.type === ElementType.IMAGE) {
                // If the texture has changed we need to update the interactor.
                let el = elem as PixiImageElement;
                if (el.texture.value !== el._oldTex) {
                    this.world.editComponent(comp.entity, INTERACTION_TYPE, {shape: this.createShape(el, pos, trans)});
                }
            } else if (elem.type === ElementType.POINT) {
                const shape = this.world.getComponent(comp.entity, INTERACTION_TYPE)!.shape as CircleShape;
                const el = elem as PointElement;
                const newRad = el.scale * (trans?.scale ?? 1) * POINT_RADIUS;
                if (Math.abs(shape.radius - newRad) > Number.EPSILON) {
                    shape.radius = newRad;
                    this.world.editComponent(comp.entity, INTERACTION_TYPE, { shape }, undefined, false);
                }
            }
        }
    }

    private createShape(comp: PixiDisplayElement, pos: IPoint, trans: TransformComponent | undefined): Shape {
        switch (comp.type) {
            case ElementType.CONTAINER:
                // Only the first element can be made interactive, the others are ignored
                return this.createShape(comp.children![0], pos, trans);
            case ElementType.TEXT:
                throw new Error('Cannot make interactive text');
            case ElementType.IMAGE: {
                let c = comp as PixiImageElement;
                return this.renImage.createShape(c, pos, trans);
            }
            case ElementType.LINE: {
                let c = comp as LineElement;
                return shapeLine(new Line(
                    pos.x, pos.y, pos.x + c.vec.x, pos.y + c.vec.y
                ));
            }
            case ElementType.POINT: {
                const c = comp as PointElement;
                return shapeCircle(new Point(pos.x, pos.y), c.scale * (trans?.scale ?? 1) * POINT_RADIUS);
            }
        }
    }

    private forEachEl(com: PixiGraphicComponent, img: PixiDisplayElement, f: (img: PixiDisplayElement) => void): void {
        f(img);
        if (img.children) {
            for (let c of img.children) {
                this.forEachEl(com, c, f);
            }
        }
    }

    private needsBitByBit(com: PixiGraphicComponent, img: PixiDisplayElement): boolean {
        if (img.type == ElementType.IMAGE && (img as PixiImageElement).visib === VisibilityType.REMEMBER_BIT_BY_BIT) {
            return true;
        }
        if (img.children) {
            for (let c of img.children) {
                if (this.needsBitByBit(com, c)) return true;
            }
        }
        return false;
    }

    private computeVisibilityListener(c: DisplayElement): VisibListenerLevel {
        let level;
        switch (c.visib) {
            case VisibilityType.NORMAL:
                // Already maximum level, no need for further checking
                return VisibListenerLevel.PERSISTENT;
            case VisibilityType.ALWAYS_VISIBLE:
            case VisibilityType.REMEMBER_BIT_BY_BIT:
            case VisibilityType.INVISIBLE:
                level = VisibListenerLevel.NOT_NEEDED;
                break;
            case VisibilityType.REMEMBER:
                level = VisibListenerLevel.REMEMBER;
                break;
        }

        if (c.children) {
            for (let ch of c.children) {
                level = Math.max(level, this.computeVisibilityListener(ch));
                if (level === VisibListenerLevel.PERSISTENT) break;// Already maxed out.
            }
        }

        return level;
    }

    private destroyElement(owner: number, desc: PixiDisplayElement, recursive: boolean): void {
        let elem = desc._pixi;

        if (elem === undefined) return;

        switch (desc._oldType) {
            case undefined:
            case ElementType.CONTAINER:
                break;
            case ElementType.IMAGE: {
                this.renImage.destroyElement(owner, desc as PixiImageElement);
                break;
            }
            case ElementType.LINE:
                (elem as Graphics).destroy({
                    children: false,
                    texture: true,
                    baseTexture: true,
                });
                break;
            case ElementType.POINT:
                (elem as Sprite).destroy(DESTROY_MIN);
                break;
            case ElementType.TEXT:
                (elem as Text).destroy(DESTROY_MIN);
                break;
        }

        desc._pixi = undefined;
        desc._oldType = undefined;

        if (recursive && desc.children) {
            for (let el of desc.children) {
                this.destroyElement(owner, el, true);
            }
        }
    }

    private createElement(cmp: PixiGraphicComponent, desc: PixiDisplayElement): void {
        this.destroyElement(cmp.entity, desc, false);

        if (desc.visib == VisibilityType.INVISIBLE) return;

        let defLayer = true;
        let res: DisplayObject;
        switch (desc.type) {
            case ElementType.CONTAINER:
                res = new Container();
                break;
            case ElementType.IMAGE:
                res = new Sprite();
                break;
            case ElementType.LINE:
                res = new Graphics();
                break;
            case ElementType.POINT:
                res = new Graphics();
                break;
            case ElementType.TEXT:
                const style = new TextStyle({
                    fill: 'white',
                    strokeThickness: 2,
                })
                res = new Text("", style);
                res.parentLayer = this.textSystem.textLayer;
                defLayer = false;
                break;
        }
        if (defLayer && cmp._layer !== undefined) {
            res.parentGroup = cmp._layer;
        }
        res.interactive = false;
        res.interactiveChildren = false;
        res.zIndex = desc.priority;
        desc._pixi = res;
        desc._oldType = desc.type;
        this.pixiBoardSystem.board.addChild(res);
        this.pixiBoardSystem.board.sortChildren();
    }

    private updateElementVisibility(par: PixiGraphicComponent, desc: PixiDisplayElement, recursive: boolean,
                                    currentlyVisible: boolean, remembered: boolean) {
        const pixi = desc._pixi;
        if (pixi === undefined) return;

        const isShared = this.world.getComponent(par.entity, SHARED_TYPE) !== undefined;
        let isVisible;
        if (currentlyVisible || this.masterVisibility) {
            isVisible = true;
        } else if(!isShared) {
            isVisible = false;// Not shared (and not master visibility)
        } else {
            switch (desc.visib) {
                case VisibilityType.INVISIBLE:
                    isVisible = false;
                    break;
                case VisibilityType.NORMAL:
                    isVisible = currentlyVisible;
                    break;
                case VisibilityType.ALWAYS_VISIBLE:
                case VisibilityType.REMEMBER_BIT_BY_BIT:
                    isVisible = true;
                    break;
                case VisibilityType.REMEMBER:
                    isVisible = remembered;
                    break;
            }
        }
        pixi.visible = isVisible;

        if (desc.visib === VisibilityType.REMEMBER_BIT_BY_BIT) {
            this.renImage.updateVisibility(desc as PixiImageElement);
        }

        if (recursive && desc.children) {
            for (let c of desc.children) {
                this.updateElementVisibility(par, c, true, currentlyVisible, remembered);
            }
        }
    }

    private updateVisibilityListener(el: PixiGraphicComponent) {
        let listLevel = this.computeVisibilityListener(el.display);
        let oldListLevel = el._visibListener || VisibListenerLevel.NOT_NEEDED;
        if (listLevel === oldListLevel) return;// No changes reported.

        let isRemembered = this.rememberStorage.getComponent(el.entity);

        let listenerNeeded;
        switch (listLevel) {
            case VisibListenerLevel.NOT_NEEDED: listenerNeeded = false;         break;
            case VisibListenerLevel.REMEMBER:   listenerNeeded = !isRemembered; break;
            case VisibListenerLevel.PERSISTENT: listenerNeeded = true;          break;
        }

        let oldListenerNeeded;
        switch (oldListLevel) {
            case VisibListenerLevel.NOT_NEEDED: oldListenerNeeded = false;         break;
            case VisibListenerLevel.REMEMBER:   oldListenerNeeded = !isRemembered; break;
            case VisibListenerLevel.PERSISTENT: oldListenerNeeded = true;          break;
        }

        // Why before? good question!
        // when we add the listener we could discover instantly that the visibility is present, thus calling
        // a callback to this system saying "hi, this element in which there's a visibility listener is visible"
        // if we set the listener after this the system will say "oh really, but there's no listener on this element"
        // (yeah I spent way too much time to debug this)
        el._visibListener = listLevel;
        if (listenerNeeded && !oldListenerNeeded) {
            this.playerSystem!.addPlayerVisListener(el.entity, el.isWall);
        } else if (!listenerNeeded && oldListenerNeeded) {
            this.playerSystem!.removePlayerVisListener(el.entity);
        }
    }

    private runMethods(par: PixiGraphicComponent, el: PixiDisplayElement) {
        if (el._childrenReplace) {
            if (el.children) {
                for (let c of el.children) {
                    this.destroyElement(par.entity, c, true);
                }
                el.children.length = 0;
            }
            el._childrenAdd = el._childrenReplace;
            el._childrenReplace = undefined;
        }
        if (el._childrenAdd) {
            if (el.children === undefined) el.children = [];
            el.children.push(...el._childrenAdd);
            el._childrenAdd = undefined;
        }
        if (el._childrenRemove) {
            if (el.children === undefined) return;
            for (let c of el._childrenRemove) {
                this.destroyElement(par.entity, c, true);
                arrayRemoveElem(el.children, c);
            }

            el._childrenRemove = undefined;
        }
        if (el.children) {
            for (let c of el.children) {
                this.runMethods(par, c);
            }
        }
    }

    private updateElement(par: PixiGraphicComponent, desc: PixiDisplayElement, pos: IPoint, trans: TransformComponent | undefined, recursive: boolean) {
        if (desc._oldType !== desc.type || desc.visib === VisibilityType.INVISIBLE) {
            this.createElement(par, desc);
        }

        const d = desc._pixi;
        if (d === undefined) return;

        if (desc.offset !== undefined) {
            d.position.set(pos.x + desc.offset.x, pos.y + desc.offset.y);
        } else {
            d.position.set(pos.x, pos.y);
        }

        switch (desc.type) {
            case ElementType.CONTAINER:
                break;
            case ElementType.IMAGE: {
                this.renImage.updateImage(par, desc as PixiImageElement, pos, trans);
                break;
            }
            case ElementType.LINE: {
                let g = (d as Graphics);
                let el = (desc as LineElement);

                g.clear();

                g.moveTo(0, 0);
                const thickness = el.thickness ?? DEFAULT_LINE_THICKNESS;
                g.lineStyle(thickness, el.color, el.alpha);
                g.lineTo(el.vec.x, el.vec.y);
                if (thickness > 10) {
                    g.lineStyle(0)
                    g.beginFill(el.color, el.alpha);
                    g.drawCircle(0, 0, thickness / 2);
                    g.drawCircle(el.vec.x, el.vec.y, thickness / 2);
                    g.endFill();
                }

                // TODO: show direction

                if (par._selected) {
                    g.lineStyle(0);

                    g.beginFill(0xe51010);
                    g.drawCircle(0, 0, thickness + 5);
                    g.endFill();

                    g.beginFill(el.color);
                    g.drawCircle(el.vec.x, el.vec.y, thickness + 5);
                    g.endFill();
                }

                break;
            }
            case ElementType.POINT: {
                let el = (desc as PointElement);
                let color = el.color;
                if (par._selected) {
                    color = lerpColor(color, 0x7986CB, 0.3);
                }
                let g = d as Graphics;
                g.clear();
                g.beginFill(color, el.alpha);
                g.lineStyle(0);
                g.drawCircle(0, 0, el.scale * POINT_RADIUS);
                g.endFill();
                break;
            }
            case ElementType.TEXT: {
                let el = (desc as TextElement);
                let g = (d as Text);
                g.text = el.text;
                g.anchor.copyFrom(el.anchor);
                g.style.fontSize = Math.round(26 * this.gridSize / STANDARD_GRID_OPTIONS.size);
                g.style.fill = el.color;
                g.style.align = el.lineAlign;
                break;
            }
        }

        if (recursive && desc.children) {
            for (let el of desc.children) {
                this.updateElement(par, el, pos, trans, true);
            }
        }
    }


    enable(): void {
        this.playerSystem = this.world.requireSystem(PLAYER_TYPE);
        this.masterVisibility = this.world.requireSystem(LIGHT_TYPE).localLightSettings.visionType === 'dm';
        this.gridSize = this.world.getResource(GRID_TYPE)!.size;
    }

    destroy(): void {
        for (let elem of this.storage.allComponents()) {
            this.destroyElement(elem.entity, elem.display, true);
        }
    }
}
