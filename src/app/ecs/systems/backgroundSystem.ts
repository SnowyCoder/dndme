import {System} from "../system";
import {World} from "../ecs";
import PIXI from "../../PIXI";
import {DESTROY_ALL, DESTROY_MIN, loadTexture} from "../../util/pixi";
import {EditMapPhase} from "../../phase/editMap/editMapPhase";
import {Component, PositionComponent, TransformComponent} from "../component";
import {SingleEcsStorage} from "../storage";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {app} from "../../index";
import {BitSet} from "../../util/bitSet";
import {Aabb} from "../../geometry/aabb";
import {VisibilitySpreadData} from "./playerSystem";
import {InteractionComponent, ObbShape, shapeAabb, shapeObb} from "./interactionSystem";
import {Obb} from "../../geometry/obb";
import {BLEND_MODES, Matrix, RenderTexturePool, Transform} from "pixi.js";
import {Resource} from "../resource";
import {LocalLightSettings} from "./lightSystem";
import inv = PIXI.groupD8.inv;

type BACKGROUND_TYPE = 'background_image';
const BACKGROUND_TYPE = 'background_image';

export interface BackgroundImageComponent extends Component {
    type: BACKGROUND_TYPE;

    image: Uint8Array;
    imageType: string;
    visibilityMap?: Uint32Array;

    _visibilityMapChanged?: boolean;
    _texture?: PIXI.Texture;
    _renTex?: PIXI.RenderTexture;
    _display?: PIXI.Sprite;
    _html?: HTMLImageElement;
    _treeEntry?: number;
}


export class BackgroundSystem implements System {
    readonly ecs: World;
    readonly phase: EditMapPhase;
    readonly storage: SingleEcsStorage<BackgroundImageComponent>;

    displayMaps: PIXI.Container;
    displayLayer: PIXI.display.Layer;

    renderTexturePool = new RenderTexturePool();

    constructor(world: World, phase: EditMapPhase) {
        this.ecs = world;
        this.phase = phase;
        this.storage = new SingleEcsStorage<BackgroundImageComponent>(BACKGROUND_TYPE, true, true);

        this.ecs.addStorage(this.storage);
        this.ecs.events.on('entity_spawned', this.onEntitySpawned, this);
        this.ecs.events.on('component_edited', this.onComponentEdit, this);
        this.ecs.events.on('component_remove', this.onComponentRemove, this);
        this.ecs.events.on('resource_edited', this.onResourceEdited, this);
        this.ecs.events.on('selection_begin', this.onSelectionBegin, this);
        this.ecs.events.on('selection_end', this.onSelectionEnd, this);
        this.ecs.events.on('visibility_spread', this.onVisibilitySpread, this);
        this.ecs.events.on('serialize', this.onSerialize, this);
        this.ecs.events.on('serialize_entity', this.onSerializeEntity, this);
    }

    private onSelectionBegin(entity: number): void {
        let img = this.storage.getComponent(entity);
        if (img === undefined) return;
        img._display.tint = 0x7986CB;
    }

    private onSelectionEnd(entity: number): void {
        let img = this.storage.getComponent(entity);
        if (img === undefined) return;
        img._display.tint = 0xFFFFFF;
    }

