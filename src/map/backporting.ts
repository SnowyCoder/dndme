import { componentClone } from "@/ecs/ecsUtil";
import { ImageMeta } from "@/graphics";
import { loadTextureHTML } from "@/util/pixi";
import { decode } from "@msgpack/msgpack";
import JSZip from "jszip";
import { SHARED_TYPE } from "../ecs/component";
import {  MultiEcsStorageSerialized, SingleEcsStorageSerialzed } from "../ecs/Storage";
import { BIG_STORAGE_TYPE } from "../ecs/systems/back/files/bigStorageSystem";
import { BACKGROUND_IMAGE_TYPE } from "../ecs/systems/backgroundImageSystem";
import { GRID_TYPE } from "../ecs/systems/gridSystem";
import { PIN_TYPE } from "../ecs/systems/pinSystem";
import { SerializedWorld } from "../ecs/World";
import { STANDARD_GRID_OPTIONS } from "../game/grid";
import { arrayRemoveElem } from "../util/array";
import { FileDb } from "./FileDb";
import { SerializedGameMap, GameMap } from "./gameMap";

export class IncompatibleVersionError extends Error {
    constructor() {
        super("Version not supported");
        this.name = "IncompatibleVersion";
    }
}

function getResource<T>(world: SerializedWorld, name: string, def: T): T {
    if (world.resources === undefined) return def;
    if (!(name in world.resources)) return def;
    return world.resources[name];
}

function getOrCreateResource<T>(world: SerializedWorld, name: string, def: T): T {
    if (world.resources === undefined) {
        world.resources = {};
    }
    if (!(name in world.resources)) {
        world.resources[name] = def;
    }
    return world.resources[name];
}

export async function rewriteCompatibility(zip: JSZip, filedb: FileDb, progress: (prog: number) => void): Promise<SerializedGameMap> {
    let file = await zip.file("data.msgpack")!.async('arraybuffer', meta => progress(meta.percent));

    const data = decode(file) as SerializedGameMap;

    switch (data['version']) {
    case '1.0':
        console.log("COMPATIBILITY 1.0 -> 1.1");
        for (let id in data.levels) {
            const level = data.levels[id];
            if (level.ecs === undefined) continue;
            // Add share to all
            level.ecs.storages[SHARED_TYPE] = [...level.ecs.entities];
            // Adjust pin default size
            // old: 12px
            // new: 42px * (gridSize / stdGridSize)
            const gridResSize = getResource<any>(level.ecs, GRID_TYPE, {}).size ?? STANDARD_GRID_OPTIONS.size;
            const factor = (12 / 42) * (STANDARD_GRID_OPTIONS.size / gridResSize);
            console.log("Adjusting pin default size: " + factor);
            getOrCreateResource<any>(level.ecs, PIN_TYPE, {}).defaultSize = factor;
        }
    case '1.1':
        console.log("COMPATIBILITY 1.1 -> 1.2");
        // Rewrite bigStorageSystem to filedb!

        // Used to translate background images and such.
        const translationMap = new Map<number, string | any>();
        for (let id in data.levels) {
            const level = data.levels[id];
            if (level.ecs === undefined) continue;
            // Remove big_storage resource (resource points to entity and every file is a component to that entity)
            if (level.ecs.resources === undefined) continue;
            if (BIG_STORAGE_TYPE in level.ecs.resources) {
                const entity = level.ecs.resources[BIG_STORAGE_TYPE].entity;
                console.log("BigStorage entity:", entity)
                delete level.ecs.resources[BIG_STORAGE_TYPE];
                // TODO: remove BigStorage entity from SHARED (since it does not exist anymore)
                // delete entry from array
                arrayRemoveElem(level.ecs.entities, entity);

                const storages = level.ecs.storages as any;
                const bigEntries = (storages[BIG_STORAGE_TYPE] as MultiEcsStorageSerialized)[entity];
                delete storages[BIG_STORAGE_TYPE];
                console.log("Porting " + bigEntries.length + " files");
                for (const entry of bigEntries) {
                    console.log("Saving big entry...");
                    if (Uint8Array.prototype.isPrototypeOf(entry.data)) {
                        const id = await filedb.save(entry.data, 0);
                        translationMap.set(entry.multiId, id);
                    } else if (typeof entry.data === 'object') {
                        let data = {} as any;
                        for (let key in entry.data) {
                            let newId = await filedb.save(entry.data[key], 0);
                            data[key] = newId;
                        }
                        translationMap.set(entry.multiId, data);
                    } else {
                        console.error("Could not translate bigStorage", JSON.stringify(entry));
                    }
                }
            }
            // Only background images use bigStorage for now:
            const backImg = level.ecs.storages[BACKGROUND_IMAGE_TYPE] as SingleEcsStorageSerialzed | undefined;
            if (backImg !== undefined) {
                for (const imgId in backImg) {
                    const img = backImg[imgId];
                    console.log("Adjusting image: ", componentClone(img));

                    if (typeof img.image === 'number') {
                        const data = translationMap.get(img.image);
                        // reeeeally old version had a single "image" handle to
                        // an {image: u8[], visMap: u8[]} bigentry
                        // (visMap or visibilityMap??)
                        if (typeof data === 'object') {
                            const visMap = data.visMap ?? data.visibilityMap;
                            img.image = data.image;
                            if (visMap != null) img.visMap = visMap;
                        } else if (typeof data === 'string') {
                            img.image = data;
                            if ('visMap' in img) {
                                // the other versions had a visMap handle to a u8[] bigstorage file
                                img.visMap = translationMap.get(img.visMap);
                            }
                        } else {
                            console.error("Unknown image type!", data);
                        }
                    } else if (Uint8Array.prototype.isPrototypeOf(img.image)) {
                        // even more really old version had no bigstorage, just u8[] in the component
                        // (that caused quite some trouble with vue 2)
                        img.image = await filedb.save(img.image, 0);
                        if (Uint8Array.prototype.isPrototypeOf(img.visMap ?? img.visibilityMap)) {
                            img.visMap = await filedb.save(img.visMap ?? img.visibilityMap, 0);
                        } else {
                            img.visMap = undefined;
                        }
                        delete img.visibilityMap;
                    }
                    let imageType = 'image/jpeg';
                    if (img.imageType !== undefined) {
                        imageType = img.imageType;
                        delete img.imageType;
                    }
                    let htmlImage = await loadTextureHTML(filedb.load(img.image)!, imageType);

                    filedb.saveMeta(img.image, "image", {
                        dims: [htmlImage.naturalWidth, htmlImage.naturalHeight],
                        format: imageType,
                    } as ImageMeta);
                    console.log("Adjusted image: ", img);
                    filedb.require(img.image);
                    if (img.visMap != null) filedb.require(img.visMap);
                }
            }
        }
        filedb.clearUnused();
        filedb.resetUsage();

    case GameMap.SER_VERSION:
        break;// Current version
    default:
        throw new IncompatibleVersionError();
    }

    return data;
}
