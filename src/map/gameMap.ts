import { MapLevel, SerializedMapLevel } from "./mapLevel";

import { decode, encode } from "@msgpack/msgpack";
import JSZip from "jszip";
import { rewriteCompatibility } from "./backporting";
import { FileDb, SerializedFileDb } from "./FileDb";

export interface SerializedGameMap {
    version: any;
    levels: { [id: number]: SerializedMapLevel };
    filedb?: SerializedFileDb;
}

export class GameMap {
    static SER_VERSION = '1.2';

    levels = new Map<number, MapLevel>();
    filedb = new FileDb();
    name?: string;

    private createDataJson(): Uint8Array {
        let levels: { [id: string]: any } = {};

        for (let [id, level] of this.levels.entries()) {
            levels[id] = level.serialize();
        }

        let data = {
            version: GameMap.SER_VERSION,
            levels: levels,
            filedb: this.filedb.serialized(),
        } as SerializedGameMap;
        return encode(data);
    }

    saveToFile(progress: (prog: number) => void): Promise<Blob> {
        let data = this.createDataJson();
        let zip = new JSZip();
        zip.file("data.msgpack", data);
        this.filedb.saveToZip(zip.folder('files')!);
        return zip.generateAsync({
            type: "blob",
            compression: 'DEFLATE',
            // Prevent the browser from renaming the extension
            mimeType: 'application/octet-stream',
            streamFiles: true,
        }, meta => {
            progress(meta.percent);
        })
    }

    static async loadFromFile(from: File, progress: (prog: number) => void): Promise<GameMap> {
        let zip = await JSZip.loadAsync(from);
        // TODO: better error management

        // This also checks for data.version compatibility
        const gameMap = new GameMap();
        const data = await rewriteCompatibility(zip, gameMap.filedb, progress);
        const filesFolder = zip.folder('files');
        if (data.filedb != null && filesFolder != null) {
            await gameMap.filedb.loadFromZip(data.filedb, filesFolder, progress);
        }

        let levelsData = data["levels"];
        for (let id in levelsData) {
            let level = levelsData[id];
            let res = await MapLevel.deserialize(parseInt(id), level);
            gameMap.levels.set(res.id, res);
        }
        gameMap.name = from.name;
        return gameMap;
    }
}
