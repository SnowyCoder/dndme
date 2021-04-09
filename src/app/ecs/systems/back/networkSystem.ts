import {System} from "../../system";
import {World} from "../../world";
import {Channel} from "../../../network/channel";
import * as P from "../../../protocol/game";
import {PacketContainer} from "../../../protocol/packet";
import {Command} from "../command/command";

export const NETWORK_TYPE = 'network';
export type NETWORK_TYPE = typeof NETWORK_TYPE;

export interface NetworkSystem extends System{
    isOnline(): boolean;
}

export const HOST_NETWORK_TYPE = 'host_network';
export type HOST_NETWORK_TYPE = typeof HOST_NETWORK_TYPE;
export class HostNetworkSystem implements NetworkSystem {
    readonly name = HOST_NETWORK_TYPE;
    readonly dependencies = [] as string[];
    readonly provides = [NETWORK_TYPE];

    readonly world: World;
    private channel: Channel;

    private connectedClients = 0;

    isEnabled = false;

    constructor(world: World, ch: Channel) {
        this.world = world;
        this.channel = ch;

        this.channel.eventEmitter.on('_device_join', this.onDeviceJoin, this);
        this.channel.eventEmitter.on('_device_left', this.onDeviceLeft, this);
        this.channel.eventEmitter.on('cmd', this.onCommandPacket, this);
        this.world.events.on('command_share', this.onCommandShare, this);
    }

    // ---------------------------------- EVENT LISTENERS ----------------------------------

    private onDeviceJoin(chId: number): void {
        this.connectedClients++;
        this.isEnabled = true;
        this.channel.send({
            type: "ecs_bootstrap",
            payload: this.world.serializeClient(),
        } as P.EcsBootrstrap, chId);
    }

    private onDeviceLeft(chId: number): void {
        this.connectedClients--;
        this.isEnabled = this.connectedClients !== 0;
    }

    private onCommandPacket(pkt: P.CommandPacket, container: PacketContainer) {
        const sender = container.sender;
        for (let cmd of pkt.data) {
            if (!this.checkCommand(sender, cmd)) continue;
            this.world.events.emit("command_emit", cmd, false);
        }
    }

    private checkCommand(sender: number, command: Command): boolean {
        console.warn("Received command from non-admin: ", command);
        return false;
    }

    private onCommandShare(command: Command[]): void {
        if (command.length === 0) return;
        this.channel.broadcast({
            type: 'cmd',
            data: command,
        } as P.CommandPacket);
    }

    isOnline(): boolean {
        return this.channel.connections.length !== 0;
    }

    enable(): void {
    }

    destroy(): void {
    }
}

export const CLIENT_NETWORK_TYPE = 'client_network';
export type CLIENT_NETWORK_TYPE = typeof CLIENT_NETWORK_TYPE;
export class ClientNetworkSystem implements NetworkSystem {
    readonly name = CLIENT_NETWORK_TYPE;
    readonly dependencies = [] as string[];
    readonly provides = [NETWORK_TYPE];

    readonly world: World;
    private channel: Channel;

    constructor(ecs: World, channel: Channel) {
        this.world = ecs;
        this.channel = channel;

        channel.eventEmitter.on('ecs_bootstrap', this.onEcsBootstrap, this);
        channel.eventEmitter.on('cmd', this.onCmd, this);
    }

    private onEcsBootstrap(packet: P.EcsBootrstrap, container: PacketContainer): void {
        if (container.sender !== 0) return; // Only admin

        this.world.deserialize(packet.payload);
    }

    private onCmd(packet: P.CommandPacket, container: PacketContainer): void {
        for (let cmd of packet.data) {
            if (!this.checkCommand(container.sender, cmd)) continue;
            this.world.events.emit("command_emit", cmd);
        }
    }

    private checkCommand(sender: number, command: Command): boolean {
        if (sender === 0) return true;
        console.warn("Received command from non-admin: ", command);
        return false;
    }

    isOnline(): boolean {
        return this.channel.connections.length !== 0;
    }

    enable(): void {
    }

    destroy(): void {
    }

}