import { Logger, getLogger } from "@/ecs/systems/back/log/Logger";
import { ServerSignaler } from "./ServerSignaler";
import { SignalData, Signaler, WrtcConnection } from "../channel/WrtcConnection";
import { ClientId } from "./Protocol";
import { EventEmitter } from "eventemitter3";
import { Buffer } from "buffer";

// You can't use an ArrayBuffer as map keys
type BinaryClientId = string;

const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

export type SignalerDiscoveryEventTypes = {
    'on_peer': [WrtcConnection, string],
};

export interface RoomCreateInfo {
    name?: string;
    password: string;
    password_hint?: string;
}

// new DndmeSignalerDiscovery(identity, logger, );
export class PeerConnector {
    readonly signaler: ServerSignaler;
    readonly logger: Logger;
    readonly wrtcConfig: RTCConfiguration;

    readonly events = new EventEmitter<SignalerDiscoveryEventTypes>();

    private peers = new Map<BinaryClientId, WrtcConnection>();

    private isMaster: boolean = false;

    constructor(signaler: ServerSignaler, wrtcConfig: RTCConfiguration) {
        this.signaler = signaler;
        this.logger = getLogger('connection.discovery');
        this.wrtcConfig = wrtcConfig;

        this.signaler.events.on('room_left', this.severeConnections.bind(this));
        //this.signaler.events.on('room_destroyed', this.severeConnections.bind(this));
        //this.signaler.events.on('disconnect', this.severeConnections.bind(this));

        this.signaler.events.on('room_joined', this.onRoomJoin.bind(this));
        this.signaler.events.on('room_created', this.onRoomCreated.bind(this));

        this.signaler.events.on('user_join', this.onUserJoin.bind(this));
        this.signaler.events.on('user_leave', this.onUserLeave.bind(this));

        this.signaler.events.on('user_message', this.onUserMessage.bind(this));
    }

    private sendSignalingMessage(peerId: ClientId, data: SignalData): void {
        this.logger.debug('Send signaling: ', peerId, data);
        const enc = JSON.stringify(data);
        this.signaler.sendMessage(peerId, TEXT_ENCODER.encode(enc));
    }

    private severeConnections() {
        this.logger.info("severeConnections");

        for (let peer of this.peers.values()) {
            peer.destroy();
        }
        this.peers.clear();
    }

    private createSignaler(peerId: ClientId): Signaler {
        return {
            signal: m => this.sendSignalingMessage(peerId, m),
        } as Signaler;
    }

    private onRoomJoin(master: ClientId, others: ClientId[]) {
        this.logger.trace("onRoomJoin", master, others);
        this.isMaster = false;

        const toContact = [master];
        if (this.signaler.networking == 'mesh') {
            toContact.push(...others);
        }
        for (const peer of toContact) {
            this.onNewConnection(peer, clientIdToBinary(peer), true);
        }
    }

    private onRoomCreated() {
        this.logger.trace("onRoomCreated");
        this.isMaster = true;
    }

    private onUserMessage(cid: ClientId, message: ArrayBuffer) {
        this.logger.trace("onUserMessage", cid, message);

        const bid = clientIdToBinary(cid);
        let data = this.peers.get(bid);
        if (data === undefined) {
            if (!this.isMaster && this.signaler.networking != 'mesh') {
                this.logger.warning("Warning! received user message when networking is not mesh!");
                return;
            }
            // New signaling data!
            this.onNewConnection(cid, bid, false);
            data = this.peers.get(bid)!;
        }
        try {
            const json = JSON.parse(TEXT_DECODER.decode(message));

            this.logger.debug("Received signaling: ", json);
            data.signaler.onmessage(json as SignalData);
        } catch(e) {
            this.logger.error("Error on processing signaling data from peer", cid, message);
        }
    }

    private onNewConnection(peerId: ClientId, binPeerId: string, isInitializer: boolean): void {
        if (this.peers.has(binPeerId)) {
            this.logger.debug("Ignoring offer to client, already in friend list", peerId);
            return;// Already have friend
            // TODO: check with heartbeet when the connection needs to be redone
        }
        const signaler = this.createSignaler(peerId);
        const conn = new WrtcConnection(this.wrtcConfig, signaler);
        this.peers.set(binPeerId, conn);
        conn.events.on("close", () => {
            this.peers.delete(binPeerId);
        });
        try {
            this.events.emit("on_peer", conn, binPeerId);
        } catch(e) {
            this.logger.error("Error during on_peer event", e);
        }
        if (isInitializer) {
            conn.makeOffer();
        }
    }

    private onUserJoin(cid: ClientId) {
        this.logger.debug('onUserJoin', cid);
    }

    private onUserLeave(cid: ClientId) {
        this.logger.debug('onUserLeave', cid);
    }
}


function clientIdToBinary(id: ClientId): BinaryClientId {
    return Buffer.from(id).toString('binary')
}
