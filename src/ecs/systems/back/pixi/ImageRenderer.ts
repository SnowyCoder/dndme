import { SHARED_TYPE, TransformComponent, TRANSFORM_TYPE } from "@/ecs/component";
import { SerializeData, World } from "@/ecs/World";
import { STANDARD_GRID_OPTIONS } from "@/game/grid";
import { Aabb } from "@/geometry/aabb";
import { Obb } from "@/geometry/obb";
import { IPoint } from "@/geometry/point";
import { ElementType, EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE, GRAPHIC_TYPE, ImageElement, ImageMeta, ImageScaleMode, VisibilityType } from "@/graphics";
import { FileIndex } from "@/map/FileDb";
import { arrayRemoveElem } from "@/util/array";
import { BitSet } from "@/util/bitSet";
import { DESTROY_ALL, DESTROY_MIN, loadTexture } from "@/util/pixi";
import { BaseTexture, BitmapText, BLEND_MODES, BufferResource, Container, FORMATS, ImageBitmapResource, Matrix, RenderTexture, Sprite, Texture } from "pixi.js";
import { GRID_TYPE } from "../../gridSystem";
import { EVENT_VISIBILITY_SPREAD, VisibilitySpreadData } from "../../playerSystem";
import { BigStorageSystem, BIG_STORAGE_TYPE } from "../files/bigStorageSystem";
import { INTERACTION_TYPE, Shape, shapeAabb, shapeObb, shapeToAabb } from "../InteractionSystem";
import { Logger, LogLevel } from "../log/Logger";
import { getLogger } from "../log/LogSystem";
import { PixiDisplayElement, PixiGraphicComponent, PixiGraphicSystem } from "./pixiGraphicSystem";
import { DepthFunc } from "./visibility/VisibilityPolygonElement";
import { ShallowRef, shallowRef } from "vue";

interface TextureEntry {
    elements: PixiImageElement[];
    promise?: [promise: Promise<Texture<ImageBitmapResource>>, resolve: (tex: Texture<ImageBitmapResource>) => void];
    texture: Texture;
    pending: boolean;
}

export interface PixiImageElement extends ImageElement, PixiDisplayElement {
    type: ElementType.IMAGE;// interference between interfaces (good-old diamond problem?)
    _owner: number;
    _oldTex?: FileIndex | Texture,
    // Used for BBB
    _visibData?: 'downloading' | 'loaded';
    _renTex?: RenderTexture;
    _visMapChanged?: boolean;
    // sprite
    _pixi?: Sprite;
}


export class ImageRenderer {
    readonly world: World;
    readonly sys: PixiGraphicSystem;
    readonly fileSys: BigStorageSystem;
    readonly textureMap = new Map<FileIndex | Texture, TextureEntry>();

    private readonly logger: Logger;

    constructor(sys: PixiGraphicSystem) {
        this.world = sys.world;
        this.sys = sys;
        this.fileSys = this.world.requireSystem(BIG_STORAGE_TYPE);

        this.logger = getLogger(this.world, 'pixi.image');

        this.world.events.on(EVENT_VISIBILITY_SPREAD, this.onBBBVisibilitySpread, this);
        this.world.events.on('serialize', this.onSerialize, this);
    }

    updateVisibility(el: PixiImageElement): void {
        let tex;

        if (el.visib !== VisibilityType.REMEMBER_BIT_BY_BIT || this.sys.masterVisibility) {
            tex = this.textureMap.get(el.texture.value)!.texture;
        } else {
            tex = el._renTex!;
        }
        el._pixi!.texture = tex;
    }

    getTexturePromise(id: FileIndex): Promise<Texture<ImageBitmapResource> | 'unused'> {
        const entry = this.textureMap.get(id);
        if (entry == undefined) return Promise.resolve('unused');
        if (entry.promise !== undefined) return entry.promise[0];
        let rresolve;
        const promise = new Promise<Texture<ImageBitmapResource>>((resolve, reject) => {
            if (!entry.pending) {
                resolve(entry.texture as any);
                return;
            }
            rresolve = resolve;
        });
        // This assumes that the function is called instantly (it seems to be working FOR NOW)
        // god I hate js
        entry.promise = [promise, rresolve!];
        return promise;
    }

