import { FileDb, FileIndex } from "@/map/FileDb";
import { WrtcChannel } from "@/network/channel/WrtcChannel";
import { ExtraChannelInit } from "@/network/webtorrent/WTChannel";
import { BigStorageSystem } from "./bigStorageSystem";
import { Buffer } from "buffer";

const DATA_FRAGMENT_SIZE = 1150;


const EXTRA_CHANNEL_INFO: ExtraChannelInit = {
    label: 'big_storage/file_exchange',
    options: {
        //ordered: false,
        //maxRetransmits: 0,
    }
};

interface RequestEntry {
    index: FileIndex;
    priority: number;
    currentIndex: number;
    current?: Uint8Array;
    onDone: Array<(data: Uint8Array) => void>;
    onError: Array<(err: Error) => void>;
}

enum PacketType {
    REQUEST = 0,
    CANCEL,
    ACCEPT,
    NOTFOUND,
    DELETED,
    FRAGMENT,
}

enum ClientState {
    IDLE,
    REQUEST_AWAIT_RESPONSE,
    DOWNLADING,
}

export class BigStorageNetworkClient {
    private files = new Map<FileIndex, RequestEntry>();

    private currentFile: RequestEntry | undefined;
    private state: ClientState = ClientState.IDLE;
    private pendingDecision: boolean = false;
    extraId: symbol;

    channel?: WrtcChannel;

    constructor(sys: BigStorageSystem) {
        const netSys = sys.netSys!;
        this.extraId = netSys.channel.addExtraChannel(EXTRA_CHANNEL_INFO);
        sys.netSys!.channel.events.on('device_join', (id: number) => {
            this.channel = sys.netSys?.channel.getExtraChannel(id, this.extraId);
            this.channel?.events.on('data', this.onMessage, this);
            this.queueRequestNext();
        });

        netSys.channel.events.on('device_leave', (id: number) => {
            this.channel?.events.off('data', this.onMessage, this);
            this.channel?.close();
            this.channel = undefined;
            switch (this.state) {
                case ClientState.IDLE: break;
                case ClientState.DOWNLADING:
                case ClientState.REQUEST_AWAIT_RESPONSE:
                    this.state = ClientState.IDLE;
                    break;
            }
        });
    }

    private requestFile0(entry: RequestEntry): void {
        const old = this.files.get(entry.index);
        const e = old ?? entry;
        if (old !== undefined) {
            entry = old;
            old.priority = Math.max(old.priority, entry.priority);
            old.onDone.concat(...entry.onDone);
            old.onError.concat(...entry.onError);
        } else {
            this.files.set(entry.index, entry);
        }

        this.queueRequestNext();
    }

    requestFile(index: FileIndex, priority: number): Promise<Uint8Array> {
        return new Promise((resolve, reject) => {
            this.requestFile0({
                index,
                priority,
                currentIndex: 0,
                onDone: [resolve],
                onError: [reject],
            } as RequestEntry);
        });
    }

    private queueRequestNext(): void {
        if (this.state === ClientState.IDLE && !this.pendingDecision) {
            this.pendingDecision = true;
            queueMicrotask(() => this.requestNext());
        }
    }

    private requestNext(): void {
        if (this.state !== ClientState.IDLE || this.channel === undefined) return;
        this.pendingDecision = false;

        let file = undefined;
        for (let x of this.files.values()) {
            if (file == null ||
                file.priority < x.priority ||
                (file.priority === x.priority && (x.current?.length ?? 0) > (file.current?.length ?? 0))) {
                file = x;
            }
        }
        if (file == null) {
            return;
        }
        this.currentFile = file;

        const indexU8 = Buffer.from(file.index, 'binary');
        // REQUEST, FILE_ID, OFFSET
        const data = Buffer.alloc(1 + 32 + 4);
        data[0] = PacketType.REQUEST;
        indexU8.copy(data, 1);
        data.writeUInt32LE(file.current?.length ?? 0, 32 + 1);

        this.channel.send(data, () => {});
        this.state = ClientState.REQUEST_AWAIT_RESPONSE;
    }

    onMessage(buf: ArrayBuffer): void {
        const pkt = Buffer.from(buf);
        const packetType = pkt.readUInt8(0);
        if (this.state === ClientState.REQUEST_AWAIT_RESPONSE) {
            switch (packetType) {
            case PacketType.NOTFOUND:
                this.onFileReceiveError("FileIndex not found");
                break;
            case PacketType.DELETED:
                this.onFileReceiveError("FileIndex deleted");
                break;
            case PacketType.ACCEPT: {
                const fileLen = pkt.readUInt32LE(1);
                console.log("Allocating file of " + fileLen);
                if (this.currentFile!.current === undefined) {
                    try {
                        this.currentFile!.current = new Uint8Array(fileLen);
                    } catch (e) {
                        this.sendCancel();
                        this.onFileReceiveError("Cannot allocate space for file");
                    }
                } else if (this.currentFile!.current.length !== fileLen) {
                    this.sendCancel();
                    this.onFileReceiveError("Inconsistent file length");
                }
                this.state = ClientState.DOWNLADING;
                break;
            }
            case PacketType.FRAGMENT:
                console.warn("Received late fragment");
                break;
            default:
                this.onFileReceiveError("Unknown packet response");
                break;
            }
        } else if (this.state === ClientState.DOWNLADING) {
            switch (packetType) {
            case PacketType.FRAGMENT:
                this.onFragment(pkt.slice(1));
                break;
            case PacketType.DELETED:
                this.onFileReceiveError("FileIndex deleted");
                break;
            default:
                this.onFileReceiveError("Unknown packet response");
                break;
            }
        }
    }