    private async onEntitySpawned(entity: number): Promise<void> {
        let bkgImg = this.storage.getComponent(entity);
        if (bkgImg === undefined) return;
        let pos = this.ecs.getComponent(entity, 'position') as PositionComponent;
        if (pos === undefined) return;

        let transform = this.ecs.getComponent(entity, 'transform') as TransformComponent;
        if (transform === undefined) {
            transform = {
                type: "transform",
                entity: -1,
                rotation: 0,
                scale: 1,
            } as TransformComponent;
            this.ecs.addComponent(entity, transform);
        }
        if (transform.scale === undefined) {
            transform.scale = 1;
        }


        if (bkgImg.image.byteOffset !== 0) {
            // Copy array to remove offset (TODO: fix)
            // https://github.com/peers/peerjs/issues/715
            bkgImg.image = new Uint8Array(bkgImg.image);
        }
        if (bkgImg.visibilityMap !== undefined) {
            let res = new Uint8Array(bkgImg.visibilityMap);// Copy buffer (adjusts alignment)
            bkgImg.visibilityMap = new Uint32Array(res.buffer);
        }

        let [tex, img] = await loadTexture(bkgImg.image, bkgImg.imageType);

        bkgImg._texture = tex;
        this.loadVisibility(bkgImg);

        let backingTex = this.phase.lightSystem.localLightSettings.visionType === 'dm' ? bkgImg._texture : bkgImg._renTex;
        let sprite = new PIXI.Sprite(backingTex);
        sprite.anchor.set(0.5);
        sprite.position.set(pos.x, pos.y);
        sprite.rotation = transform.rotation;
        sprite.scale.set(transform.scale);
        sprite.interactive = false;
        sprite.interactiveChildren = false;
        sprite.parentLayer = this.displayLayer;
        bkgImg._display = sprite;
        bkgImg._html = img;
        this.displayMaps.addChild(sprite);


        let hw = bkgImg._texture.width / 2;
        let hh = bkgImg._texture.height / 2;
        let aabb = new Aabb(
            pos.x - hw, pos.y - hh,
            pos.x + hw, pos.y + hh,
        );
        aabb.scale(transform.scale, transform.scale, aabb);
        let obb = Obb.rotateAabb(aabb.copy(), transform.rotation);

        aabb.wrapPolygon(obb.rotVertex);

        this.phase.playerSystem.getSpreadDataForAabb(new Aabb(
            pos.x - tex.width / 2, pos.y - tex.height / 2,
            pos.x + tex.width / 2, pos.y + tex.height / 2
        ), data => this.updateVisibility(data, bkgImg))

        this.ecs.addComponent(entity, {
            type: 'interaction',
            entity: -1,
            shape: shapeObb(obb),
            selectPriority: EditMapDisplayPrecedence.BACKGROUND,
        } as InteractionComponent);

        console.log("Sprite added");
    }

    private onComponentEdit(newCmp: Component): void {
        let spreadVis = false;


        let mapCmp = this.storage.getComponent(newCmp.entity);
        if (mapCmp === undefined) return;

        if (newCmp.type === 'position') {
            spreadVis = true;
            let pos = newCmp as PositionComponent;
            mapCmp._display.position.set(pos.x, pos.y);
        } else if (newCmp.type === 'transform') {
            spreadVis = true;
            let pos = newCmp as TransformComponent;
            mapCmp._display.rotation = pos.rotation;
            mapCmp._display.scale.set(pos.scale);
        }

        if (spreadVis) {
            let inter = this.ecs.getComponent(newCmp.entity, 'interaction') as InteractionComponent;
            let obb = (inter.shape as ObbShape).data.rotVertex;
            let aabb = Aabb.zero();
            aabb.wrapPolygon(obb);
            this.phase.playerSystem.getSpreadDataForAabb(aabb, data => this.updateVisibility(data, mapCmp));
        }
    }

    private onComponentRemove(cmp: Component): void {
        if (cmp.type === BACKGROUND_TYPE) {
            let c = cmp as BackgroundImageComponent;
            c._display.destroy(DESTROY_ALL);
        } else if (cmp.type === 'host_hidden') {
            let c = this.storage.getComponent(cmp.entity);
            if (c === undefined) return;
            // Now you're visible! say hello
            let pos = this.ecs.getComponent(cmp.entity, 'position') as PositionComponent;
            let tex = c._texture;
            this.phase.playerSystem.getSpreadDataForAabb(new Aabb(
                pos.x - tex.width / 2, pos.y - tex.height / 2,
                pos.x + tex.width / 2, pos.y + tex.height / 2
            ), data => this.updateVisibility(data, c))
        }
    }

    private onResourceEdited(res: Resource, edited: any): void {
        if (res.type === 'local_light_settings' && 'visionType' in edited) {
            let lls = res as LocalLightSettings;

            // Switch between real texture or "discovered" texture
            let realTex = lls.visionType === 'dm';
            for (let c of this.storage.allComponents()) {
                c._display.texture = realTex ? c._texture : c._renTex;
            }
        }
    }

    private onSerialize(): void {
        for (let bkg of this.storage.allComponents()) {
            this.extractVisibility(bkg);
        }
    }

    private onSerializeEntity(entity: number): void {
        let c = this.storage.getComponent(entity);
        if (c !== undefined) {
            this.extractVisibility(c);
        }
    }

