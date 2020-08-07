import {MapLevel} from "./mapLevel";

import {encode, decodeAsync, decode} from "@msgpack/msgpack";
import JSZip from "jszip";

export class GameMap {
    static SER_VERSION = '1.0';

    levels = new Map<number, MapLevel>();


    private createDataJson(): Uint8Array {
        let levels: { [id: string]: any } = {};

        for (let [id, level] of this.levels.entries()) {
            levels[id] = level.serialize();
        }

        let data = {
            version: GameMap.SER_VERSION,
            levels: levels,
        };
        return encode(data);
    }

    saveToFile(): Promise<Blob> {
        let data = this.createDataJson();
        let zip = new JSZip();
        zip.file("data.msgpack", data);
        return zip.generateAsync({type: "blob"})
    }

    static async loadFromFile(from: File): Promise<GameMap> {
        let zip = await JSZip.loadAsync(from);
        let file = await zip.file("data.msgpack").async('arraybuffer');
        let data = await decode(file) as any;

        if (data['version'] !== this.SER_VERSION) {
            throw 'Version not supported';
        }

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