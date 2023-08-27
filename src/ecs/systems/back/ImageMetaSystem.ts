import { Component, HideableComponent, MultiComponent, SharedFlag, SHARED_TYPE } from "@/ecs/component";
import { SingleEcsStorage } from "@/ecs/Storage";
import { System } from "@/ecs/System";
import { World } from "@/ecs/World";
import { ImageMeta } from "@/graphics";
import { FileIndex } from "@/map/FileDb";
import { emitCommand } from "../command/command";
import { DeSpawnCommand } from "../command/despawnCommand";
import { SpawnCommandKind } from "../command/spawnCommand";
import { DECLARATIVE_LISTENER_TYPE } from "./DeclarativeListenerSystem";
import { BigStorageSystem, BIG_STORAGE_TYPE } from "./files/bigStorageSystem";
import { ComponentType } from "@/ecs/TypeRegistry";


export const IMAGE_META_TYPE = 'image_meta';
export type IMAGE_META_TYPE = typeof IMAGE_META_TYPE;
export interface ImageMetaComponent extends MultiComponent, HideableComponent {
    type: IMAGE_META_TYPE,
    image: FileIndex,
    meta: ImageMeta,
    _ref: number,// only visible entities are computed!
}

export const IMAGE_META_SYNC_TYPE = 'image_meta_sync';
export type IMAGE_META_SYNC_TYPE = typeof IMAGE_META_SYNC_TYPE;
export class ImageMetaSyncSystem implements System {
    readonly name = IMAGE_META_SYNC_TYPE;
    readonly dependencies = [DECLARATIVE_LISTENER_TYPE, BIG_STORAGE_TYPE];
    readonly components?: [ImageMetaComponent];

    readonly world: World;
    readonly storage = new SingleEcsStorage<ImageMetaComponent>(IMAGE_META_TYPE, true, false);
    private readonly fileSys: BigStorageSystem;

    private metaMap = new Map<FileIndex, number>();

    constructor(world: World) {
        this.world = world;
        world.addStorage(this.storage);

        this.fileSys =  world.requireSystem(BIG_STORAGE_TYPE);
        const declarative = world.requireSystem(DECLARATIVE_LISTENER_TYPE);


        if (world.isMaster) {
            world.events.on('register_image', (component, path) => {
                declarative.onComponentVisible<ComponentType, any>(component, path, this.onImageEdit, this);
            });
            world.events.on('image_preload', (data) => this.spawnMeta(data.id));
        } else {
            declarative.onComponent(IMAGE_META_TYPE, "", this.onMetaEdit, this);
        }
    }

    private onImageEdit(oldImg: FileIndex | undefined, newImg: FileIndex | undefined, comp: Component): void {
        // Send image meta!
        if (oldImg !== undefined) {
            const oldEntity = this.metaMap.get(oldImg);
            if (oldEntity !== undefined) {
                const data = this.storage.getComponent(oldEntity)!;
                if (--data._ref <= 0) {
                    const cmd = {
                        kind: 'despawn',
                        entities: [oldEntity],
                    } as DeSpawnCommand;
                    emitCommand(this.world, cmd, true);
                    this.metaMap.delete(oldImg);
                }
            }
        }
        if (newImg !== undefined) {
            const newEntity = this.metaMap.get(newImg);
            if (newEntity === undefined) {
                this.spawnMeta(newImg);
            } else {
                const data = this.storage.getComponent(newEntity);
                data!._ref++;
            }
        }
    }

    private spawnMeta(img: string) {
        // Create and sync image meta
        const meta = this.fileSys.files.loadMeta(img, 'image');
        const cmd = SpawnCommandKind.from(this.world, [
            {
                type: IMAGE_META_TYPE,
                image: img,
                meta,
                _ref: 1,
            } as ImageMetaComponent,
            {
                type: SHARED_TYPE
            } as SharedFlag,
        ]);
        const entityId = cmd.data.entities[0];
        this.metaMap.set(img, entityId);
        emitCommand(this.world, cmd, true);
    }

    private onMetaEdit(oldMeta: ImageMetaComponent | undefined, newMeta: ImageMetaComponent | undefined) {
        if (newMeta !== undefined) {
            this.fileSys.files.saveMeta(newMeta.image, 'image', newMeta.meta);
        }
    }

    enable(): void {
    }
    destroy(): void {
    }
}
