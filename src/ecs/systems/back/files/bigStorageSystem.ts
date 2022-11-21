import { System } from "../../../system";
import { SingleEcsStorage } from "../../../storage";
import { Component } from "../../../component";
import { World } from "../../../world";
import { NetworkSystem, NETWORK_TYPE } from "../networkSystem";
import { FileDb, FileIndex } from "../../../../map/FileDb";
import { BigStorageNetworkClient, BigStorageNetworkServer } from "./bigStorageNetwork";

export const FILE_REQUSEST_CANCELED = Symbol();

export const BIG_ENTRY_REF_TYPE = 'big_entry_ref';
export type BIG_ENTRY_REF_TYPE = typeof BIG_ENTRY_REF_TYPE;
export interface BigEntryRefComponent extends Component {
    type: BIG_ENTRY_REF_TYPE;
    totRefs: number,
    refs: {[id: FileIndex]: number};
}

export const BIG_STORAGE_TYPE = 'big_storage';
export type BIG_STORAGE_TYPE = typeof BIG_STORAGE_TYPE;
export class BigStorageSystem implements System {
    readonly name = BIG_STORAGE_TYPE;
    readonly dependencies = [];
    readonly optionalDependencies = [NETWORK_TYPE];

    readonly world: World;
    readonly netSys?: NetworkSystem;
    private adapter: Adapter;
    files: FileDb = new FileDb();
    refStorage = new SingleEcsStorage<BigEntryRefComponent>(BIG_ENTRY_REF_TYPE, false, false);
    fileRefs = new Map<string, number>();


    constructor(world: World) {
        this.world = world;

        world.addStorage(this.refStorage);
        world.events.on('hook_files', (fdb: FileDb) => {
            console.log("[BigStorage] FileDB Hooked, files: " + fdb.entries.size);
            this.files = fdb
        });
        world.events.on('component_removed', this.onComponentRemoved, this);

        this.netSys = world.systems.get(NETWORK_TYPE) as NetworkSystem | undefined;
        if (world.isMaster) {
           this.adapter = new ServerAdapter(this);
        } else {
           this.adapter = new ClientAdapter(this);
        }
    }

    private onComponentRemoved(comp: Component): void {
        if (comp.type === BIG_ENTRY_REF_TYPE) {
            const c = comp as BigEntryRefComponent;
            if (c.totRefs === 0) return;
            console.error("Trying to remove non-zeroed file reference component (missing drops?)")
            for (const refId in c.refs) {
                const refCount = c.refs[refId];
                this._dropRef(refId, refCount);
            }
        }
    }

    async create(data: Uint8Array): Promise<FileIndex> {
        if (!this.world.isMaster) {
            throw Error("Trying to create a big entry on a non-master world");
        }

        return await this.files.save(data, 0);
    }

    createUnique(data: Uint8Array): FileIndex {
        if (!this.world.isMaster) {
            throw Error("Trying to create a big entry on a non-master world");
        }
        return this.files.saveRandom(data, 0);
    }

    async request(id: FileIndex, priority: number = 0): Promise<Uint8Array> {
        return this.adapter.request(id, priority);
    }

    requestCached(id: FileIndex): Uint8Array | undefined {
        return this.files.load(id);
    }

    // THESE TWO MUST BE RE-ENTRANT!

    newUse(owner: number, id: FileIndex): void {
        let entSto = this.refStorage.getComponent(owner);
        if (entSto === undefined) {
            entSto = {
                type: BIG_ENTRY_REF_TYPE,
                entity: -1,
                totRefs: 0,
                refs: {},
            } as BigEntryRefComponent;
            this.world.addComponent(owner, entSto);
        }
        entSto.totRefs += 1;
        //console.log("++++++++ Use: ", owner, id, entSto.totRefs);
        if (!(id in entSto.refs)) {
            entSto.refs[id] = 1;
        } else {
            entSto.refs[id] += 1;
        }
        this._createRef(id, 1);
        this.world.events.emit('file_usage_inc', owner, id);
    }

    dropUse(owner: number, id: FileIndex): void {
        let entSto = this.refStorage.getComponent(owner);
        if (entSto === undefined) {
            console.error("Unpaired file drop");
            return;
        }
        entSto.totRefs--;
        //console.log("-------- Use: ", owner, id, entSto.totRefs);
        if (id in entSto.refs && entSto.refs[id] > 0) {
            entSto.refs[id] -= 1;
        } else {
            console.error("Unpaired file drop");
            return;
        }
        if (entSto.refs[id] <= 0) {
            delete entSto.refs[id];
        }
        if (entSto.totRefs === 0) {
            this.world.removeComponent(entSto);
        }
        this.world.events.emit('file_usage_dec', owner, id);
        this._dropRef(id, 1);
    }

    private _createRef(file: FileIndex, refs: number): void {
        this.files.require(file, refs);
    }

    private _dropRef(file: FileIndex, refs: number): void {
        this.files.dump(file, refs);
    }

    enable() {
    }

    destroy() {
    }
}

interface Adapter {
    request(id: FileIndex, priority: number): Promise<Uint8Array>;
}

class ClientAdapter implements Adapter {
    private sys: BigStorageSystem;
    private net: BigStorageNetworkClient;

    constructor(sys: BigStorageSystem) {
        this.sys = sys;
        this.net = new BigStorageNetworkClient(sys);
    }


    async request(id: FileIndex, priority: number): Promise<Uint8Array> {
        const data = this.sys.files.load(id);
        if (data !== undefined) return data;
        const retrieved = await this.net.requestFile(id, priority);
        this.sys.files.savePrecomputed(id, retrieved, 0);
        return retrieved;
    }
}

class ServerAdapter implements Adapter  {
    private sys: BigStorageSystem;
    private net?: BigStorageNetworkServer;

    constructor(sys: BigStorageSystem) {
        this.sys = sys;
        if (sys.netSys !== undefined) {
            this.net = new BigStorageNetworkServer(sys);
        }
    }

    async request(id: string, priority: number): Promise<Uint8Array> {
        const data = this.sys.files.load(id);
        if (data === undefined) {
            console.log("Available files:", Array.from(this.sys.files.entries.keys()));
            throw Error("Cannot find id! " + id);
        }
        return data;
    }
}