    private dropTexUsage(owner: number, el: PixiImageElement, tex: FileIndex): void {
        const entry = this.textureMap.get(tex)!;
        if (arrayRemoveElem(entry.elements, el) && entry.elements.length === 0) {
            this.textureMap.delete(tex);
        }
        this.fileSys.dropUse(owner,tex);
    }

    private getDimensions(el: PixiImageElement): [number, number] {
        if (el.texture.type === 'raw') {
            return [el.texture.value.width, el.texture.value.height];
        } else {
            const meta = this.fileSys.files.loadMeta(el.texture.value, 'image') as ImageMeta | undefined;
            if (meta === undefined) console.warn("Getting dimension of image with no meta");
            return meta?.dims ?? [1, 1];
        }
    }

    private swapTextures(owner: number, el: PixiImageElement, forceSwap: boolean = false): void {
        if (el._oldTex === el.texture.value && !forceSwap) return;

        if (el._oldTex !== undefined && typeof el._oldTex === 'string') {
            this.dropTexUsage(owner, el, el._oldTex);
        }

        // Check tex-map (we might not need re-downloading nor re-parsing)
        const entry = this.textureMap.get(el.texture.value);
        if (entry !== undefined) {
            entry.elements.push(el);
            if (el.texture.type === 'external') {
                this.fileSys.newUse(owner, el.texture.value);
            }
            this.updateVisibility(el);
            return;
        }
        el._pixi!.texture = Texture.WHITE;
        const dims = this.getDimensions(el);
        el._pixi!.scale.set(dims[0], dims[1]);

        // Remove old render texture if present
        if (el._renTex !== undefined) {
            el._renTex.destroy(true);
            el._renTex = undefined;
        }
        // Create render texture (it's mandatory)
        this.loadVisibility(el, undefined);

        const newEntry = {
            elements: [el],
            texture: Texture.WHITE,
            pending: true,
        } as TextureEntry;
        this.textureMap.set(el.texture.value, newEntry);

        if (el.texture.type === 'raw') {
            newEntry.texture = el.texture.value;
            this.updateVisibility(el);
            el._pixi!.scale.set(1, 1);
            newEntry.pending = false;
            this.updateImage(
                this.world.getComponent(el._owner, GRAPHIC_TYPE)!,
                el,
                el.anchor,// This should be the real position, but we don't use it :3
                this.world.getComponent(el._owner, TRANSFORM_TYPE)
            );
        } else {
            // Download texture and load
            const hash = el.texture.value;
            this.fileSys.request(hash, el.texture.priority ?? 0)
                .then(data => this.onTextureDownloaded(hash, data))
                .catch(e => console.error("Error downloading texture: ", e));
        }
    }

    private onTextureDownloaded(index: FileIndex, data: Uint8Array): void {
        const entry = this.textureMap.get(index);
        if (entry === undefined) return;
        if (!entry.pending) {
            console.error("Texture double-loading!");
            return;
        }

        for (let e of entry.elements) {
            this.fileSys.newUse(e._owner, index);
        }
        const meta = this.fileSys.files.loadMeta(index, 'image') as ImageMeta;

        loadTexture(data, meta.format)
            .then(data => this.onTextureLoaded(index, data))
            .catch(e => console.error("Error loading texture: ", e, data));
    }


