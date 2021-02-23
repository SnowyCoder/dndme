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

export type BACKGROUND_TYPE = 'background_image';
export const BACKGROUND_TYPE = 'background_image';

export interface BackgroundImageComponent extends Component {
    type: BACKGROUND_TYPE;

    image: Uint8Array;
    imageType: string;
    visibilityMap?: Uint32Array;
}


export class BackgroundSystem implements System {
    readonly name = BACKGROUND_TYPE;
    readonly dependencies = [GRAPHIC_TYPE];

    readonly world: World;
    readonly storage: SingleEcsStorage<BackgroundImageComponent>;

    constructor(world: World) {
        this.world = world;
        this.storage = new SingleEcsStorage<BackgroundImageComponent>(BACKGROUND_TYPE, true, true);

        this.world.addStorage(this.storage);
        this.world.events.on('component_add', this.onComponentAdd, this);
        this.world.events.on(EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE, this.onRememberBBBUpdate, this);
    }

    private async onComponentAdd(c: Component): Promise<void> {
        if (c.type !== BACKGROUND_TYPE) return;
        let bkgImg = c as BackgroundImageComponent;

        if (bkgImg.image.byteOffset !== 0) {
            // Copy array to remove offset (TODO: fix)
            // https://github.com/peers/peerjs/issues/715
            bkgImg.image = new Uint8Array(bkgImg.image);
        }
        if (bkgImg.visibilityMap !== undefined) {
            let res = new Uint8Array(bkgImg.visibilityMap);// Copy buffer (adjusts alignment)
            bkgImg.visibilityMap = new Uint32Array(res.buffer);
        }

        let tex = await loadTexture(bkgImg.image, bkgImg.imageType);

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
                visMap: bkgImg.visibilityMap,
                texture: tex,
                anchor: { x: 0.5, y: 0.5 },
                tint: 0xFFFFFF,
            } as ImageElement,
        } as GraphicComponent);

    }

    private onRememberBBBUpdate(entities: number[]): void {
        let gstor = this.world.storages.get(GRAPHIC_TYPE) as SingleEcsStorage<GraphicComponent>;

        for (let e of entities) {
            let c = this.storage.getComponent(e);
            if (c === undefined) continue;
            c.visibilityMap = (gstor.getComponent(e)?.display as ImageElement)?.visMap;
        }
    }

    enable(): void {
    }

    destroy(): void {
    }
}