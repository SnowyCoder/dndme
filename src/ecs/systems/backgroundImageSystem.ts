import {System} from "../System";
import {World} from "../World";
import {Component, TRANSFORM_TYPE} from "../component";
import {SingleEcsStorage} from "../Storage";
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
import {BIG_STORAGE_TYPE, BigStorageSystem} from "./back/files/bigStorageSystem";
import { NameAsLabelComponent, NAME_AS_LABEL_TYPE } from "./back/NameAsLabelSystem";
import { InteractionComponent, INTERACTION_TYPE, ObbShape } from "./back/InteractionSystem";
import { Aabb } from "../../geometry/aabb";
import { FileIndex } from "../../map/FileDb";

export type BACKGROUND_IMAGE_TYPE = 'background_image';
export const BACKGROUND_IMAGE_TYPE = 'background_image';

export interface BackgroundImageComponent extends Component {
    type: BACKGROUND_IMAGE_TYPE;
    image: FileIndex;
    visMap: FileIndex | undefined;
}


export class BackgroundImageSystem implements System {
    readonly name = BACKGROUND_IMAGE_TYPE;
    readonly dependencies = [GRAPHIC_TYPE, BIG_STORAGE_TYPE];
    readonly components?: [BackgroundImageComponent];

    readonly world: World;
    readonly storage: SingleEcsStorage<BackgroundImageComponent>;
    private readonly bigStorage: BigStorageSystem;

    constructor(world: World) {
        this.world = world;
        this.bigStorage = world.requireSystem(BIG_STORAGE_TYPE);

        this.storage = new SingleEcsStorage<BackgroundImageComponent>(BACKGROUND_IMAGE_TYPE, true, true);

        this.world.addStorage(this.storage);
        this.world.events.on('component_add', this.onComponentAdd, this);
        this.world.events.on('component_edited', this.onComponentEdited, this);

        //this.world.events.on('component_remove', this.onComponentRemove, this);
        if (this.world.isMaster) {
            this.world.events.on(EVENT_REMEMBER_BIT_BY_BIY_MASK_UPDATE, this.onRememberBBBUpdate, this);
        }

        this.world.events.emit('register_image', BACKGROUND_IMAGE_TYPE, 'image');
    }

    private async onComponentAdd(c: Component): Promise<void> {
        if (c.type !== BACKGROUND_IMAGE_TYPE) return;
        let bkgImg = c as BackgroundImageComponent;

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
                visMap: bkgImg.visMap,
                texture: {
                    type: 'external',
                    value: bkgImg.image,
                    priority: 10,
                },
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
        if (comp.type !== TRANSFORM_TYPE && comp.type !== INTERACTION_TYPE) return;
        const background = this.storage.getComponent(comp.entity);
        if (background === undefined) return;

        this.world.editComponent(comp.entity, NAME_AS_LABEL_TYPE, {
            initialOffset: { x: 0, y: this.computeLabelHeightOffset(comp.entity)},
        } as NameAsLabelComponent);
    }

    private computeLabelHeightOffset(entity: number) {
        const shape = this.world.getComponent(entity, INTERACTION_TYPE)!.shape as ObbShape;
        const aabb = Aabb.zero();
        aabb.wrapPolygon(shape.data.rotVertex);

        return -(aabb.maxY - aabb.minY) / 2;
    }

    private onRememberBBBUpdate(entities: number[]): void {
        let gstor = this.world.getStorage(GRAPHIC_TYPE);

        for (let e of entities) {
            let c = this.storage.getComponent(e);
            if (c === undefined) continue;
            const visData = (gstor.getComponent(e)?.display as ImageElement)?.visMap;
            c.visMap = visData;
        }
    }

    enable(): void {
    }

    destroy(): void {
    }
}