    private onTextureLoaded(index: FileIndex, tex: Texture<ImageBitmapResource>): void {
        const entry = this.textureMap.get(index);
        if (entry === undefined) return;
        if (!entry.pending) {
            console.error("Texture double-loading!");
            return;
        }
        entry.pending = false;
        entry.texture = tex;
        if (entry.promise) {
            const resolve = entry.promise[1];
            entry.promise = undefined;
            resolve(tex);
        }
        const meta = this.fileSys.files.loadMeta(index, 'image') as ImageMeta | undefined;
        if (meta === undefined || meta.dims[0] != tex.width || meta.dims[1] != tex.height) {
            this.fileSys.files.saveMeta(index, 'image', {
                dims: [tex.width, tex.height],
                format: meta?.format,
            } as ImageMeta);
        }
        for (const el of entry.elements) {
            const graphic = this.world.getComponent(el._owner, 'graphic')!;
            const trans = this.world.getComponent(el._owner, 'transform');
            this.updateImage(graphic, el, {} as any /*unused*/, trans);

            this.repaintVisibility(el);
            this.sys.forceShapeUpdate(this.world.getComponent(el._owner, GRAPHIC_TYPE)!);
        }
    }

    updateImage(par: PixiGraphicComponent, el: PixiImageElement, pos: IPoint, trans: TransformComponent | undefined): void {
        el._owner = par.entity;

        const dim = el._pixi!;
        if (el.texture.value !== el._oldTex) {
            this.swapTextures(par.entity, el);
        }
        this.updateVisibility(el);
        dim.anchor.copyFrom(el.anchor);
        let sx = trans?.scale || 1;
        let sy = sx;
        if (el.scaleMode === ImageScaleMode.GRID) {
            const gsize = this.requireGridSize(el);
            sx = gsize.x * this.sys.gridSize * sx;
            sy = gsize.y * this.sys.gridSize * sy;
        } else if (el.scaleMode === ImageScaleMode.CONSTRAINED) {
            sx = this.sys.gridSize * el.scale / dim.texture.width;
            sy = this.sys.gridSize * el.scale / dim.texture.height;
            console.log('SCALE: ', sx, sy);
        }
        dim.rotation = trans?.rotation || 0;
        dim.scale.set(sx, sy);
        dim.tint = par._selected ? 0x7986CB : 0xFFFFFF;

        this.updateVisib(el);
        el._oldTex = el.texture.value;
    }

    private updateVisib(el: PixiImageElement) {
        // 1. image is newly created
        //  - ask for visibility
        //  - set flag
        // 2. visibility arrived
        //  - load visibility
        //  - set flag
        //  - if we are not master drop visibility (no-one will request it later)
        // 3. we already have visibility and nothing strange happened
        //  - return

        if (el.visib !== VisibilityType.REMEMBER_BIT_BY_BIT) {
            if (el._renTex !== undefined) {
                el._renTex.destroy(true);
                el._renTex = undefined;
            }
            return;
        }
        if (el.visMap === undefined) return;

        if (el._visibData === undefined) {
            // Point 1, image is newly created
            el._visibData = 'downloading';
            const visibilityHash = el.visMap;
            this.fileSys.request(visibilityHash, 20)
                .then(data => {
                    // Point 2
                    el._visibData = 'loaded';

                    this.fileSys.newUse(el._owner, visibilityHash);
                    this.updateVisibility(el);
                    this.loadVisibility(el, data);
                    /*if (!this.world.isMaster) {
                        this.fileSys.dropUse(el._owner, visibilityHash);
                        el.visMap = undefined;
                    }*/
            });
        } else {
            // Point 2 or 3
        }
    }

    requireGridSize(el: PixiImageElement): IPoint {
        const tex = this.textureMap.get(el.texture.value);
        if (tex === undefined) {
            return {
                x: 1, y: 1
            }
        }
        const t = tex.texture;
        return {
            x: Math.ceil(t.width / STANDARD_GRID_OPTIONS.size) / t.width,
            y: Math.ceil(t.height / STANDARD_GRID_OPTIONS.size) / t.height,
        }
    }

