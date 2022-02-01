import {MapLevel, SerializedMapLevel} from "./mapLevel";

import {decode, encode} from "@msgpack/msgpack";
import JSZip from "jszip";
import { rewriteCompatibility } from "./backporting";

export interface SerializedGameMap {
    version: any;
    levels: {[id: number]: SerializedMapLevel};
}

export class GameMap {
    static SER_VERSION = '1.1';

    levels = new Map<number, MapLevel>();


    private createDataJson(): Uint8Array {
        let levels: { [id: string]: any } = {};

        for (let [id, level] of this.levels.entries()) {
            levels[id] = level.serialize();
        }

        let data = {
            version: GameMap.SER_VERSION,
            levels: levels,
        } as SerializedGameMap;
        return encode(data);
    }

    saveToFile(): Promise<Blob> {
        let data = this.createDataJson();
        let zip = new JSZip();
        zip.file("data.msgpack", data);
        return zip.generateAsync({
            type: "blob",
            compression: 'DEFLATE',
            // Prevent the browser from renaming the extension
            mimeType: 'application/octet-stream',
        })
    }

    static async loadFromFile(from: File): Promise<GameMap> {
        let zip = await JSZip.loadAsync(from);
        // TODO: better error management
        // TODO: display loading percentage
        let file = await zip.file("data.msgpack")!.async('arraybuffer');
        let data = await decode(file) as SerializedGameMap;

        // This also checks for data.version compatibility
        rewriteCompatibility(data);

        let gameMap = new GameMap();

        let levelsData = data["levels"];
        for (let id in levelsData) {
            let level = levelsData[id];
            let res = await MapLevel.deserialize(parseInt(id), level);
            gameMap.levels.set(res.id, res);
        }
        return gameMap;
    }
}
