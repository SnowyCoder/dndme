import {System} from "../system";
import {World} from "../world";
import {loadTexture} from "../../util/pixi";
import {Component} from "../component";
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
import {BIG_STORAGE_TYPE, BigStorageIndex, BigStorageSystem} from "./back/bigStorageSystem";

export type BACKGROUND_TYPE = 'background_image';
export const BACKGROUND_IMAGE_TYPE = 'background_image';

interface BSImageEntry {
    image: Uint8Array;
    visibilityMap?: Uint32Array;
}

export interface BackgroundImageComponent extends Component {
    type: BACKGROUND_TYPE;
    image: BigStorageIndex<BSImageEntry>;
    imageType: string;
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
        this.world.events.on(EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE, this.onRememberBBBUpdate, this);
    }

    private async onComponentAdd(c: Component): Promise<void> {
        if (c.type !== BACKGROUND_IMAGE_TYPE) return;
        let bkgImg = c as BackgroundImageComponent;

        if (typeof bkgImg.image !== 'number') {
            if (Uint8Array.prototype.isPrototypeOf(bkgImg.image)) {
                // previous versions did not have BigStorageSystem, let's fix that
                console.info("Converting background to BigStorage...");
                bkgImg.image = this.bigStorage.create({
                    image: bkgImg.image,
                    visibilityMap: (bkgImg as any).visibilityMap,
                } as BSImageEntry).multiId;
                delete (bkgImg as any)['visibilityMap'];
            } else {
                console.warn("Error, could not convert bkgImage! Resetting", bkgImg.image);
                bkgImg.image = 0;
                this.world.removeComponent(c);
                return;
            }
        }

        let bdata = this.bigStorage.requestUse<BSImageEntry>(bkgImg.image)!!.data;

        if (bdata.image.byteOffset !== 0) {
            // Copy array to remove offset (TODO: fix)
            // https://github.com/peers/peerjs/issues/715
            bdata.image = new Uint8Array(bdata.image);
        }
        if (bdata.visibilityMap !== undefined) {
            let res = new Uint8Array(bdata.visibilityMap);// Copy buffer (adjusts alignment)
            bdata.visibilityMap = new Uint32Array(res.buffer);
        }

        let tex = await loadTexture(bdata.image, bkgImg.imageType);

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
                visMap: bdata.visibilityMap,
                texture: tex,
                anchor: { x: 0.5, y: 0.5 },
                tint: 0xFFFFFF,
            } as ImageElement,
        } as GraphicComponent);
    }

    private onComponentRemove(c: Component): void {
        if (c.type !== BACKGROUND_IMAGE_TYPE) return;
        let bkgImg = c as BackgroundImageComponent;

        this.bigStorage.dropUse(bkgImg.image);
    }

    private onRememberBBBUpdate(entities: number[]): void {
        let gstor = this.world.storages.get(GRAPHIC_TYPE) as SingleEcsStorage<GraphicComponent>;

        for (let e of entities) {
            let c = this.storage.getComponent(e);
            if (c === undefined) continue;
            let bdata = this.bigStorage.request<BSImageEntry>(c.image)?.data!!;
            bdata.visibilityMap = (gstor.getComponent(e)?.display as ImageElement)?.visMap;
        }
    }

    enable(): void {
    }

    destroy(): void {
    }
}