    static async preloadTexture(world: World, index: FileIndex | Uint8Array, dataType: string): Promise<FileIndex> {
        const bss = world.requireSystem(BIG_STORAGE_TYPE);

        let data;
        if (typeof index === 'string') {
            data = await bss.request(index);
        } else {
            data = index;
            index = await bss.create(index);
        }
        let tex: Texture;
        try {
            tex = await loadTexture(data, dataType);
        } catch (e) {
            throw new Error("Falied to load image: " + e);
        }
        bss.files.saveMeta(index, 'image', {
            dims: [tex.width, tex.height],
            format: dataType,
        } as ImageMeta);

        world.events.emit('image_preload', {
            id: index,
        });

        return index;
    }

    createShape(c: PixiImageElement, pos: IPoint, trans: TransformComponent | undefined): Shape {
        if (c.texture.value !== c._oldTex) {
            this.swapTextures(c._owner, c);
        }
        let [w, h] = this.getDimensions(c);
        let aabb;

        let sx = trans?.scale || 1;
        let sy = trans?.scale || 1;

        if (c.scale == ImageScaleMode.GRID) {
            const gsize = this.requireGridSize(c);
            const grid = this.world.getResource(GRID_TYPE)!;
            sx = gsize.x * grid.size * sx;
            sy = gsize.y * grid.size * sy;
        }

        aabb = Aabb.fromPointAnchor(pos, {x: w, y: h}, c.anchor);
        aabb.scale(sx, sy, aabb);
        let obb = Obb.rotateAabb(aabb.copy(), trans?.rotation || 0);
        return shapeObb(obb);
    }

    destroyElement(owner: number, im: PixiImageElement): void {
        im._pixi!.destroy(false);
        if (im._renTex !== undefined) {
            im._renTex.destroy(true);
        }
        if (im.texture.value !== im._oldTex) {
            console.warn("Removing non-updated image");
        }
        if (im.texture.type === 'external') {
            this.dropTexUsage(owner, im, im.texture.value);
        }
        if (im.visMap !== undefined) {
            this.fileSys.dropUse(owner, im.visMap);
        }
    }

    // ----------------------------------------------------------- BIT BY BIT STUFF -----------------------------------------------------------



    private loadVisibility(c: PixiImageElement, visMap: Uint8Array | undefined) {
        // TODO: add what's already visible if possible:
        // what if the visibility is loaded after players have moved (and added some visibility still?)
        // we should merge the old visibility with the new pieces!
        const [width, height] = this.getDimensions(c);

        if (c._renTex === undefined) {
            c._renTex = RenderTexture.create({
                width, height,
                scaleMode: c._pixi!.texture.baseTexture.scaleMode,
            });
            const bt = c._renTex.baseTexture;
            (bt as any).clearColor = [0.0, 0.0, 0.0, 0.0];
        }

        if (visMap === undefined) return;

        const profHandle = this.logger.profileStart('loadVisibility', true);

        const texOpts = {
            width, height,
            format: FORMATS.RGBA,
        };

        const texData = new Uint32Array(width * height);

        if ((visMap.byteOffset & (0x4 - 1)) !== 0) {
            // Not aligned, realign
            visMap = visMap.slice(0);
        }
        const set = new BitSet(new Uint32Array(visMap.buffer, visMap.byteOffset, visMap.byteLength / 4));
        const len = texData.length;
        for (let i = 0; i < len; i++) {
            texData[i] = set.get(i) ? 0xFFFFFFFF : 0;
        }

        const byteData = new Uint8Array(texData.buffer);
        const resource = new BufferResource(byteData, { width, height });
        const baseTexture = new BaseTexture(resource, texOpts)

        const tex = new Texture(baseTexture);
        const lumSprite = new Sprite(tex);

        const entry = this.textureMap.get(c.texture.value)!;
        const mapSprite = new Sprite(entry.texture);
        if (mapSprite.width !== width || mapSprite.height !== height) {
            mapSprite.scale.set(width, height);
        }
        mapSprite.blendMode = BLEND_MODES.SRC_IN;
        const cnt = new Container();
        cnt.addChild(lumSprite, mapSprite);

        this.sys.pixiBoardSystem.renderer.render(cnt, {
            renderTexture: c._renTex,
            clear: false,
        });

        lumSprite.destroy(DESTROY_ALL);

        c._visMapChanged = false;
        this.logger.profileStop(profHandle, LogLevel.INFO);
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

        if (c.visMap !== undefined) {
            this.fileSys.dropUse(c._owner, c.visMap);
            c.visMap = undefined;
        }

        const renderer = this.sys.pixiBoardSystem.renderer;
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
        const data = new Uint8Array(target.buffer);
        const hash = this.fileSys.createUnique(data);
        this.fileSys.newUse(c._owner, hash);
        c.visMap = hash;
        c._visMapChanged = false;
        c._visibData = 'loaded';
        return true;
    }

