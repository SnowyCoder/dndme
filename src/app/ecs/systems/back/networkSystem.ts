import {System} from "../../system";
import {World} from "../../world";
import * as P from "../../../protocol/game";
import {Command, emitCommand} from "../command/command";
import {Resource} from "../../resource";
import {Component} from "../../component";
import {SingleEcsStorage} from "../../storage";
import {SpawnCommandKind} from "../command/spawnCommand";
import {DeSpawnCommand} from "../command/despawnCommand";
import { PacketInfo, WTChannel } from "../../../network/webtorrent/WTChannel";

export const NETWORK_TYPE = 'network';
export type NETWORK_TYPE = typeof NETWORK_TYPE;

export interface NetworkSystem extends System{
    isOnline(): boolean;

    readonly channel: WTChannel;
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
    trackerCount: number;
    isBuffering: boolean;
    myId: number;
    entityIndex: Map<number, number>;

    isBootstrapDone: boolean;

    _save: false;
    _sync: false;
}

export class CommonNetworkSystem implements NetworkSystem {
    readonly name = NETWORK_TYPE;
    readonly dependencies = [];

    readonly channel: WTChannel;
    private world: World;

    private res: NetworkStatusResource;

    storage = new SingleEcsStorage<NetworkEntityComponent>(NETWORK_ENTITY_TYPE, true, false);

    constructor(world: World, channel: WTChannel) {
        this.channel = channel;
        this.world = world;

        this.world.addStorage(this.storage);

        this.res = {
            type: NETWORK_STATUS_TYPE,
            connectionCount: 0,
            trackerCount: this.channel.discovery.connectedTrackers,
            isBuffering: false,
            entityIndex: new Map<number, number>(),
            _save: false,
            _sync: false,
        } as NetworkStatusResource;

        world.addResource(this.res);

        this.channel.events.on('tracker_connections', trackerCount => {
            this.world.editResource(this.res.type, {
                trackerCount,
            });
        });

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
            this.spawnDeviceEntity(this.res.myId);
            for (let pid of this.channel.connections.keys()) {
                this.spawnDeviceEntity(pid);
            }
        }
    }

    private updateConnectionCount() {
        const connectionCount = this.channel.connections.size;
        this.world.editResource(NETWORK_STATUS_TYPE, { connectionCount });
    }

    private spawnDeviceEntity(peerId: number) {
        const cmd = SpawnCommandKind.from(this.world, [
            {
                type: NETWORK_ENTITY_TYPE,
                networkId: peerId,
                color: Math.floor(Math.random() * 0xFFFFFF),
            } as NetworkEntityComponent
        ]);
        emitCommand(this.world, cmd, true);
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
        // TODO: buffering
        const isBuffering = false; // this.channel.bufferingChannels > 0;
        this.world.editResource(NETWORK_STATUS_TYPE, { isBuffering });
    }

    isOnline(): boolean {
        return this.channel.connections.size !== 0;
    }

    enable(): void {
        let chEvents = this.channel.events;
        chEvents.on('device_join', this.onDeviceJoin, this);
        chEvents.on('device_left', this.onDeviceLeave, this);
        chEvents.on('buffering_update', this.onDeviceBufferUpdate, this);
        //this.channel.events.on('message', x => console.log("RECEIVED: " + JSON.stringify(x)));
    }

    destroy(): void {
        let chEvents = this.channel.events;
        chEvents.off('device_join', this.onDeviceJoin, this);
        chEvents.off('device_left', this.onDeviceLeave, this);
        chEvents.off('buffering_update', this.onDeviceBufferUpdate, this);
    }
}

export const HOST_NETWORK_TYPE = 'host_network';
export type HOST_NETWORK_TYPE = typeof HOST_NETWORK_TYPE;
export class HostNetworkSystem {
    readonly name = HOST_NETWORK_TYPE;
    readonly dependencies = [] as string[];

    readonly world: World;
    private channel: WTChannel;

    constructor(world: World, ch: WTChannel) {
        this.world = world;
        this.channel = ch;

        this.world.events.on('command_share', this.onCommandShare, this);
    }

    // ---------------------------------- EVENT LISTENERS ----------------------------------

    private onDeviceJoin(chId: number): void {
        this.channel.send({
            type: "ecs_bootstrap",
            payload: this.world.serialize({
                requireSync: true,
                stripClient: true,
                resources: true,
            }),
        } as P.EcsBootrstrap, chId);
    }

    private onCommandPacket(pkt: P.CommandPacket, info: PacketInfo) {
        const sender = info.senderId;
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
        this.channel.events.on('device_join', this.onDeviceJoin, this);
        this.channel.packets.on('cmd', this.onCommandPacket, this);
        this.world.editResource(NETWORK_STATUS_TYPE, { isBootstrapDone: true });
    }

    destroy(): void {
        this.channel.events.off('device_join', this.onDeviceJoin, this);
        this.channel.packets.off('cmd', this.onCommandPacket, this);
    }
}

export const CLIENT_NETWORK_TYPE = 'client_network';
export type CLIENT_NETWORK_TYPE = typeof CLIENT_NETWORK_TYPE;
export class ClientNetworkSystem {
    readonly name = CLIENT_NETWORK_TYPE;
    readonly dependencies = [] as string[];

    readonly world: World;
    private channel: WTChannel;

    constructor(ecs: World, channel: WTChannel) {
        this.world = ecs;
        this.channel = channel;
    }

    private onEcsBootstrap(packet: P.EcsBootrstrap, info: PacketInfo): void {
        if (info.senderId !== 0) return; // Only admin

        this.world.clear();
        this.world.deserialize(packet.payload, {});
        this.world.editResource(NETWORK_STATUS_TYPE, { isBootstrapDone: true });
        this.world.events.emit('focus_on_random_party');
    }

    private onCmd(packet: P.CommandPacket, info: PacketInfo): void {
        for (let cmd of packet.data) {
            if (!this.checkCommand(info.senderId, cmd)) continue;
            this.world.events.emit("command_emit", cmd);
        }
    }

    private onDeviceLeave(connId: number): void {
        this.world.editResource(NETWORK_STATUS_TYPE, { isBootstrapDone: false });
    }

    private checkCommand(sender: number, command: Command): boolean {
        if (sender === 0) return true;
        console.warn("Received command from non-admin: ", command);
        return false;
    }

    enable(): void {
        let packets = this.channel.packets;
        packets.on('ecs_bootstrap', this.onEcsBootstrap, this);
        packets.on('cmd', this.onCmd, this);
        let chEvents = this.channel.events;
        chEvents.on('device_left', this.onDeviceLeave, this);
    }

    destroy(): void {
        let packets = this.channel.packets;
        packets.off('ecs_bootstrap', this.onEcsBootstrap, this);
        packets.off('cmd', this.onCmd, this);
        let chEvents = this.channel.events;
        chEvents.off('device_left', this.onDeviceLeave, this);
    }
}
