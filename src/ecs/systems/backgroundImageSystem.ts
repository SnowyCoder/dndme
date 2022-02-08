import {System} from "../system";
import {World} from "../world";
import {loadTexture} from "../../util/pixi";
import {Component, TransformComponent, TRANSFORM_TYPE} from "../component";
import {SingleEcsStorage} from "../storage";
import {
    ElementType,
    EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE,
    GRAPHIC_TYPE,
    GraphicComponent,
    ImageElement,
    ImageScaleMode,
    VisibilityType
} from "../../graphics";
import {DisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {BIG_STORAGE_TYPE, BigStorageIndex, BigStorageSystem, BigEntryFlags} from "./back/bigStorageSystem";
import { NameAsLabelComponent, NAME_AS_LABEL_TYPE } from "./back/nameAsLabelSystem";
import { Texture } from "pixi.js";
import { Obb } from "../../geometry/obb";
import { InteractionComponent, INTERACTION_TYPE, ObbShape } from "./back/interactionSystem";
import { Aabb } from "../../geometry/aabb";

export type BACKGROUND_TYPE = 'background_image';
export const BACKGROUND_IMAGE_TYPE = 'background_image';

export interface BackgroundImageComponent extends Component {
    type: BACKGROUND_TYPE;
    image: BigStorageIndex<Uint8Array>;
    visMap: BigStorageIndex<Uint8Array> | undefined;
    imageType: string;
    _size: [number, number];
}


export class BackgroundImageSystem implements System {
    readonly name = BACKGROUND_IMAGE_TYPE;
    readonly dependencies = [GRAPHIC_TYPE, BIG_STORAGE_TYPE];

    readonly world: World;
    readonly storage: SingleEcsStorage<BackgroundImageComponent>;
    private readonly bigStorage: BigStorageSystem;

    constructor(world: World) {
        this.world = world;
        this.bigStorage = world.systems.get(BIG_STORAGE_TYPE) as BigStorageSystem;

        this.storage = new SingleEcsStorage<BackgroundImageComponent>(BACKGROUND_IMAGE_TYPE, true, true);

        this.world.addStorage(this.storage);
        this.world.events.on('component_add', this.onComponentAdd, this);
        this.world.events.on('component_edited', this.onComponentEdited, this);
        this.world.events.on('component_remove', this.onComponentRemove, this);
        if (this.world.isMaster) {
            this.world.events.on(EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE, this.onRememberBBBUpdate, this);
        }
    }

    private async onComponentAdd(c: Component): Promise<void> {
        if (c.type !== BACKGROUND_IMAGE_TYPE) return;
        let bkgImg = c as BackgroundImageComponent;

        if (typeof bkgImg.image !== 'number') {
            if (Uint8Array.prototype.isPrototypeOf(bkgImg.image)) {
                // previous versions did not have BigStorageSystem, let's fix that
                console.info("Converting background to BigStorage...");
                bkgImg.image = this.bigStorage.create(bkgImg.image).multiId;
                bkgImg.visMap = this.bigStorage.create(
                    bkgImg.visMap,
                    BigEntryFlags.SHARED | BigEntryFlags.READONLY
                ).multiId;

                delete (bkgImg as any)['visibilityMap'];
            } else if (bkgImg.image === undefined) {
                console.warn("This image has no texture, deleting");
                this.world.removeComponent(c);
                return;
            } else {
                console.warn("Error, could not convert bkgImage! Resetting", bkgImg.image);
                bkgImg.image = 0;
                this.world.removeComponent(c);
                return;
            }
        }

        let image = this.bigStorage.requestUse<Uint8Array>(bkgImg.image)!!.data;
        if ((image as any).image !== undefined) {
            // Rewrite old-format images
            this.bigStorage.replace(bkgImg.image, (image as any).image, true);
            image = (image as any).image;
        }
        if (image.byteLength === 0 || typeof image.byteLength !== 'number') {
            // empty background (for some reason??)
            console.log("Removing empty/unsupported background " + bkgImg.entity);
            this.bigStorage.dropUse(bkgImg.entity, true);
            this.world.despawnEntity(bkgImg.entity);
            return;
        }

        let visMap: Uint8Array | undefined = undefined;
        if (bkgImg.visMap !== undefined) {
            visMap = this.bigStorage.requestUse<Uint8Array>(bkgImg.visMap)?.data;
        }

        let tex: Texture;
        try {
            tex = await loadTexture(image, bkgImg.imageType);
        } catch (e) {
            console.error("Failed to load image: ", e);
            this.world.removeComponent(c);
            return;
        }
        bkgImg._size = [tex.width, tex.height];

        this.world.addComponent(c.entity, {
            type: GRAPHIC_TYPE,
            interactive: true,
            entity: c.entity,
            display: {
                type: ElementType.IMAGE,
                ignore: false,
                priority: DisplayPrecedence.BACKGROUND,
                scale: ImageScaleMode.REAL,
                visib: VisibilityType.REMEMBER_BIT_BY_BIT,
                visMap,
                texture: tex,
                anchor: { x: 0.5, y: 0.5 },
                tint: 0xFFFFFF,
            } as ImageElement,
        } as GraphicComponent);

        this.world.addComponent(c.entity, {
            type: NAME_AS_LABEL_TYPE,
            initialOffset: { x: 0, y: this.computeLabelHeightOffset(c.entity) },
        } as NameAsLabelComponent);
    }

    private async onComponentEdited(comp: Component): Promise<void> {
        if (comp.type !== TRANSFORM_TYPE) return;
        const transform = comp as TransformComponent;
        const background = this.storage.getComponent(comp.entity);
        if (background === undefined) return;

        this.world.editComponent(comp.entity, NAME_AS_LABEL_TYPE, {
            initialOffset: { x: 0, y: this.computeLabelHeightOffset(comp.entity)},
        } as NameAsLabelComponent);
    }

    private computeLabelHeightOffset(entity: number) {
        const shape = this.world.getComponent<InteractionComponent>(entity, INTERACTION_TYPE)!.shape as ObbShape;
        const aabb = Aabb.zero();
        aabb.wrapPolygon(shape.data.rotVertex);

        return -(aabb.maxY - aabb.minY) / 2;
    }

    private onComponentRemove(c: Component): void {
        if (c.type !== BACKGROUND_IMAGE_TYPE) return;
        let bkgImg = c as BackgroundImageComponent;

        if (bkgImg.image !== undefined) {
            this.bigStorage.dropUse(bkgImg.image);
        }
        if (bkgImg.visMap !== undefined) {
            this.bigStorage.dropUse(bkgImg.visMap);
        }
    }

    private onRememberBBBUpdate(entities: number[]): void {
        let gstor = this.world.storages.get(GRAPHIC_TYPE) as SingleEcsStorage<GraphicComponent>;

        for (let e of entities) {
            let c = this.storage.getComponent(e);
            if (c === undefined) continue;
            const visData = (gstor.getComponent(e)?.display as ImageElement)?.visMap;

            if (c.visMap === undefined) {
                c.visMap = this.bigStorage.create(visData, BigEntryFlags.NO_SYNC).multiId;
            } else {
                c.visMap = this.bigStorage.replace(c.visMap, visData);
            }
        }
    }

    enable(): void {
    }

    destroy(): void {
    }
}