    private repaintVisibility(c: PixiImageElement): void {
        const [width, height] = this.getDimensions(c);

        const entry = this.textureMap.get(c.texture.value)!;
        const mapSprite = new Sprite(entry.texture);
        if (mapSprite.width !== width || mapSprite.height !== height) {
            mapSprite.scale.set(width, height);
        }
        mapSprite.blendMode = BLEND_MODES.SRC_IN;
        const cnt = new Container();
        cnt.addChild(mapSprite);

        this.sys.pixiBoardSystem.renderer.render(cnt, {
            renderTexture: c._renTex,
            clear: false,
        });
    }

    private onSerialize(data: SerializeData): void {
        const changedList: number[] = [];

        const processComp = (com: PixiGraphicComponent) => {
            if (!com._bitByBit) return;
            let changed = false;
            this.doOnBitByBit(com, com.display, (img) => changed ||= this.extractVisibility(img));
            if (changed) changedList.push(com.entity);
        };

        if (data.options.only !== undefined) {
            for (let entity of data.options.only) {
                const comp = this.sys.storage.getComponent(entity);
                if (comp === undefined) continue;
                processComp(comp);
            }
        } else {
            for (let com of this.sys.storage.allComponents()) {
                processComp(com);
            }
        }

        if (changedList) {
            this.world.events.emit(EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE, changedList);
        }
    }

    doOnBitByBit(com: PixiGraphicComponent, img: PixiDisplayElement, f: (img: PixiImageElement) => void): void {
        if (img.type == ElementType.IMAGE && (img as PixiImageElement).visib === VisibilityType.REMEMBER_BIT_BY_BIT) {
            f(img as PixiImageElement);
        }
        if (img.children) {
            for (let c of img.children) {
                this.doOnBitByBit(com, c, f);
            }
        }
    }

    private onBBBVisibilitySpread(data: VisibilitySpreadData): void {
        let iter = this.sys.interactionSystem.query(shapeAabb(data.aabb), c => {
            let com = this.sys.storage.getComponent(c.entity);
            return com !== undefined && com._bitByBit === true;
        });
        for (let c of iter) {
            // If we are here then the component exists, we checked it in the iterator
            let cmp = this.sys.storage.getComponent(c.entity)!;
            this.doOnBitByBit(cmp, cmp.display, (img) => this.updateBBBVisibility(data, img));
        }
    }

    updateBBBVisAround(com: PixiGraphicComponent) {
        let inter = this.world.getComponent(com.entity, INTERACTION_TYPE)!;
        let aabb = shapeToAabb(inter.shape);
        this.sys.playerSystem!.getSpreadDataForAabb(aabb, data => {
            this.doOnBitByBit(com, com.display, (img) => this.updateBBBVisibility(data, img));
        });
    }

