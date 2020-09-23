import {System} from "../system";
import {EcsEntityLinked, EcsTracker} from "../ecs";
import PIXI from "../../PIXI";
import {DESTROY_ALL, loadTexture} from "../../util/pixi";
import {EditMapPhase} from "../../phase/editMap/editMapPhase";
import {Component, PositionComponent, TransformComponent} from "../component";
import {SingleEcsStorage} from "../storage";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {app} from "../../index";
import {BitSet} from "../../util/bitSet";
import {DynamicTree} from "../../geometry/dynamicTree";
import {Aabb} from "../../geometry/aabb";
import {GeomertyQueryType, QueryHitEvent} from "../interaction";

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
    readonly ecs: EcsTracker;
    readonly phase: EditMapPhase;
    readonly storage: SingleEcsStorage<BackgroundImageComponent>;

    displayMaps: PIXI.Container;
    displayLayer: PIXI.display.Layer;

    backgroundsByAabb = new DynamicTree<BackgroundImageComponent>();

    constructor(tracker: EcsTracker, phase: EditMapPhase) {
        this.ecs = tracker;
        this.phase = phase;
        this.storage = new SingleEcsStorage<BackgroundImageComponent>(BACKGROUND_TYPE, true, true);

        this.ecs.addStorage(this.storage);
        this.ecs.events.on('entity_spawned', this.onEntitySpawned, this);
        this.ecs.events.on('component_edited', this.onComponentEdit, this);
        this.ecs.events.on('component_remove', this.onComponentRemove, this);
        this.ecs.events.on('selection_begin', this.onSelectionBegin, this);
        this.ecs.events.on('selection_end', this.onSelectionEnd, this);
        this.ecs.events.on('serialize', this.onSerialize, this);
        this.ecs.events.on('query_hit', this.onQueryHit, this);
    }

    onSelectionBegin(entity: number): void {
        let img = this.storage.getComponent(entity);
        if (img === undefined) return;
        img._display.tint = 0x7986CB;
    }

    onSelectionEnd(entity: number): void {
        let img = this.storage.getComponent(entity);
        if (img === undefined) return;
        img._display.tint = 0xFFFFFF;
    }

    private aabbTreeAdd(c: BackgroundImageComponent): void {
        this.aabbTreeRemove(c);

        let bounds = c._display.getBounds();
        c._treeEntry = this.backgroundsByAabb.createProxy(Aabb.fromBounds(bounds), c);
    }

    private aabbTreeRemove(c: BackgroundImageComponent): void {
        if (c._treeEntry === undefined) return;

        this.backgroundsByAabb.destroyProxy(c._treeEntry);
        c._treeEntry = undefined;
    }

    async onEntitySpawned(entity: number): Promise<void> {
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
            } as TransformComponent;
            this.ecs.addComponent(entity, transform);
        }


        if (bkgImg.image.byteOffset !== 0) {
            // Copy array to remove offset (TODO: fix)
            // https://github.com/peers/peerjs/issues/715
            bkgImg.image = new Uint8Array(bkgImg.image);
        }

        let [tex, img] = await loadTexture(bkgImg.image, bkgImg.imageType);

        let sprite = new PIXI.Sprite(tex);
        sprite.anchor.set(0.5);
        sprite.position.set(pos.x, pos.y);
        sprite.angle = transform.rotation;
        sprite.interactive = false;
        sprite.parentLayer = this.displayLayer;
        bkgImg._display = sprite;
        bkgImg._html = img;
        this.displayMaps.addChild(sprite);
        this.aabbTreeAdd(bkgImg);
        console.log("Sprite added");
    }

    onComponentEdit(newCmp: Component) {
        if (newCmp.type === 'position') {
            let pos = newCmp as PositionComponent;
            let mapCmp = this.storage.getComponent(newCmp.entity);
            if (mapCmp === undefined) return;
            mapCmp._display.position.set(pos.x, pos.y);
            this.aabbTreeAdd(mapCmp);
        } else if (newCmp.type === 'transform') {
            let pos = newCmp as TransformComponent;
            let mapCmp = this.storage.getComponent(newCmp.entity);
            if (mapCmp === undefined) return;
            mapCmp._display.angle = pos.rotation;
            this.aabbTreeAdd(mapCmp);
        }
    }

    onComponentRemove(cmp: Component) {
        if (cmp.type !== BACKGROUND_TYPE) return;
        let c = cmp as BackgroundImageComponent;
        c._display.destroy(DESTROY_ALL);
        this.aabbTreeRemove(c);
    }

    private onSerialize(): void {
        for (let bkg of this.storage.allComponents()) {
            this.extractVisibility(bkg);
        }
    }

    private onQueryHit(data: QueryHitEvent): void {
        if (!data.shouldContinue()) return;
        if (data.type !== GeomertyQueryType.POINT) return; // TODO: AABB not supported

        let point = data.data as PIXI.IPointData;

        for (let node of this.backgroundsByAabb.query(data.aabb)) {
            let c = node.tag;
            if (c._display.containsPoint(point)) {
                data.addHit(c.entity);
                if (!data.shouldContinue()) return;
            }
        }
    }

    private extractVisibility(c: BackgroundImageComponent) {
        if (c._visibilityMapChanged !== true) return;

        c.visibilityMap = undefined;

        const renderer = app.renderer;
        const tex = c._renTex;
        let frame = tex.frame;

        renderer.renderTexture.bind(tex);
        let webglPixels = new Uint8Array(tex.width * tex.height);

        const gl = renderer.gl;
        gl.readPixels(
            frame.x,
            frame.y,
            frame.width,
            frame.height,
            gl.ALPHA,
            gl.UNSIGNED_BYTE,
            webglPixels
        );

        let newLen = ((webglPixels.length - 1) >>> 5) + 1;
        let target = new Uint32Array(newLen);
        for (let i = 0; i < newLen; i++) {

            let d = 0;
            for (let j = 0; j < 8; j++) {
                // Gods of loop unrolling, I call upon you

                let x = webglPixels[j + i << 5] & 0x80;
                d |= x << j;
            }
            target[i] = d;
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

        let texOpts = {
            width, height,
            format: PIXI.FORMATS.LUMINANCE,
            alphaMode: PIXI.ALPHA_MODES.NO_PREMULTIPLIED_ALPHA,
        };

        let texData = new Uint8Array(c._texture.width * c._texture.height);

        if (c.visibilityMap !== undefined) {
            let set = new BitSet(c.visibilityMap);
            for (let i = 0; i < texData.length; i++) {
                if (set.get(i)) {
                    texData[i] = 0xFF;
                }
            }
        }

        let resource = new PIXI.resources.BufferResource(texData, { width, height });
        let baseTexture = new PIXI.BaseTexture(resource, texOpts)

        let tex = new PIXI.Texture(baseTexture);
        let lumSprite = new PIXI.Sprite(tex);
        lumSprite.blendMode = PIXI.BLEND_MODES.DST_IN;

        let mapSprite = new PIXI.Sprite(c._texture);
        let cnt = new PIXI.Container();
        cnt.addChild(mapSprite, lumSprite);

        app.renderer.render(cnt, c._renTex, true);


        lumSprite.destroy(DESTROY_ALL);

        c._visibilityMapChanged = false;
    }

    private updateVisibility(c: BackgroundImageComponent, d: PIXI.DisplayObject) {
        // TODO: set blendMode to d?
        let cnt = new PIXI.Container();
        let texSprite = new PIXI.Sprite(c._texture);
        texSprite.position.copyFrom(c._display);

        cnt.position.set(-c._display.x, -c._display.y);

        let filter = new PIXI.filters.AlphaFilter();
        cnt.filters = [filter];

        cnt.addChild(texSprite, d);
        app.renderer.render(cnt, c._renTex, false);
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
    }

    destroy(): void {
        this.displayLayer.destroy(DESTROY_ALL);
        this.displayMaps.destroy(DESTROY_ALL);
    }
}