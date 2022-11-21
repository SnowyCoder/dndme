import { Component, HideableComponent, MultiComponent, SharedFlag, SHARED_TYPE } from "@/ecs/component";
import { MultiEcsStorage, SingleEcsStorage } from "@/ecs/storage";
import { System } from "@/ecs/system";
import { World } from "@/ecs/world";
import { ImageMeta } from "@/graphics";
import { FileIndex } from "@/map/FileDb";
import { emitCommand, executeAndLogCommand } from "../command/command";
import { DeSpawnCommand } from "../command/despawnCommand";
import { SpawnCommand, SpawnCommandKind } from "../command/spawnCommand";
import { DeclarativeListenerSystem, DECLARATIVE_LISTENER_TYPE } from "./DeclarativeListenerSystem";
import { BigStorageSystem, BIG_STORAGE_TYPE } from "./files/bigStorageSystem";



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

    readonly world: World;
    readonly storage = new SingleEcsStorage<ImageMetaComponent>(IMAGE_META_TYPE, true, false);
    private readonly fileSys: BigStorageSystem;

    private metaMap = new Map<FileIndex, number>();

    constructor(world: World) {
        this.world = world;
        world.addStorage(this.storage);

        this.fileSys =  world.systems.get(BIG_STORAGE_TYPE) as BigStorageSystem;
        const declarative = world.systems.get(DECLARATIVE_LISTENER_TYPE) as DeclarativeListenerSystem;


        if (world.isMaster) {
            world.events.on('register_image', (component, path) => {
                declarative.onComponentVisible<FileIndex>(component, path, this.onImageEdit, this);
            });
            world.events.on('image_preload', (data) => this.spawnMeta(data.id));
        } else {
            declarative.onComponent<ImageMetaComponent>(IMAGE_META_TYPE, '', this.onMetaEdit, this);
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