    private updateBBBVisibility(data: VisibilitySpreadData, img: PixiImageElement) {
        //      Part 1. What?
        // So, what does this spaghetti mess do? Good question!
        // We have players and lights, some players can see without lights and others can't
        // The task is to update the rendertexture of the background component adding the visible spots to it.
        // The visible spots are: The meshes of the players with night vision enabled and the intersection of the
        // union of the vision mesh of the normal players with the union of the vison meshes of the lights.
        // Common case: 1 NV player 0 lights, 1 player multiple lights, multiple players 1 light
        // Possible (but uncommon) cases: x NV players, y normal players, z lights (with x, y, z naturals).

        //      Part 2. How?
        // The idea is to use the depth buffer to help us.
        // So, ideally we want to add to the renderTexture of the backgroundImage the real image only when
        // (visibleByNighvisionPlayer || (visibleByPlayer && visibleByLight))
        // We could do this with just 2 draws and no additional framebuffers:
        // 0. Reset depth buffer to 1.0
        // 1. Render all NighVisionPlayers, set depth=0.0 and copy original image to target
        // 2. Render all Lights to depth=0.5, without writing any color
        // 3. Render all Players to depth=0.5 and glDepthFunc(gl.EQUAL), copying the original image to the target
        //
        // Here we would only have 1 state change, the one in the deph function. And since all of the visibility polygon
        // renderings are batched, we can do this by just using 2 draws:
        // 1. draw nigh vision players and lights
        // 2. glDepthFunc(gl.EQUAL)
        // 3. draw players
        // 4. ??? profit


        // Skip EVERYTHING if this entity is hidden.
        if (!this.world.getComponent(img._owner, SHARED_TYPE)) return;
        // We can skip updating if players have no light (only if there are also no nightVisionPlayers)
        if ((data.lights.length == 0 || data.players.length == 0) && data.nightVisPlayers.length === 0) return;

        const profHandle = this.logger.profileStart('updateVisibility', true);

        //console.time('updateVisibility');

        const localCnt = new Container();
        // Setup local transform
        const m = new Matrix();
        const pixi = img._pixi!;
        m.translate(
            -pixi.position.x,
            -pixi.position.y
        );
        m.rotate(-pixi.rotation);
        let invScale = 1/pixi.scale.x;
        m.scale(invScale, invScale);
        const dims = this.getDimensions(img);
        m.translate(dims[0] / 2, dims[1] / 2);
        localCnt.transform.setFromMatrix(m);
        const entry = this.textureMap.get(img.texture.value)!;

        const worldCnt = new Container();

        for (let player of data.nightVisPlayers) {
            player.depth = 0;
            player.depthTest = true;
            player.texture = entry.texture;
            player.program = 'const';
            localCnt.addChild(player);
        }

        // Write lights at depth 0.5 (so don't write them where the night-vision players are)
        for (let light of data.lights) {
            light.depth = 0.5;
            light.depthTest = true;
            light.tint = 0;// DO NOT WRITE IMAGE
            light.texture = entry.texture;
            light.program = 'const';
            localCnt.addChild(light);
        }

        // Write the players only where lights are written (i.e. where depth == 0.5)
        for (let player of data.players) {
            player.depth = 0.5;
            player.depthTest = true;
            player.depthFunc = DepthFunc.EQUAL;
            player.texture = entry.texture;
            player.program = 'const';
            localCnt.addChild(player);
        }

        worldCnt.addChild(localCnt);

        const renderer = this.sys.pixiBoardSystem.renderer;
        const {gl} = renderer;
        if (!img._renTex?.framebuffer.depth) {
            img._renTex?.framebuffer.enableDepth();
        }

        renderer.renderTexture.bind(img._renTex);
        //(window as any).spector.startCapture(gl, 50);
        gl.clear(renderer.gl.DEPTH_BUFFER_BIT);
        renderer.render(worldCnt, {
            renderTexture: img._renTex,
            clear: false
        });
        //(window as any).spector.stopCapture();

        img._visMapChanged = true;
        // Cleanup time (don't worry, I'm recycling and there's a garbage cleaner, we're eco friendly!)
        worldCnt.destroy(DESTROY_MIN);

        this.logger.profileStop(profHandle);

        //console.timeEnd('updateVisibility');
    }
}
