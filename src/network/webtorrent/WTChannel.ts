import SafeEventEmitter from "../../util/safeEventEmitter";
import { WTDiscovery } from "./WTDiscovery";
import { encode, decode } from "@msgpack/msgpack";
import { base64UrlToBuffer, bufferToBase64Url, randombytes } from "../../util/jsobj";
import { Buffer } from "buffer";
import { WrtcConnection } from "../channel/WrtcConnection";
import { WrtcChannel } from "../channel/WrtcChannel";

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
    connection: WrtcConnection;
    socket: WrtcChannel;
    // Extra channels
    extras: {[key: symbol]: WrtcChannel}
    afterSendBounded: () => void;
    sending: boolean;
    packets: Uint8Array[];
    partial?: {
        index: number;
        size: number;
        info: PacketInfo;
        // That's an XOR between buffer and forwardTo,
        // but typescript won't let me write this in an
        // algebraic type.
        buffer?: Uint8Array;
        forwardTo?: number;
    },
}

export type ExtraChannelId = symbol;
export interface ExtraChannelInit {
    label: string;
    options?: Omit<RTCDataChannelInit, 'id' | 'negotiated'>;
}

export interface ExtraChannel {
    label: string;
    options: RTCDataChannelInit;
}

export interface PacketInfo {
    isBroadcast: boolean;
    senderId: number;
}

/**
 * WebRTC data channel limit beyond which data is split into chunks
 * Modern browsers all support 65535
 */
const MAX_MESSAGE_LENGTH = 65535;

export class WTChannel {
    readonly discovery: WTDiscovery;
    readonly events: SafeEventEmitter = new SafeEventEmitter();
    readonly packets: SafeEventEmitter = new SafeEventEmitter();
    connectedSecret: Buffer;

    connections = new Map<number, PeerData>();
    private nextId: number = -1;
    myId: number = -1;
    private peers = new Map<string, PeerData>();

    private extraChannels: {[key: symbol]: ExtraChannel} = {};
    private extraChannelNextId = 2;

    constructor() {
        this.connectedSecret = Buffer.from([]);
        this.discovery = new WTDiscovery();
        this.discovery.onPeerCallback = this.onPeer.bind(this);
        this.discovery.onTrackerConnectionCountEdit = (c: number) => this.events.emit('tracker_connections', c);
    }

    addExtraChannel(channel: ExtraChannelInit): symbol {
        const c = {
            label: channel.label,
            options: channel.options ?? {}
        } as ExtraChannel;
        c.options.negotiated = true;
        c.options.id = this.extraChannelNextId++;
        const id = Symbol();
        this.extraChannels[id] = c;
        if (this.connections.size > 0) {
            console.error("Late extra channel added");
        }
        return id;
    }

    getExtraChannel(peerId: number, sym: symbol): WrtcChannel {
        const peer = this.connections.get(peerId);
        if (peer === undefined) throw Error("Peer not found");
        const ch = peer.extras[sym];
        if (ch === undefined) throw Error("Extra channel not found");
        return ch;
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
            p.socket.close();
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
                x.socket.send(packet, x.afterSendBounded);
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

    private afterDataSend(peer: PeerData): void {
        const nextData = peer.packets.shift();
        if (nextData === undefined) {
            peer.sending = false;
            return;
        }
        peer.socket.send(nextData, peer.afterSendBounded);
    }

    private onPeer(peer: WrtcConnection, peerId: string): void {
        console.log('[WTChannel] Connecting peer...');
        const isMaster = this.discovery.isMaster;
        const socket = peer.createDataChannel('main', {
            negotiated: true,
            id: 1,
            ordered: true,
        });

        this.events.emit('peer_setup', peer);
        peer.handle.addEventListener('datachannel', ev => {
            this.events.emit('datachannel', ev.channel);
        })
        const data = {
            peerId,
            id: isMaster ? this.nextId++ : 0,
            connection: peer,
            extras: {},
            socket,
            packets: [],
            sending: false,
            afterSendBounded: () => {},
        } as PeerData;
        data.afterSendBounded = () => this.afterDataSend(data);
        this.peers.set(peerId, data);

        for (let id of Object.getOwnPropertySymbols(this.extraChannels)) {
            const x = this.extraChannels[id];
            data.extras[id] = peer.createDataChannel(x.label, x.options);
        }

        if (socket.handle.readyState !== 'connecting') throw Error("Already connected");
        socket.events.once('open', () => {
            console.log("[WTChannel] Connecton open");
            if (this.discovery.isMaster) {
                socket.send('' + data.id, postBootstrap);
            } else {
                this.discovery.pause();
            }
        });

        const postBootstrap = () => {
            this.connections.set(data.id, data);
            this.events.emit('device_join', data.id);

            socket.events.on('data', (chunk: ArrayBuffer) => {
                this.onPeerData(data, new Uint8Array(chunk));
            });
        }

        if (!this.discovery.isMaster) {
            socket.events.once('data', (chunk: string) => {
                this.myId = parseInt(chunk);
                postBootstrap();
            })
        }


        peer.events.on('close', () => {
            console.trace("[WTChannel] Peer closed");
            this.connections.delete(data.id);
            this.peers.delete(peerId);
            this.events.emit('device_left', data.id);
            // Re-listen for master
            this.discovery.resume();
        });

        peer.events.on('error', (e: Error) => {
            console.error("[WTChannel] Peer error", e);
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
