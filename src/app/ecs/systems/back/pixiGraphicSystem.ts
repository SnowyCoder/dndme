import {
    Component,
    HOST_HIDDEN_TYPE,
    POSITION_TYPE,
    PositionComponent,
    TRANSFORM_TYPE,
    TransformComponent
} from "../../component";
import {FlagEcsStorage, SingleEcsStorage} from "../../storage";
import {World} from "../../world";
import {System} from "../../system";
import {
    DisplayElement,
    ElementType,
    EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE,
    GRAPHIC_TYPE,
    GraphicComponent,
    ImageElement,
    ImageScaleMode,
    LineElement,
    PointElement,
    TextElement,
    VisibilityType
} from "../../../graphics";
import {GridResource, Resource} from "../../resource";
import PIXI from "../../../PIXI";
import {BLEND_MODES, IPointData, Matrix, RenderTexture, RenderTexturePool, Texture} from "pixi.js";
import {DESTROY_ALL, DESTROY_MIN} from "../../../util/pixi";
import {STANDARD_GRID_OPTIONS} from "../../../game/grid";
import {
    EVENT_VISIBILITY_SPREAD,
    PLAYER_TYPE,
    PLAYER_VISIBLE_TYPE,
    PlayerSystem,
    PlayerVisibleComponent,
    VisibilitySpreadData
} from "../playerSystem";
import {LIGHT_TYPE, LightSystem, LocalLightSettings} from "../lightSystem";
import {
    INTERACTION_TYPE,
    InteractionComponent,
    InteractionSystem,
    Shape,
    shapeAabb,
    shapeLine,
    shapeObb,
    shapePoint,
    shapeToAabb
} from "./interactionSystem";
import {BitSet} from "../../../util/bitSet";
import {Aabb} from "../../../geometry/aabb";
import {Obb} from "../../../geometry/obb";
import {Line} from "../../../geometry/line";
import {arrayRemoveElem} from "../../../util/array";
import {GRID_TYPE} from "../gridSystem";
import {PIXI_BOARD_TYPE, PixiBoardSystem} from "./pixiBoardSystem";
import {TEXT_TYPE, TextSystem} from "./textSystem";

export interface PixiGraphicComponent extends GraphicComponent {
    _selected: boolean;
    _visibListener?: VisibListenerLevel;// Default: NOT_NEEDED
    _bitByBit?: boolean;
    _layer?: PIXI.display.Group;
}

export interface PixiDisplayElement extends DisplayElement {
    _oldType?: ElementType;
    _pixi?: PIXI.DisplayObject;
}

interface PixiImageElement extends ImageElement, PixiDisplayElement {
    type: ElementType.IMAGE;// interference between interfaces (good-old diamond problem?)
    _oldTex?: Texture,
    _renTex?: RenderTexture;
    _visMapChanged?: boolean;
    _pixi?: PIXI.Sprite;
}

interface CustomTexture extends PIXI.Texture {
    gridSize?: {
        x: number;
        y: number;
        updateId: number;
    }
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

export const POINT_RADIUS = 12;

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

    world: World;
    storage = new SingleEcsStorage<PixiGraphicComponent>(GRAPHIC_TYPE, false, false);
    rememberStorage = new FlagEcsStorage(REMEMBER_TYPE, true, true);

    textSystem: TextSystem;
    pixiBoardSystem: PixiBoardSystem;
    interactionSystem: InteractionSystem;
    playerSystem?: PlayerSystem;
    renderTexturePool = new RenderTexturePool();
    circleTex?: PIXI.Texture;

    masterVisibility: boolean = false;


