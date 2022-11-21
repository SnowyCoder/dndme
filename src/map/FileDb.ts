import JSZip from "jszip";
import { Buffer } from "buffer";

const HASH_ALGORITHM = 'sha-256';

export interface Entry {
    payload?: Uint8Array;
    meta: MetaStore;
    refCount: number;
}


export type FileIndex = string;

export type SerializedFileDb = { [name: string]: [number, MetaStore] };
export type MetaStore = {[id: string]: unknown};

export class FileDb {
    entries = new Map<FileIndex, Entry>();

    async save(data: Uint8Array, refs: number, meta?: MetaStore): Promise<FileIndex> {
        const hash = Buffer.from(await window.crypto.subtle.digest(HASH_ALGORITHM, data)).toString('binary');

        this.savePrecomputed(hash, data, refs, meta);

        return hash;
    }

    saveRandom(data: Uint8Array, refs: number, meta?: MetaStore): FileIndex {
        const hashBuf = Buffer.alloc(256 / 8);
        crypto.getRandomValues(hashBuf);
        const hash = hashBuf.toString('binary');

        this.savePrecomputed(hash, data, refs);

        return hash;
    }

    savePrecomputed(hash: FileIndex, data: Uint8Array, refs: number, meta?: MetaStore): void {
        const oldEntry = this.entries.get(hash);
        if (oldEntry !== undefined) {
            oldEntry.payload = data;
            // TODO: merge meta
            oldEntry.refCount += refs;
            return;
        }
        this.entries.set(hash, {
            payload: data,
            meta: meta ?? {},
            refCount: refs,
        });
    }

    require(hash: FileIndex, counts: number = 1): Uint8Array {
        const entry = this.entries.get(hash);
        if (entry === undefined || entry.payload === undefined) {
            throw Error("Required image but no payload found");
        }
        entry.refCount += counts;
        return entry.payload;
    }

    dump(hash: FileIndex, counts: number = 1): boolean {
        const entry = this.entries.get(hash);
        if (entry === undefined) {
            throw Error("Trying to dump nulled hash");
        }
        entry.refCount -= counts;
        if (entry.refCount > 0) return false;
        this.entries.delete(hash);
        return true;
    }

    load(hash: FileIndex): Uint8Array | undefined {
        return this.entries.get(hash)?.payload;
    }

    loadMeta(hash: FileIndex, index: string): any {
        return this.entries.get(hash)?.meta[index];
    }

    saveMeta(hash: FileIndex, index: string, data: any): void {
        //console.log("save meta", hash, index, data);
        if (!this.entries.has(hash)) {
            this.entries.set(hash, {
                payload: undefined,
                meta: {},
                refCount: 0,
            });
        }
        this.entries.get(hash)!.meta[index] = data;
    }

    clearUnused(): void {
        const toRemove = [];
        for (let [hash, entry] of this.entries.entries()) {
            if (entry.refCount == 0) toRemove.push(hash);
        }
        console.log("[FileDB] Clearing " + toRemove.length + " unused files")
        for (const x of toRemove) {
            this.entries.delete(x);
        }
    }

    serialized(): SerializedFileDb {
        const res = {} as SerializedFileDb;
        for (let [hash, entry] of this.entries)  {
            res[hash] = [entry.refCount, entry.meta];
        }
        return res;
    }

    saveToZip(folder: JSZip): void {
        for (let [hash, entry] of this.entries)  {
            if (!entry.payload) continue;
            const b64Hash = Buffer.from(hash, 'binary').toString('base64');
            folder.file(b64Hash, entry.payload);;
        }
    }

    async loadFromZip(serialized: SerializedFileDb, folder: JSZip, progress: (prog: number) => void): Promise<void> {
        for (let hash in serialized) {
            const data = serialized[hash];
            const b64Hash = Buffer.from(hash, 'binary').toString('base64');
            const file = folder.file(b64Hash);
            if (file == null) {
                console.warn("Cannot find file for " + b64Hash);
                continue;
            }
            const payload = await file.async('uint8array', meta => progress(meta.percent));
            console.log("[FileDb] Loaded file " + hash, data[1]);
            this.entries.set(hash, {
                refCount: data[0],
                meta: data[1],
                payload,
            })
        }
    }
}
