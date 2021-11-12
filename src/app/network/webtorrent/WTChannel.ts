import SimplePeer from "simple-peer";
import SafeEventEmitter from "../../util/safeEventEmitter";
import { WTDiscovery } from "./WTDiscovery";
import { encode, decode } from "@msgpack/msgpack";
import { base64UrlToBuffer, bufferToBase64Url, randombytes } from "../../util/jsobj";
import { Buffer } from "buffer";

declare module 'simple-peer' {
    interface Instance {
        _pc: RTCPeerConnection | null;
        _channel: RTCDataChannel | null;
    }
}

/**
 * Header structure:
 * flags: 1 byte
 * from: 4 bytes
 * to: 4 bytes (-1 = broadcast)
 * partial_size: 4 bytes (only if flags contains PARTIAL)
 *
 */
enum ChunkFlags {
    PARTIAL     = 1 << 0,
}
const MIN_HEADER_LENGTH = 1 + 4 + 4;
const RECEIVER_BROADCAST = 0xFFFF_FFFF;

const ENDIANESS = true;

interface PeerData {
    peerId: string;
    id: number;
    socket: SimplePeer.Instance;
    afterSendBounded: (e: Error | undefined | null) => void,
    sending: boolean;
    packets: Uint8Array[];
    partial?: {
        index: number;
        size: number;
        info: PacketInfo;
        // That's an XOR between buffer and forwardTo,
        // but typescript won't let me write this in an
        // algebraic type.
        buffer?: Uint8Array,
        forwardTo?: number,
    },
}

export interface PacketInfo {
    isBroadcast: boolean;
    senderId: number;
}

/**
 * WebRTC data channel limit beyond which data is split into chunks
 * Chose 16KB considering Chromium
 * https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Using_data_channels#Concerns_with_large_messages
 */
const MAX_MESSAGE_LENGTH = 16300;

export class WTChannel {
    readonly discovery: WTDiscovery;
    readonly events: SafeEventEmitter = new SafeEventEmitter();
    readonly packets: SafeEventEmitter = new SafeEventEmitter();
    connectedSecret: Buffer;

    connections = new Map<number, PeerData>();
    private nextId: number = -1;
    myId: number = -1;
    private peers = new Map<string, PeerData>();

    constructor() {
        this.connectedSecret = Buffer.from([]);
        this.discovery = new WTDiscovery();
        this.discovery.onPeerCallback = this.onPeer.bind(this);
    }

    startMaster(): void {
        this.connectedSecret = randombytes(20);
        this.discovery.start(true, this.connectedSecret.toString('hex'));
        this.myId = 0;
        this.nextId = 1;
    }

    startClient(connectTo: Buffer | string): void {
        if (typeof connectTo == 'string') {
            connectTo = base64UrlToBuffer(connectTo);
        }
        this.connectedSecret = connectTo;
        this.discovery.start(false, connectTo.toString('hex'));
    }

    getConnectSecret(): string {
        return bufferToBase64Url(this.connectedSecret);
    }

    send(data: object, to: number): void {
        const receiver = this.connections.get(to);
        if (receiver === undefined) {
            throw new Error("Cannot find reciver");
        }
        const encoded = encode(data);
        this.sendRaw(encoded, receiver);
    }

    broadcast(data: object): void {
        this.sendRaw(encode(data));
    }

    destroy(): void {
        this.discovery.stop();
        for (let p of this.peers.values()) {
            p.socket.destroy();
        }
    }

    private sendRaw(data: Uint8Array, onlyTo?: PeerData): void {
        // We don't have to worry here about forwarded packets
        // they are handled on the receiving end.
        if (data.byteLength <= MAX_MESSAGE_LENGTH - MIN_HEADER_LENGTH) {
            const packet = new Uint8Array(data.byteLength + MIN_HEADER_LENGTH);
            packet.set(data, MIN_HEADER_LENGTH);

            const view = new DataView(packet.buffer);
            view.setUint32(1, this.myId, ENDIANESS);

            this.sendPacketRaw(packet, onlyTo);
            return;
        }
        // Yaay, let's split things!
        const packet = new Uint8Array(MAX_MESSAGE_LENGTH);
        const view = new DataView(packet.buffer);
        packet[0] = ChunkFlags.PARTIAL;
        view.setUint32(1, this.myId, ENDIANESS);
        view.setUint32(MIN_HEADER_LENGTH, data.length, ENDIANESS)

        let sent = MAX_MESSAGE_LENGTH - MIN_HEADER_LENGTH - 4;
        packet.set(data.subarray(0, sent), MIN_HEADER_LENGTH + 4);
        this.sendPacketRaw(packet, onlyTo, true);

        while (sent < data.byteLength) {
            const subarr = data.subarray(sent, sent + MAX_MESSAGE_LENGTH);
            sent += subarr.byteLength;
            this.sendPacketRaw(subarr, onlyTo, false);
        }
    }