    private onVisibilitySpread(data: VisibilitySpreadData) {
        let iter = this.phase.interactionSystem.query(shapeAabb(data.aabb), c => {
            return this.storage.getComponent(c.entity) !== undefined;
        });
        for (let bkg of iter) {
            let cmp = this.storage.getComponent(bkg.entity);
            this.updateVisibility(data, cmp)
        }
    }

    private extractVisibility(c: BackgroundImageComponent) {
        if (c._visibilityMapChanged !== true) return;

        c.visibilityMap = undefined;

        const renderer = app.renderer;
        const tex = c._renTex;
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
        c.visibilityMap = target;
        c._visibilityMapChanged = false;
    }

    private loadVisibility(c: BackgroundImageComponent) {
        const width = c._texture.width;
        const height = c._texture.height;

        if (c._renTex === undefined) {
            c._renTex = PIXI.RenderTexture.create({
                width, height,
                scaleMode: c._texture.baseTexture.scaleMode,
            });
            let bt = c._renTex.baseTexture;
            (bt as any).clearColor = [0.0, 0.0, 0.0, 0.0];
        }

        if (c.visibilityMap === undefined) return;

        let texOpts = {
            width, height,
            format: PIXI.FORMATS.RGBA,
        };

        let texData = new Uint32Array(c._texture.width * c._texture.height);

        let set = new BitSet(c.visibilityMap);
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

        let mapSprite = new PIXI.Sprite(c._texture);
        let cnt = new PIXI.Container();
        cnt.addChild(mapSprite, lumSprite);

        app.renderer.render(cnt, c._renTex, true);

        lumSprite.destroy(DESTROY_ALL);

        c._visibilityMapChanged = false;
    }

    private updateVisibility(data: VisibilitySpreadData, bkg: BackgroundImageComponent) {
        // Kill me
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
        if (this.ecs.getComponent(bkg.entity, 'host_hidden')) return;

        //console.time('updateVisibility');

        let renderer = app.renderer;

        let localCnt = new PIXI.Container();
        // Setup local transform
        let m = new Matrix();
        m.translate(
            -bkg._display.position.x,
            -bkg._display.position.y
        );
        m.rotate(-bkg._display.rotation);
        let invScale = 1/bkg._display.scale.x;
        m.scale(invScale, invScale);
        m.translate(bkg._texture.width / 2, bkg._texture.height / 2);
        localCnt.transform.setFromMatrix(m);

        let worldCnt = new PIXI.Container();

        // If there are any players without night vision (and there are lights) render them (THIS IS SLOW!)
        let tex, tex2, nightSprite;
        if (data.players.length !== 0 && data.lights.length !== 0) {
            tex = (this.renderTexturePool as any).getOptimalTexture(bkg._display.width, bkg._display.height);
            tex2 = (this.renderTexturePool as any).getOptimalTexture(bkg._display.width, bkg._display.height);

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

        let origTex = new PIXI.Sprite(bkg._texture);
        origTex.blendMode = PIXI.BLEND_MODES.SRC_IN;

        worldCnt.addChild(localCnt, origTex)

        // Render everything to bkg._renTex and then redraw the original only where is alpha=1.
        app.renderer.render(worldCnt, bkg._renTex, false);
        bkg._visibilityMapChanged = true;

        // Cleanup time (don't worry, I'm recycling and there's a garbage cleaner, we're eco friendly!)
        worldCnt.destroy(DESTROY_MIN);
        origTex.destroy(DESTROY_MIN);

        if (tex !== undefined) this.renderTexturePool.returnTexture(tex);
        if (tex2 !== undefined) this.renderTexturePool.returnTexture(tex2);
        if (nightSprite !== undefined) nightSprite.destroy(DESTROY_MIN);

        //console.timeEnd('updateVisibility');
    }

    enable() {
        this.displayMaps = new PIXI.Container();
        this.displayMaps.zIndex = EditMapDisplayPrecedence.BACKGROUND;
        this.displayMaps.interactive = true;
        this.displayMaps.interactiveChildren = true;

        this.displayLayer = new PIXI.display.Layer();
        this.displayLayer.zIndex = EditMapDisplayPrecedence.BACKGROUND;
        this.displayLayer.interactive = false;
        this.displayLayer.interactiveChildren = false;

        this.phase.board.addChild(this.displayMaps);
        app.stage.addChild(this.displayLayer);
    }

    destroy(): void {
        this.displayLayer.destroy(DESTROY_ALL);
        this.displayMaps.destroy(DESTROY_ALL);
    }
}