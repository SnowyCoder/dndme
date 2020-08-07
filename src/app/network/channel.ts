
import * as EventEmitter from "eventemitter3"
import {P2pConnection} from "./p2pConnection";
import {ErrorPacket, Packet, PacketContainer} from "../protocol/packet";

export class Channel {
    connections: P2pConnection[] = [];
    connectionsById = new Map<number, P2pConnection>();

    isHost: boolean;
    myId: number = -1;

    nextBroadcastPacketId: number = 0;

    eventEmitter: EventEmitter = new EventEmitter();

    constructor(isHost: boolean) {
        this.isHost = isHost;
        if (this.isHost) {
            this.myId = 0;
        }
    }

    onMessage(raw: any, conn: P2pConnection) {
        //console.log("onMessage", raw);
        let packet = raw as PacketContainer;// Check for errors?

        if (this.isHost) {
            packet.sender = conn.channelId;
        }
        if (packet.payload.type.startsWith("_")) {
            console.error("Invalid payload type");
            return;
        }

        // TODO: think of a better packetid system, we have some problems with
        //       host forwarding as the id changes, we can not have replies.
        if (this.isHost && packet.receiver !== this.myId) {
            let originalId = packet.id;
            if (packet.receiver === undefined) {
                packet.id = this.nextBroadcastPacketId++;
                for (let c of this.connectionsById.values()) {
                    if (c !== conn) {
                        c.send(packet);
                    }
                }
            } else {
                let recv = this.connectionsById.get(packet.receiver);
                if (recv === undefined) {
                    this.send({
                        type: "error",
                        errorType: "unknown_receiver",
                        requestId: packet.id,
                    } as ErrorPacket, conn.channelId);

                    return;
                }
                packet.id = recv.nextPacketId++;
                recv.send(packet);
            }
            packet.id = originalId;
        }

        if (packet.receiver === undefined || packet.receiver === this.myId) {
            let packetType = packet.payload.type;

            if (process.env.VERBOSE_CHANNEL === "1") {
                console.log("Read", packet);
            }
            this.eventEmitter.emit("any", packet.payload, packet);
            this.eventEmitter.emit(packetType, packet.payload, packet);
        }
    }

    broadcast(packet: Packet) {
        const wrapped = {
            id: this.nextBroadcastPacketId,
            payload: packet,
            sender: this.myId,
        } as PacketContainer;

        if (process.env.VERBOSE_CHANNEL === "1") {
            console.log("Sent", wrapped);
        }

        for (let conn of this.connectionsById.values()) {
            conn.send(wrapped);
        }

        this.nextBroadcastPacketId++;
    }

    send(packet: Packet, receiverId: number) {
        const wrapped = {
            id: 0,
            payload: packet,
            sender: this.myId,
        } as PacketContainer;

        if (this.isHost) {
            let conn = this.connectionsById.get(receiverId);
            if (conn === undefined) {
                throw "Unknown receiver"
            }
            wrapped.id = conn.channelId++;
            conn.send(wrapped);
        } else {
            wrapped.id = this.nextBroadcastPacketId++;
            for (let conn of this.connectionsById.values()) {
                conn.send(wrapped);
            }
        }

        if (process.env.VERBOSE_CHANNEL === "1") {
            console.log("Sent", wrapped);
        }
    }

    registerNewConnection(conn: P2pConnection) {
        this.connectionsById.set(conn.channelId, conn);
        this.connections.push(conn);

        conn.ondata = this.onMessage.bind(this);
        conn.nextPacketId = 0;

        this.eventEmitter.emit("_device_join", conn.channelId);
    }

    removeConnection(conn: P2pConnection) {
        this.connectionsById.delete(conn.channelId);
        const index = this.connections.indexOf(conn);
        if (index > -1) {
            this.connections.splice(index, 1);
        }
        this.eventEmitter.emit("_device_left", conn.channelId);
    }

}