    private sendPacketRaw(packet: Uint8Array, onlyTo?: PeerData, adjustFlags: boolean = true, broadcastExclde?: PeerData): void {
        const sendRaw = (x: PeerData): void => {
            if (x.sending) {
                x.packets.push(packet);
            } else {
                x.sending = true;
                x.socket.write(packet, undefined, x.afterSendBounded);
            }
        };

        let dataView = adjustFlags ? new DataView(packet.buffer, packet.byteOffset) : null;

        if (onlyTo === undefined) {
            dataView?.setUint32(1 + 4, RECEIVER_BROADCAST, ENDIANESS);
            for (let x of this.peers.values()) {
                if (x === broadcastExclde) continue;
                sendRaw(x);
            }
        } else {
            dataView?.setUint32(1 + 4, onlyTo.id, ENDIANESS);

            sendRaw(onlyTo);
        }
    }

    private afterDataSend(peer: PeerData, e: Error | null | undefined): void {
        const nextData = peer.packets.shift();
        if (nextData === undefined) {
            peer.sending = false;
            return;
        }
        peer.socket.write(nextData, undefined, peer.afterSendBounded);
    }

    private onPeer(peer: SimplePeer.Instance, peerId: string): void {
        const data = {
            peerId,
            id: this.discovery.isMaster ? this.nextId++ : 0,
            socket: peer,
            packets: [],
            sending: false,
            afterSendBounded: _ => {},
        } as PeerData;
        data.afterSendBounded = e => this.afterDataSend(data, e);
        this.peers.set(peerId, data);

        peer.once('connect', () => {
            if (this.discovery.isMaster) {
                peer.send('' + data.id);
                postBootstrap();
            } else {
                this.discovery.pause();
            }
        })

        const postBootstrap = () => {
            this.connections.set(data.id, data);
            this.events.emit('device_join', data.id);

            peer.on('data', (chunk: Uint8Array) => {
                this.onPeerData(data, chunk);
            });
        }

        if (!this.discovery.isMaster) {
            peer.once('data', (chunk: string) => {
                this.myId = parseInt(chunk);
                postBootstrap();
            })
        }


        peer.on('close', () => {
            console.error("Peer closed");
            this.connections.delete(data.id);
            this.peers.delete(peerId);
            this.events.emit('device_left', data.id);
            // Re-listen for master
            this.discovery.resume();
        });

        peer.on('error', (e: Error) => {
            console.error("Peer error", e);
        });

    }

    private onPeerData(peer: PeerData, chunk: Uint8Array): void {
        if (peer.partial) {
            this.onPartialData(peer, chunk);
            return;
        }

        const flags = chunk[0];
        const headerView = new DataView(chunk.buffer, chunk.byteOffset);
        const sender   = headerView.getUint32(1    , ENDIANESS);
        const receiver = headerView.getUint32(1 + 4, ENDIANESS);
        let header = MIN_HEADER_LENGTH;

        let pktInfo = {
            isBroadcast: receiver === RECEIVER_BROADCAST,
            senderId: sender,
        } as PacketInfo;

        const needsForward = receiver !== this.myId && !pktInfo.isBroadcast;

        if (flags & ChunkFlags.PARTIAL) {
            let size = headerView.getUint32(header, ENDIANESS);
            peer.partial = {
                index: 0,
                buffer: !needsForward ? new Uint8Array(size) : undefined,
                info: pktInfo,
                size,
            };
            header += 4;
        }

        if (needsForward) {
            if (!this.discovery.isMaster) {
                console.warn("Asket a non-master to forward");
                return;
            }
            const recv = this.connections.get(receiver);
            if (recv === undefined) {
                console.warn("Asked to forward to unknown peer");
                return;
            }
            if (peer.partial) {
                peer.partial.forwardTo = receiver;
            } else {
                this.sendPacketRaw(chunk, recv, false);
            }
            return;
        }

        if (this.discovery.isMaster && pktInfo.isBroadcast) {
            this.sendPacketRaw(chunk, undefined, false, peer);
        }

        if (peer.partial) {
            this.onPartialData(peer, chunk.subarray(header));
            return;
        }

        this.onMessage(chunk.subarray(header), pktInfo);
    }

    private onPartialData(peer: PeerData, chunk: Uint8Array): void {
        if (!peer.partial) throw new Error('wrong state: nor partial');

        let oldIndex = peer.partial.index;
        peer.partial.index += chunk.length;
        const isDone = peer.partial.size <= peer.partial.index;

        if (peer.partial.buffer !== undefined) {
            peer.partial.buffer.set(chunk, oldIndex);
        } else {
            let target = this.connections.get(peer.partial.forwardTo!!);
            if (target === undefined) return;
            this.sendPacketRaw(chunk, target, false);
        }

        if (isDone) {
            if (peer.partial.size < peer.partial.index) {
                console.warn("Partial is longer than expected");
            }

            const partial = peer.partial;
            peer.partial = undefined;
            if (partial.buffer !== undefined) {
                this.onMessage(partial.buffer, partial.info);
            }
        }
    }

    private onMessage(buffer: Uint8Array, info: PacketInfo) {
        let obj;
        try {
            obj = decode(buffer) as any;
        } catch (e) {
            console.error("Received wrong data", e);
            return;
        }

        this.events.emit('message', obj, info);
        const packetType = obj.type;
        if (packetType && typeof packetType === 'string') {
            this.packets.emit(packetType, obj, info);
        }
    }
}