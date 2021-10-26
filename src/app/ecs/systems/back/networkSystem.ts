import {System} from "../../system";
import {World} from "../../world";
import {Channel} from "../../../network/channel";
import * as P from "../../../protocol/game";
import {PacketContainer} from "../../../protocol/packet";
import {Command, emitCommand} from "../command/command";
import {Resource} from "../../resource";
import {Component} from "../../component";
import {SingleEcsStorage} from "../../storage";
import {SpawnCommand} from "../command/spawnCommand";
import {generateRandomId} from "../../ecsUtil";
import {DeSpawnCommand} from "../command/despawnCommand";

export const NETWORK_TYPE = 'network';
export type NETWORK_TYPE = typeof NETWORK_TYPE;

export interface NetworkSystem extends System{
    isOnline(): boolean;

    readonly channel: Channel;
}

export const NETWORK_ENTITY_TYPE = 'network_entity';
export type NETWORK_ENTITY_TYPE = typeof NETWORK_ENTITY_TYPE;
export interface NetworkEntityComponent extends Component {
    type: NETWORK_ENTITY_TYPE;
    networkId: number;
    color: number;
}


export const NETWORK_STATUS_TYPE = 'network_status';
export type NETWORK_STATUS_TYPE = typeof NETWORK_STATUS_TYPE;
export interface NetworkStatusResource extends Resource {
    type: NETWORK_STATUS_TYPE;
    connectionCount: number;
    isBuffering: boolean;
    myId: number;
    entityIndex: Map<number, number>;

    _save: false;
    _sync: false;
}

export class CommonNetworkSystem implements NetworkSystem {
    readonly name = NETWORK_TYPE;
    readonly dependencies = [];

    readonly channel: Channel;
    private world: World;

    private res: NetworkStatusResource;

    storage = new SingleEcsStorage<NetworkEntityComponent>(NETWORK_ENTITY_TYPE, true, false);

    constructor(world: World, channel: Channel) {
        this.channel = channel;
        this.world = world;

        this.world.addStorage(this.storage);

        this.res = {
            type: NETWORK_STATUS_TYPE,
            connectionCount: 0,
            isBuffering: false,
            entityIndex: new Map<number, number>(),
            _save: false,
            _sync: false,
        } as NetworkStatusResource;

        world.addResource(this.res);

        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('populate', this.onPopulate, this);

        if (world.isMaster) {
            world.addSystem(new HostNetworkSystem(world, channel));
        } else {
            world.addSystem(new ClientNetworkSystem(world, channel));
        }
    }

    private onComponentAdd(c: Component) {
        if (c.type === NETWORK_ENTITY_TYPE) {
            const comp = c as NetworkEntityComponent;

            this.res.entityIndex.set(comp.networkId, comp.entity);
        }
    }

    private onComponentRemove(c: Component) {
        if (c.type === NETWORK_ENTITY_TYPE) {
            const comp = c as NetworkEntityComponent;

            this.res.entityIndex.delete(comp.networkId);
        }
    }

    private onPopulate() {
        this.res.myId = this.channel.myId;

        if (this.world.isMaster) {
            this.spawnDeviceEntity(this.channel.myId);
            for (let c of this.channel.connections) {
                this.spawnDeviceEntity(c.channelId);
            }
        }
    }

    private updateConnectionCount() {
        const connectionCount = this.channel.connections.length;
        this.world.editResource(NETWORK_STATUS_TYPE, { connectionCount });
    }

    private spawnDeviceEntity(connId: number) {
        const cmd = {
            kind: 'spawn',
            entities: [{
                id: generateRandomId(),
                components: [{
                    type: NETWORK_ENTITY_TYPE,
                    networkId: connId,
                    color: Math.floor(Math.random() * 0xFFFFFF),
                } as NetworkEntityComponent],
            }]
        } as SpawnCommand;
        emitCommand(this.world, cmd);
    }

    onDeviceJoin(connId: number) {
        this.updateConnectionCount();
        if (this.world.isMaster) {
           this.spawnDeviceEntity(connId);
        }
    }

    onDeviceLeave(connId: number) {
        this.updateConnectionCount();
        if (this.world.isMaster) {
            const eid = this.res.entityIndex.get(connId);
            if (eid === undefined) {
                console.warn("Device " + connId + " had no associated entity");
                return;
            }
            const cmd = {
                kind: 'despawn',
                entities: [eid],
            } as DeSpawnCommand;
            this.world.events.emit('command_emit', cmd);
        }
    }

    onDeviceBufferUpdate() {
        const isBuffering = this.channel.bufferingChannels > 0;
        this.world.editResource(NETWORK_STATUS_TYPE, { isBuffering });
    }

    isOnline(): boolean {
        return this.channel.connections.length !== 0;
    }

    enable(): void {
        let chEvents = this.channel.eventEmitter;
        chEvents.on('_device_join', this.onDeviceJoin, this);
        chEvents.on('_device_left', this.onDeviceLeave, this);
        chEvents.on('_buffering_update', this.onDeviceBufferUpdate, this);
    }

    destroy(): void {
        let chEvents = this.channel.eventEmitter;
        chEvents.off('_device_join', this.onDeviceJoin, this);
        chEvents.off('_device_left', this.onDeviceLeave, this);
        chEvents.off('_buffering_update', this.onDeviceBufferUpdate, this);
    }
}

export const HOST_NETWORK_TYPE = 'host_network';
export type HOST_NETWORK_TYPE = typeof HOST_NETWORK_TYPE;
export class HostNetworkSystem {
    readonly name = HOST_NETWORK_TYPE;
    readonly dependencies = [] as string[];

    readonly world: World;
    private channel: Channel;

    constructor(world: World, ch: Channel) {
        this.world = world;
        this.channel = ch;

        this.world.events.on('command_share', this.onCommandShare, this);
    }

    // ---------------------------------- EVENT LISTENERS ----------------------------------

    private onDeviceJoin(chId: number): void {
        this.channel.send({
            type: "ecs_bootstrap",
            payload: this.world.serializeClient(),
        } as P.EcsBootrstrap, chId);
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

    enable(): void {
        this.channel.eventEmitter.on('_device_join', this.onDeviceJoin, this);
        this.channel.eventEmitter.on('cmd', this.onCommandPacket, this);
    }

    destroy(): void {
        this.channel.eventEmitter.off('_device_join', this.onDeviceJoin, this);
        this.channel.eventEmitter.off('cmd', this.onCommandPacket, this);
    }
}

export const CLIENT_NETWORK_TYPE = 'client_network';
export type CLIENT_NETWORK_TYPE = typeof CLIENT_NETWORK_TYPE;
export class ClientNetworkSystem {
    readonly name = CLIENT_NETWORK_TYPE;
    readonly dependencies = [] as string[];

    readonly world: World;
    private channel: Channel;

    constructor(ecs: World, channel: Channel) {
        this.world = ecs;
        this.channel = channel;
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

    enable(): void {
        this.channel.eventEmitter.on('ecs_bootstrap', this.onEcsBootstrap, this);
        this.channel.eventEmitter.on('cmd', this.onCmd, this);
    }

    destroy(): void {
        this.channel.eventEmitter.off('ecs_bootstrap', this.onEcsBootstrap, this);
        this.channel.eventEmitter.off('cmd', this.onCmd, this);
    }

}