    constructor(world: World) {
        this.world = world;

        this.textSystem = world.systems.get(TEXT_TYPE) as TextSystem;
        this.pixiBoardSystem = world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
        this.interactionSystem = world.systems.get(INTERACTION_TYPE) as InteractionSystem;

        world.addStorage(this.rememberStorage);
        world.addStorage(this.storage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_removed', this.onComponentRemoved, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
        world.events.on('selection_begin', this.onSelectionBegin, this);
        world.events.on('selection_end', this.onSelectionEnd, this);
        world.events.on(EVENT_VISIBILITY_SPREAD, this.onBBBVisibilitySpread, this);
        world.events.on('serialize', this.onSerialize, this);
        world.events.on('serialize_entity', this.onSerializeEntity, this);
    }

    private onComponentAdd(c: Component): void {
        let spreadVis = false;
        let com: PixiGraphicComponent | undefined = undefined;

        if (c.type === GRAPHIC_TYPE) {
            com = c as PixiGraphicComponent;
            let pos = this.world.getComponent(c.entity, POSITION_TYPE) as PositionComponent;
            let trans = this.world.getComponent(c.entity, TRANSFORM_TYPE) as TransformComponent;
            this.updateInteractive(com, pos, trans);
            this.updateElement(com, com.display, pos, trans, true);
            this.updateVisibilityListener(com);

            let pv = this.world.getComponent(c.entity, PLAYER_VISIBLE_TYPE) as PlayerVisibleComponent | undefined;
            let remembered = this.world.getComponent(c.entity, REMEMBER_TYPE) !== undefined;
            this.updateElementVisibility(com, com.display, true, !!pv?.visible, remembered);
            com._bitByBit = this.needsBitByBit(com, com.display);
            spreadVis = com._bitByBit;
        } else if (c.type === TRANSFORM_TYPE) {
            com = this.storage.getComponent(c.entity);
            if (com === undefined) return;
            let pos = this.world.getComponent(c.entity, POSITION_TYPE) as PositionComponent;
            let trans = c as TransformComponent;
            this.updateElement(com, com.display, pos, trans, true);
            spreadVis = !!com._bitByBit;
        } else if (c.type === REMEMBER_TYPE) {
            com = this.storage.getComponent(c.entity);
            if (com === undefined) return;
            this.updateElementVisibility(com, com.display, true, true, true);
        } else if (c.type === HOST_HIDDEN_TYPE) {
            // TODO: here?
        }

        if (spreadVis && com !== undefined) {
            this.updateBBBVisAround(com);
        }
    }

    private onComponentEdited(c: Component, changes: any): void {
        let spreadVis = false;
        let com: PixiGraphicComponent | undefined = undefined;

        if (c.type === GRAPHIC_TYPE) {
            com = c as PixiGraphicComponent;
            let pos = this.world.getComponent(c.entity, POSITION_TYPE) as PositionComponent;
            let trans = this.world.getComponent(c.entity, TRANSFORM_TYPE) as TransformComponent;
            this.runMethods(com, com.display);// run delayed methods (like _childrenAdd, _childrenReplace & co).
            this.updateInteractive(com, pos, trans);
            this.updateElement(com, com.display, pos, trans, true);
            let pv = this.world.getComponent(c.entity, PLAYER_VISIBLE_TYPE) as PlayerVisibleComponent | undefined;
            let remembered = this.rememberStorage.getComponent(c.entity) !== undefined;
            this.updateElementVisibility(com, com.display, true, pv?.visible ?? true, remembered);
            com._bitByBit = this.needsBitByBit(com, com.display);
            spreadVis = com._bitByBit;

            if ('interactive' in changes) {
                this.updateInteractive(com, pos, trans);
            }
        } else if (c.type === POSITION_TYPE) {
            com = this.storage.getComponent(c.entity);
            if (com === undefined) return;
            let pos = c as PositionComponent;
            let trans = this.world.getComponent(c.entity, TRANSFORM_TYPE) as TransformComponent;
            this.updateElement(com, com.display, pos, trans, true);
            spreadVis = !!com._bitByBit;
        } else if (c.type === TRANSFORM_TYPE) {
            com = this.storage.getComponent(c.entity);
            if (com === undefined) return;
            let pos = this.world.getComponent(c.entity, POSITION_TYPE) as PositionComponent;
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
            this.updateBBBVisAround(com);
        }
    }

    private onComponentRemoved(c: Component): void {
        if (c.type === GRAPHIC_TYPE) {
            this.destroyElement((c as GraphicComponent).display, true);
        } else if (c.type === TRANSFORM_TYPE) {
            let com = this.storage.getComponent(c.entity);
            if (com === undefined) return;
            let pos = this.world.getComponent(c.entity, POSITION_TYPE) as PositionComponent;
            this.updateElement(com, com.display, pos, (c as TransformComponent), true);
        } else if (c.type === HOST_HIDDEN_TYPE) {
            let com = this.storage.getComponent(c.entity);
            if (com === undefined || !com._bitByBit) return;
            // Now you're visible! say hello
            this.updateBBBVisAround(com);
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
                    let pv = this.world.getComponent(c.entity, 'player_visible') as PlayerVisibleComponent;
                    let rem = this.rememberStorage.getComponent(c.entity);
                    this.updateElementVisibility(c, c.display, true, pv?.visible, rem !== undefined);
                }
            } else {
                throw 'Unknown vision type';
            }
        } else if (res.type === GRID_TYPE) {
            if (!('width' in changes)) return;
            // You are literally satan, I hate you.

            let posSto = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;
            let tranSto = this.world.storages.get(TRANSFORM_TYPE) as SingleEcsStorage<TransformComponent>;

            for (let c of this.storage.allComponents()) {
                this.forEachEl(c, c.display,e => {
                    if (e.type === ElementType.IMAGE && (e as ImageElement).scale === ImageScaleMode.GRID) {
                        let pos = posSto.getComponent(c.entity)!;
                        let tran = tranSto.getComponent(c.entity)!;
                        this.updateElement(c, e, pos, tran, false);
                        this.world.editComponent(c.entity, INTERACTION_TYPE, { shape: this.createShape(e, pos, tran)});
                    }
                });
            }
        }
    }

    private onSelectionBegin(entity: number): void {
        let c = this.storage.getComponent(entity);
        if (c !== undefined) {
            c._selected = true;
            let pos = this.world.getComponent(entity, POSITION_TYPE) as PositionComponent;
            let trans = this.world.getComponent(entity, TRANSFORM_TYPE) as TransformComponent;
            this.updateElement(c, c.display, pos, trans, true);
        }
    }

    private onSelectionEnd(entity: number): void {
        let c = this.storage.getComponent(entity);
        if (c !== undefined) {
            c._selected = false;
            let pos = this.world.getComponent(entity, POSITION_TYPE) as PositionComponent;
            let trans = this.world.getComponent(entity, TRANSFORM_TYPE) as TransformComponent;
            this.updateElement(c, c.display, pos, trans, true);
        }
    }

    private onBBBVisibilitySpread(data: VisibilitySpreadData): void {
        let iter = this.interactionSystem.query(shapeAabb(data.aabb), c => {
            let com = this.storage.getComponent(c.entity);
            return com !== undefined && com._bitByBit === true;
        });
        for (let c of iter) {
            // If we are here then the component exists, we checked it in the iterator
            let cmp = this.storage.getComponent(c.entity)!;
            this.doOnBitByBit(cmp, cmp.display, (img) => this.updateBBBVisibility(data, cmp, img));
        }
    }

    private onSerialize(): void {
        let changedList = [];
        for (let com of this.storage.allComponents()) {
            if (!com._bitByBit) continue;
            let changed = false;
            this.doOnBitByBit(com, com.display, (img) => changed ||= this.extractVisibility(img));
            if (changed) changedList.push(com.entity);
        }
        if (changedList) {
            this.world.events.emit(EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE, changedList);
        }
    }

    private onSerializeEntity(entity: number): void {
        let c = this.storage.getComponent(entity);
        if (c === undefined) return;
        let changed = false;
        this.doOnBitByBit(c, c.display, (img) => changed ||= this.extractVisibility(img));

        if (changed) {
            this.world.events.emit(EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE, [entity]);
        }
    }
    // -------------------------- LISTENERS DONE --------------------------

    private updateInteractive(comp: PixiGraphicComponent, pos: IPointData, trans: TransformComponent | undefined) {
        let interactiveCmp = this.world.getComponent(comp.entity, INTERACTION_TYPE) as InteractionComponent;

        if (comp.interactive && interactiveCmp === undefined) {
            this.world.addComponent(comp.entity, {
                type: INTERACTION_TYPE,
                selectPriority: comp.display.priority,
                snapEnabled: true,
                shape: this.createShape(comp.display, pos, trans),
            } as InteractionComponent);
        } else if (!comp.interactive && interactiveCmp !== undefined) {
            this.world.removeComponent(interactiveCmp);
        } else if (comp.interactive) {
            // Check for component changes in interactor
            if (comp.display.type === ElementType.IMAGE) {
                // If the texture has changed we need to update the interactor.
                let el = comp.display as PixiImageElement;
                if (el.texture !== el._oldTex) {
                    this.world.editComponent(comp.entity, INTERACTION_TYPE, {shape: this.createShape(el, pos, trans)});
                }
            }
        }
    }

    private createShape(comp: PixiDisplayElement, pos: IPointData, trans: TransformComponent | undefined): Shape {
        switch (comp.type) {
            case ElementType.CONTAINER:
                // Only the root element can be made interactive, the others are ignored
                throw 'Cannot make interactive container';
            case ElementType.TEXT:
                throw 'Cannot make interactive text';
            case ElementType.IMAGE: {
                let c = comp as ImageElement;
                let w = c.texture.width;
                let h = c.texture.height;
                let aabb;

                let sx = trans?.scale || 1;
                let sy = trans?.scale || 1;

                if (c.scale == ImageScaleMode.GRID) {
                    this.textureUpdateGridSize(c.texture);
                    let grid = this.world.getResource(GRID_TYPE) as GridResource;
                    let gsize = (c.texture as CustomTexture).gridSize!!;
                    sx = gsize.x * grid.size * sx;
                    sy = gsize.y * grid.size * sy;
                }

                aabb = Aabb.fromPointAnchor(pos, {x: w, y: h}, c.anchor);
                aabb.scale(sx, sy, aabb);
                let obb = Obb.rotateAabb(aabb.copy(), trans?.rotation || 0);
                return shapeObb(obb);
            }
            case ElementType.LINE: {
                let c = comp as LineElement;
                return shapeLine(new Line(
                    pos.x, pos.y, pos.x + c.vec.x, pos.y + c.vec.y
                ));
            }
            case ElementType.POINT: {
                return shapePoint(new PIXI.Point(pos.x, pos.y));
            }
        }
    }

    /**
     * Extracts visibility from the rendertexture of the image (must be VISBLE_BIT_BY_BIT).
     *
     * @param c the image from which the visibility map will be extracted.
     * @return true only if the visibility map has been modified.
     * @private
     */
    private extractVisibility(c: PixiImageElement): boolean {
        if (c._visMapChanged !== true) return false;

        c.visMap = undefined;

        const renderer = this.pixiBoardSystem.renderer;
        const tex = c._renTex;
        if (tex === undefined) return false;

        let frame = tex.frame;

        renderer.renderTexture.bind(tex);
        let webglPixels = new Uint8Array(tex.width * tex.height * 4);

        const gl = renderer.gl;
        gl.readPixels(
            frame.x,
            frame.y,
            frame.width,
            frame.height,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            webglPixels
        );

        let fuckLen = webglPixels.length / 4;
        let newLen = ((webglPixels.length / 4 - 1) >>> 5) + 1;
        let target = new Uint32Array(newLen);
        for (let i = 0; i < fuckLen; i++) {
            let pixel = webglPixels[i * 4 + 3];

            if ((pixel & 0x80) !== 0) {
                target[i >>> 5] |= 1 << (i & 0b11111);
            }
        }
        c.visMap = target;
        c._visMapChanged = false;
        return true;
    }

    private loadVisibility(c: PixiImageElement) {
        const width = c.texture.width;
        const height = c.texture.height;

        if (c._renTex === undefined) {
            c._renTex = PIXI.RenderTexture.create({
                width, height,
                scaleMode: c.texture.baseTexture.scaleMode,
            });
            let bt = c._renTex.baseTexture;
            (bt as any).clearColor = [0.0, 0.0, 0.0, 0.0];
        }

        if (c.visMap === undefined) return;

        let texOpts = {
            width, height,
            format: PIXI.FORMATS.RGBA,
        };

        let texData = new Uint32Array(c.texture.width * c.texture.height);

        let set = new BitSet(c.visMap);
        let len = texData.length;
        for (let i = 0; i < len; i++) {
            texData[i] = set.get(i) ? 0xFFFFFFFF : 0;
        }

        let byteData = new Uint8Array(texData.buffer);
        let resource = new PIXI.resources.BufferResource(byteData, { width, height });
        let baseTexture = new PIXI.BaseTexture(resource, texOpts)

        let tex = new PIXI.Texture(baseTexture);
        let lumSprite = new PIXI.Sprite(tex);
        lumSprite.blendMode = PIXI.BLEND_MODES.SRC_IN;

        let mapSprite = new PIXI.Sprite(c.texture);
        let cnt = new PIXI.Container();
        cnt.addChild(mapSprite, lumSprite);

        this.pixiBoardSystem.renderer.render(cnt, c._renTex, true);

        lumSprite.destroy(DESTROY_ALL);

        c._visMapChanged = false;
    }

    private forEachEl(com: PixiGraphicComponent, img: PixiDisplayElement, f: (img: PixiDisplayElement) => void): void {
        f(img);
        if (img.children) {
            for (let c of img.children) {
                this.forEachEl(com, c, f);
            }
        }
    }

    private doOnBitByBit(com: PixiGraphicComponent, img: PixiDisplayElement, f: (img: PixiImageElement) => void): void {
        if (img.type == ElementType.IMAGE && (img as PixiImageElement).visib === VisibilityType.REMEMBER_BIT_BY_BIT) {
            f(img as PixiImageElement);
        }
        if (img.children) {
            for (let c of img.children) {
                this.doOnBitByBit(com, c, f);
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

    private updateBBBVisAround(com: PixiGraphicComponent) {
        let inter = this.world.getComponent(com.entity, INTERACTION_TYPE) as InteractionComponent;
        let aabb = shapeToAabb(inter.shape);
        this.playerSystem!.getSpreadDataForAabb(aabb, data => {
            this.doOnBitByBit(com, com.display, (img) => this.updateBBBVisibility(data, com, img));
        });
    }

    private updateBBBVisibility(data: VisibilitySpreadData, com: PixiGraphicComponent, img: PixiImageElement) {
        //      Part 1. What?
        // So, what does this spaghetti mess do? Good question!
        // We have players and lights, some players can see without lights and others can't
        // The task is to update the rendertexture of the background component adding the visible spots to it.
        // The visible spots are: The meshes of the players with night vision enabled and the intersection of the
        // union of the vision mesh of the normal players with the union of the vison meshes of the lights.
        // Common case: 1 NV player 0 lights, 1 player multiple lights, multiple players 1 light
        // Possible (but uncommon) cases: x NV players, y normal players, z lights (with x, y, z naturals).

        //      Part 2. How?
        // The initial idea is simple, render anything on the bkg._renTex and then render the original texture with
        // blendMode = SRC_IN, any spot with alpha = 1 will then be replaced with the correct texture.
        // The night vision players rendering is quite simple, just render the meshes before the final texture render
        // The normal players will be a bit different since we need to intersect their meshes with the light mesh.
        // To do that we can render all the players meshes in a framebuffer A, then render all of the lights in another
        // frame buffer B, then render A onto B with blendMode = SRC_IN to create a sort of union of the two.
        // Once that is done we can render B into the bkg._renTex and proceed normally.
        // Another way to do this using only a single rendertexture is to use the stencil buffer, but it will double the
        // mesh render calls (and since they are not buffered, it's a slow operation)
        // I don't think that there is another way to perform this in the general case, please prove me wrong.
        // TODO: maybe we can optimize this when only 1 player and 1 light is present (like, avoiding 1 of the 2 framebuffers).

        // Skip EVERYTHING if this entity is hidden.
        if (this.world.getComponent(com.entity, HOST_HIDDEN_TYPE)) return;

        //console.time('updateVisibility');

        let renderer = this.pixiBoardSystem.renderer;

        let localCnt = new PIXI.Container();
        // Setup local transform
        let m = new Matrix();
        let pixi = img._pixi!;
        m.translate(
            -pixi.position.x,
            -pixi.position.y
        );
        m.rotate(-pixi.rotation);
        let invScale = 1/pixi.scale.x;
        m.scale(invScale, invScale);
        m.translate(img.texture.width / 2, img.texture.height / 2);
        localCnt.transform.setFromMatrix(m);

        let worldCnt = new PIXI.Container();

        // If there are any players without night vision (and there are lights) render them (THIS IS SLOW!)
        let tex, tex2, nightSprite;
        if (data.players.length !== 0 && data.lights.length !== 0) {
            tex = (this.renderTexturePool as any).getOptimalTexture(pixi.texture.width, pixi.texture.height);
            tex2 = (this.renderTexturePool as any).getOptimalTexture(pixi.texture.width, pixi.texture.height);

            for (let player of data.players) {
                localCnt.addChild(player.mesh);
            }

            // Render the players visibility meshes onto tex
            renderer.render(localCnt, tex, true);
            localCnt.removeChildren();

            for (let light of data.lights) {
                light.mesh.blendMode = PIXI.BLEND_MODES.ADD;
                localCnt.addChild(light.mesh);
            }

            let playerSprite = new PIXI.Sprite(tex);
            playerSprite.blendMode = BLEND_MODES.SRC_IN;

            // Render the lights onto tex2, then render tex as BLEND_MODE.SRC_IN to filter out where the lights were not
            // present.
            worldCnt.addChild(localCnt, playerSprite);
            renderer.render(worldCnt, tex2, true);
            worldCnt.removeChildren();
            localCnt.removeChildren();

            // Add tex2 to the main phase
            nightSprite = new PIXI.Sprite(tex2);
            nightSprite.blendMode = PIXI.BLEND_MODES.ADD;
            worldCnt.addChild(nightSprite);
        }

        for (let player of data.nightVisPlayers) {
            localCnt.addChild(player.mesh);
        }

        let origTex = new PIXI.Sprite(img.texture);
        origTex.blendMode = PIXI.BLEND_MODES.SRC_IN;

        worldCnt.addChild(localCnt, origTex)

        // Render everything to bkg._renTex and then redraw the original only where is alpha=1.
        this.pixiBoardSystem.renderer.render(worldCnt, img._renTex, false);
        img._visMapChanged = true;

        // Cleanup time (don't worry, I'm recycling and there's a garbage cleaner, we're eco friendly!)
        worldCnt.destroy(DESTROY_MIN);
        origTex.destroy(DESTROY_MIN);

        if (tex !== undefined) this.renderTexturePool.returnTexture(tex);
        if (tex2 !== undefined) this.renderTexturePool.returnTexture(tex2);
        if (nightSprite !== undefined) nightSprite.destroy(DESTROY_MIN);

        //console.timeEnd('updateVisibility');
    }

    private computeVisibilityListener(c: DisplayElement): VisibListenerLevel {
        let level;
        switch (c.visib) {
            case VisibilityType.NORMAL:
                // Already maximum level, no need for further checking
                return VisibListenerLevel.PERSISTENT;
            case VisibilityType.ALWAYS_VISIBLE:
            case VisibilityType.REMEMBER_BIT_BY_BIT:
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

    private destroyElement(desc: PixiDisplayElement, recursive: boolean): void {
        let elem = desc._pixi;

        if (elem === undefined) return;

        switch (desc._oldType) {
            case undefined:
            case ElementType.CONTAINER:
                break;
            case ElementType.IMAGE: {
                let im = desc as PixiImageElement;
                let destroyTex = im.sharedTexture !== true;
                (elem as PIXI.Sprite).destroy({
                    children: false,
                    texture: destroyTex,
                    baseTexture: destroyTex,
                });
                if (im._renTex !== undefined) {
                    im._renTex.destroy(true);
                }
                break;
            }
            case ElementType.LINE:
                (elem as PIXI.Graphics).destroy({
                    children: false,
                    texture: true,
                    baseTexture: true,
                });
                break;
            case ElementType.POINT:
                (elem as PIXI.Sprite).destroy(DESTROY_MIN);
                break;
            case ElementType.TEXT:
                (elem as PIXI.Text).destroy(DESTROY_MIN);
                break;
        }

        desc._pixi = undefined;
        desc._oldType = undefined;

        if (recursive && desc.children) {
            for (let el of desc.children) {
                this.destroyElement(el, true);
            }
        }
    }

    private createElement(cmp: PixiGraphicComponent, desc: PixiDisplayElement): void {
        this.destroyElement(desc, false);

        let defLayer = true;
        let res;
        switch (desc.type) {
            case ElementType.CONTAINER:
                res = new PIXI.Container();
                break;
            case ElementType.IMAGE:
                res = new PIXI.Sprite();
                break;
            case ElementType.LINE:
                res = new PIXI.Graphics();
                break;
            case ElementType.POINT:
                res = new PIXI.Sprite(this.circleTex);
                break;
            case ElementType.TEXT:
                res = new PIXI.Text("");
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

    private textureUpdateGridSize(tex: CustomTexture): void {
        let texId = (tex as any)._updateID;
        if (tex.gridSize !== undefined && tex.gridSize.updateId !== texId) return;

        tex.gridSize = {
            x: Math.ceil(tex.width / STANDARD_GRID_OPTIONS.size) / tex.width,
            y: Math.ceil(tex.height / STANDARD_GRID_OPTIONS.size) / tex.height,
            updateId: texId,
        }
    }

    private updateElementVisibility(par: PixiGraphicComponent, desc: PixiDisplayElement, recursive: boolean,
                                    currentlyVisible: boolean, remembered: boolean) {
        let isVisible;
        if (currentlyVisible || this.masterVisibility) {
            isVisible = true;
        } else {
            switch (desc.visib) {
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
        let pixi = desc._pixi!;
        pixi.visible = isVisible;

        if (desc.visib === VisibilityType.REMEMBER_BIT_BY_BIT) {
            let im = (desc as PixiImageElement);
            im._pixi!.texture = this.masterVisibility ? im.texture : im._renTex!;
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
                    this.destroyElement(c, true);
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
                this.destroyElement(c, true);
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

    private updateElement(par: PixiGraphicComponent, desc: PixiDisplayElement, pos: IPointData, trans: TransformComponent | undefined, recursive: boolean) {
        if (desc._oldType !== desc.type) {
            this.createElement(par, desc);
        }

        let d = desc._pixi!;

        if (desc.offset !== undefined) {
            d.position.set(pos.x + desc.offset.x, pos.y + desc.offset.y);
        } else {
            d.position.set(pos.x, pos.y);
        }

        switch (desc.type) {
            case ElementType.CONTAINER:
                break;
            case ElementType.IMAGE: {
                let dim = (d as PIXI.Sprite);
                let el = (desc as PixiImageElement);
                if (el.visib == VisibilityType.REMEMBER_BIT_BY_BIT) {
                    dim.texture = this.masterVisibility ? el.texture : el._renTex!;
                } else {
                    dim.texture = el.texture;
                }
                dim.anchor.copyFrom(el.anchor);
                let sx = trans?.scale || 1;
                let sy = sx;
                if (el.scale === ImageScaleMode.GRID) {
                    this.textureUpdateGridSize(dim.texture);
                    let grid = this.world.getResource(GRID_TYPE) as GridResource;
                    let gsize = (dim.texture as CustomTexture).gridSize!!;
                    sx = gsize.x * grid.size * sx;
                    sy = gsize.y * grid.size * sy;
                }
                dim.rotation = trans?.rotation || 0;
                dim.scale.set(sx, sy);
                dim.tint = par._selected ? 0x7986CB : 0xFFFFFF;


                if (el.visib === VisibilityType.REMEMBER_BIT_BY_BIT) {
                    if (el._oldTex !== el.texture) {
                        this.loadVisibility(el);
                    }
                } else if (el._renTex !== undefined) {
                    el._renTex.destroy(true);
                    el._renTex = undefined;
                }
                el._oldTex = el.texture;

                break;
            }
            case ElementType.LINE: {
                let g = (d as PIXI.Graphics);
                let el = (desc as LineElement);

                g.clear();

                g.moveTo(0, 0);
                g.lineStyle(5, el.color);
                g.lineTo(el.vec.x, el.vec.y);

                if (par._selected) {
                    g.lineStyle(0);

                    g.beginFill(0xe51010);
                    g.drawCircle(0, 0, 10);
                    g.endFill();

                    g.beginFill(el.color);
                    g.drawCircle(el.vec.x, el.vec.y, 10);
                    g.endFill();
                }

                break;
            }
            case ElementType.POINT: {
                let color = (desc as PointElement).color;
                if (par._selected) {
                    color = lerpColor(color, 0x7986CB, 0.3);
                }
                (d as PIXI.Sprite).tint = color;
                break;
            }
            case ElementType.TEXT: {
                let el = (desc as TextElement);
                let g = (d as PIXI.Text);
                g.text = el.text;
                g.anchor.copyFrom(el.anchor);
                g.tint = el.color;
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
        this.playerSystem = this.world.systems.get(PLAYER_TYPE) as PlayerSystem;
        this.masterVisibility = (this.world.systems.get(LIGHT_TYPE) as LightSystem).localLightSettings.visionType === 'dm';

        let g = new PIXI.Graphics();
        g.beginFill(0xFFFFFF);
        g.lineStyle(0);
        g.drawCircle(POINT_RADIUS, POINT_RADIUS, POINT_RADIUS);
        this.circleTex = this.pixiBoardSystem.renderer.generateTexture(g, PIXI.SCALE_MODES.LINEAR, 1);
        this.circleTex.defaultAnchor.set(0.5, 0.5);
    }

    destroy(): void {
        for (let elem of this.storage.allComponents()) {
            this.destroyElement(elem.display, true);
        }
    }
}