    private onFragment(data: Uint8Array): void {
        const file = this.currentFile!;
        console.log("Received fragment: " + data.length);
        if (data.length > file.current!.length - file.currentIndex) {
            this.sendCancel();
            this.queueRequestNext();
            this.onFileReceiveError("Server has misbehaved");
            return;
        }
        file.current!.set(data, file.currentIndex);
        file.currentIndex += data.length;
        if (file.currentIndex == file.current!.length) {
            console.log("File received");
            // DONE! weee
            this.state = ClientState.IDLE;
            this.queueRequestNext();
            this.currentFile = undefined;
            this.files.delete(file.index);
            file.onDone.forEach(x => x(file.current!));
        }
    }

    sendCancel(): void {
        const data = Buffer.alloc(1);
        data[0] = PacketType.CANCEL;

        this.channel!.send(data, () => {});
    }

    private onFileReceiveError(errorStr: string): void {
        this.state = ClientState.IDLE;
        this.queueRequestNext();
        const file = this.currentFile!;
        this.currentFile = undefined;
        this.files.delete(file.index);
        const err = new Error(errorStr);
        file.onError.forEach(x => x(err));
    }
}

interface ServerEntry {
    channel: WrtcChannel;
    onMessageBounded: (data: Uint8Array) => void;
    uploading?: {
        file: FileIndex;
        index: number;
    };
};

export class BigStorageNetworkServer {
    private clients = new Map<number, ServerEntry>();

    extraId: symbol;
    private files: FileDb = new FileDb();

    constructor(sys: BigStorageSystem) {
        const netSys = sys.netSys!;
        this.extraId = netSys.channel.addExtraChannel(EXTRA_CHANNEL_INFO);

        sys.world.events.on('hook_files', (fdb: FileDb) => {
            this.files = fdb
        });

        sys.netSys!.channel.events.on('device_join', (id: number) => {
            const channel = sys.netSys?.channel.getExtraChannel(id, this.extraId)!;
            if (this.clients.has(id)) {
                console.error("File server: Double join!");
                return;
            }
            const clientData = {
                channel,
                onMessageBounded: data => this.onMessage(id, data),
            } as ServerEntry;

            this.clients.set(id, clientData)
            channel.events.on('data', clientData.onMessageBounded);
        });

        netSys.channel.events.on('device_leave', (id: number) => {
            const channel = this.clients.get(id);
            if (this.clients.has(id)) {
                console.error("File server: Double join!");
                return;
            }
        });
    }

    private onMessage(clientId: number, buf: Uint8Array): void {
        if (buf.length < 1) {
            console.warn("Empty message received from", clientId);
            return;
        }
        const client = this.clients.get(clientId);
        if (client === undefined) return;

        const pkt = Buffer.from(buf);
        const packetType = pkt.readUInt8(0);
        if (client.uploading === undefined) {
            switch (packetType) {
            case PacketType.REQUEST: {
                if (buf.length < 32) {
                    console.warn("Invalid file size for message REQUEST from", clientId, buf.length);
                    return;
                }
                const fileId = pkt.slice(1, 32 + 1).toString('binary');
                const offset = pkt.readUInt32LE(32 + 1);
                const data = this.files.load(fileId);
                if (data === undefined) {
                    console.warn("Requested invalid file, ", fileId, [...this.files.entries.keys()]);
                    client.channel.send(Buffer.from([PacketType.NOTFOUND]), () => {});
                    return;
                }
                client.uploading = {
                    file: fileId,
                    index: offset,
                };
                const res = Buffer.alloc(1 + 4);
                res[0] = PacketType.ACCEPT;
                res.writeUInt32LE(data.length, 1);
                client.channel.send(res, () => this.onSendDone(clientId));
                break;
            }
            default:
                console.warn("Unknown client message", packetType);
            }
        } else {
            switch (packetType) {
            case PacketType.CANCEL: {
                client.uploading = undefined;
                break;
            }
            default:
                console.warn("Unknown client message", packetType);
            }

        }
    }

    private onSendDone(clientId: number): void {
        const client = this.clients.get(clientId);
        if (client === undefined || client.uploading === undefined) return;
        const data = this.files.load(client.uploading.file);
        if (data === undefined) {
            client.channel.send(Buffer.from([PacketType.DELETED]), () => {});
            return;
        }

        if (client.uploading.index >= data.length) {
            client.uploading = undefined;
            return;
        }

        const frag = data.slice(client.uploading.index, Math.min(data.length, client.uploading.index + DATA_FRAGMENT_SIZE - 1));
        client.uploading.index += frag.length;
        const packet = Buffer.alloc(frag.length + 1);
        packet[0] = PacketType.FRAGMENT;
        packet.set(frag, 1);
        client.channel.send(packet, () => this.onSendDone(clientId));
    }
}
