import {System} from "../../System";
import {World} from "../../World";
import * as P from "../../../protocol/game";
import {Command, emitCommand} from "../command/command";
import {Resource} from "../../resource";
import {Component, SharedFlag, SHARED_TYPE} from "../../component";
import {SingleEcsStorage} from "../../Storage";
import {SpawnCommand, SpawnCommandKind} from "../command/spawnCommand";
import {DeSpawnCommand} from "../command/despawnCommand";
import { PacketInfo, WTChannel } from "../../../network/Channel";
import { PeerConnector } from "@/network/discovery/PeerConnector";
import { RoomRenamePromiseResult, ServerSignaler, SignalerError } from "@/network/discovery/ServerSignaler";
import { NetworkIdentity } from "@/network/Identity";
import { getLogger } from "./log/LogSystem";
import { Logger } from "./log/Logger";
import { DECLARATIVE_LISTENER_TYPE } from "./DeclarativeListenerSystem";
import { TOOL_TYPE } from "./ToolSystem";
import { ToolType } from "@/ecs/tools/toolType";
import { StandardToolbarOrder } from "@/phase/editMap/standardToolbarOrder";
import DiscoveryOptions from "@/ui/edit/settings/DiscoveryOptions.vue";
import { VueComponent } from "@/ui/vue";

export const NETWORK_TYPE = 'network';
export type NETWORK_TYPE = typeof NETWORK_TYPE;

export interface NetworkSystem extends System {
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

export type DiscoveryStatus = 'starting' | 'connecting' | 'joining' | 'creating' | 'in_room' | 'on_hold' | 'wrong_password' | 'wrong_name' | 'name_occupied';


export const NETWORK_STATUS_TYPE = 'network_status';
export type NETWORK_STATUS_TYPE = typeof NETWORK_STATUS_TYPE;
export interface NetworkStatusResource extends Resource {
    type: NETWORK_STATUS_TYPE;
    connectionCount: number;
    signalerConnected: boolean;
    isBuffering: boolean;
    myId: number;
    entityIndex: Map<number, number>;

    discoveryStatus: DiscoveryStatus;
    statusDescription: string;
    gameStatus: 'waiting' | 'downloading' | 'playing';

    currentRoom: string;

    _save: false;
    _sync: false;
}

export const DISCOVERY_CONFIG_TYPE = 'disvocery_config';
export type DISCOVERY_CONFIG_TYPE = typeof DISCOVERY_CONFIG_TYPE;
export interface DiscoveryConfigResource extends Resource {
    type: DISCOVERY_CONFIG_TYPE,

    // Room name to request to the server, when empty one is generated according to the user identity
    room: string,
    password: string,
    hint: string,

    _save: true,
    _sync: true,
}


const RTC_CONFIGURATION: RTCConfiguration = {
};



export class CommonNetworkSystem implements NetworkSystem {
    readonly name = NETWORK_TYPE;
    readonly dependencies = [DECLARATIVE_LISTENER_TYPE];
    readonly components?: [NetworkEntityComponent];
    readonly resources?: [DiscoveryConfigResource, NetworkStatusResource];

    readonly channel: WTChannel;
    readonly signaler: ServerSignaler;
    readonly connector: PeerConnector;

    private readonly world: World;
    private readonly logger: Logger;

    private readonly networkStatus: NetworkStatusResource;
    private readonly discoveryConfig: DiscoveryConfigResource;

    readonly storage = new SingleEcsStorage<NetworkEntityComponent>(NETWORK_ENTITY_TYPE, true, false);


    constructor(world: World, roomName: string | undefined) {
        this.signaler = new ServerSignaler(new NetworkIdentity(), 'leader');
        this.connector = new PeerConnector(this.signaler, RTC_CONFIGURATION);
        this.channel = new WTChannel(this.connector, this.signaler);

        this.world = world;
        this.logger = getLogger(world, 'network.common');

        this.world.addStorage(this.storage);

        this.networkStatus = {
            type: NETWORK_STATUS_TYPE,
            connectionCount: 0,
            signalerConnected: this.signaler.isConnected,
            isBuffering: false,
            entityIndex: new Map<number, number>(),
            discoveryStatus: 'starting',
            gameStatus: 'waiting',

            currentRoom: "",

            _save: false,
            _sync: false,
        } as NetworkStatusResource;

        world.addResource(this.networkStatus);

        this.discoveryConfig = {
            type: DISCOVERY_CONFIG_TYPE,
            room: "",
            password: "",
            hint: "",
            _save: true,
            _sync: true,
        } as DiscoveryConfigResource;

        world.addResource(this.discoveryConfig);

        this.signaler.events.on('connect', () => {
            this.world.editResource(this.networkStatus.type, {
                signalerConnected: true,
            });
        });
        this.signaler.events.on('disconnect', () => {
            this.world.editResource(this.networkStatus.type, {
                signalerConnected: false,
                discoveryStatus: 'connecting',
                statusDescription: 'Signaler connection failed'
            });
        });
        this.signaler.events.on('room_renamed', (name) => {
            this.world.editResource(NETWORK_STATUS_TYPE, {
                currentRoom: name,
            });
        });

        const decl = world.requireSystem(DECLARATIVE_LISTENER_TYPE);

        decl.onComponent(NETWORK_ENTITY_TYPE, '', (cold, cnew) => {
            if (cold === undefined) {
                this.networkStatus.entityIndex.set(cnew!.networkId, cnew!.entity);
            } else if (cnew === undefined) {
                this.networkStatus.entityIndex.delete(cold.networkId);
            }
        });

        world.events.on('populate', this.onPopulate, this);

        if (world.isMaster) {
            world.addSystem(new HostNetworkSystem(world, this));
        } else {
            if (roomName === undefined) {
                throw new Error("Initialized non-master CommonNetworkSystem without room name");
            }
            world.addSystem(new ClientNetworkSystem(world, this, roomName));
        }
    }

    private onPopulate() {
        this.networkStatus.myId = this.channel.myId;

        if (this.world.isMaster) {
            this.spawnDeviceEntity(this.networkStatus.myId);
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
                type: SHARED_TYPE,
            } as SharedFlag,
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
            const eid = this.networkStatus.entityIndex.get(connId);
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

        this.signaler.stop();
        this.channel.destroy();
    }
}

export const HOST_NETWORK_TYPE = 'host_network';
export type HOST_NETWORK_TYPE = typeof HOST_NETWORK_TYPE;
export class HostNetworkSystem {
    readonly name = HOST_NETWORK_TYPE;
    readonly dependencies = [];

    readonly world: World;
    readonly logger: Logger;
    private readonly parent: CommonNetworkSystem;


    constructor(world: World, ch: CommonNetworkSystem) {
        this.world = world;
        this.logger = getLogger(world, 'network.host');
        this.parent = ch;

        this.world.events.on('command_share', this.onCommandShare, this);

        const configRes = this.world.getResource(DISCOVERY_CONFIG_TYPE)!;

        const decl = world.requireSystem(DECLARATIVE_LISTENER_TYPE);
        decl.onResource(DISCOVERY_CONFIG_TYPE, `room`, async (oldRoom, newRoom) => {
            if (oldRoom == newRoom) return;

            const statusRes = this.world.getResource(NETWORK_STATUS_TYPE)!;
            if (statusRes.discoveryStatus == 'wrong_name' || statusRes.discoveryStatus == 'name_occupied') {
                this.tryCreateRoom();
            }
        });

        this.parent.signaler.events.on('handshake', () => {
            this.tryCreateRoom();
        });
    }

    async tryRename(newName: string): Promise<RoomRenamePromiseResult> {
        const res = await this.parent.signaler.renameRoom(newName);
        if (res === 'ok') {
            this.world.editResource(DISCOVERY_CONFIG_TYPE, {
                room: newName,
            })
        }
        return res;
    }

    async tryEditPassword(password: string, hint: string): Promise<void> {
        await this.parent.signaler.editPassword(password, hint);
        this.world.editResource(DISCOVERY_CONFIG_TYPE, {
            password,
            hint
        });
    }

    async tryCreateRoom() {
        this.logger.trace('tryCreateRoom');

        const statusRes = this.world.getResource(NETWORK_STATUS_TYPE)!;
        const configRes = this.world.getResource(DISCOVERY_CONFIG_TYPE)!;
        const ALLOWED_STATES = ['connecting', 'wrong_name', 'name_occupied']
        if (!ALLOWED_STATES.includes(statusRes.discoveryStatus)) {
            this.logger.warning('called tryCreateRoom in wrong state: ', statusRes.discoveryStatus);
            return;
        }

        this.world.editResource(statusRes.type, {
            discoveryStatus: 'creating',
            statusDescription: '',
        });
        let answer = 'success';
        let name = '';
        try {
            const res = await this.parent.signaler.createRoom(configRes.room, configRes.password, configRes.hint);
            name = res.name;
        } catch (e) {
            if (e instanceof SignalerError) {
                this.logger.info("Error", e.cause);
                switch (e.cause) {
                    case 'room_has_leader':
                    case 'invalid_room_name':
                        answer = e.cause;
                        break;
                    default:
                        throw e;
                }
            } else {
                throw e;
            }
        }
        this.logger.trace('| answer: ', answer, name);
        let status: DiscoveryStatus;
        switch (answer) {
            case 'success':
                this.world.editResource(NETWORK_STATUS_TYPE, {
                    currentRoom: name,
                });
                status = "in_room";
                break;
            case "room_has_leader":
                status = "name_occupied";
                break;
            case "invalid_room_name":
                status = "wrong_name";
                break;
            default:
                throw new Error('unreachable');
        }

        this.world.editResource(NETWORK_STATUS_TYPE, {
            discoveryStatus: status,
        });
    }

    // ---------------------------------- EVENT LISTENERS ----------------------------------

    private onDeviceJoin(chId: number): void {
        this.parent.channel.send({
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
        this.parent.channel.broadcast({
            type: 'cmd',
            data: command,
        } as P.CommandPacket);
    }

    enable(): void {
        this.parent.channel.events.on('device_join', this.onDeviceJoin, this);
        this.parent.channel.packets.on('cmd', this.onCommandPacket, this);
        this.world.editResource(NETWORK_STATUS_TYPE, {
            discoveryStatus: 'connecting',
            gameStatus: 'playing',
        });

        const toolSys = this.world.requireSystem(TOOL_TYPE);
        toolSys.addToolAsCopy(ToolType.DISCOVERY, ToolType.INSPECT, {
            sideBar: DiscoveryOptions,
            sideBarProps: {},
            toolbarEntry: {
                icon: 'fas fa-users',
                title: 'Edit discovery',
                priority: StandardToolbarOrder.DISCOVERY,
            },
        });
    }

    destroy(): void {
        this.parent.channel.events.off('device_join', this.onDeviceJoin, this);
        this.parent.channel.packets.off('cmd', this.onCommandPacket, this);
    }
}

export const CLIENT_NETWORK_TYPE = 'client_network';
export type CLIENT_NETWORK_TYPE = typeof CLIENT_NETWORK_TYPE;
export class ClientNetworkSystem {
    readonly name = CLIENT_NETWORK_TYPE;
    readonly dependencies = [] as string[];

    readonly world: World;
    private readonly logger: Logger;
    private readonly parent: CommonNetworkSystem;

    constructor(world: World, parent: CommonNetworkSystem, roomId: string) {
        this.world = world;
        this.parent = parent;
        this.logger = getLogger(world, 'network.client');

        this.world.editResource(NETWORK_STATUS_TYPE, {
            currentRoom: roomId,
        });

        const declarativeSys = world.requireSystem(DECLARATIVE_LISTENER_TYPE);
        declarativeSys.onResource(DISCOVERY_CONFIG_TYPE, `password`, (oldPassword, newPassword) => {
            if (oldPassword == newPassword) return;

            const statusRes = this.world.getResource(NETWORK_STATUS_TYPE)!;
            if (statusRes.discoveryStatus == 'wrong_password') {
                this.logger.info("Password changed, rejoining");
                this.tryJoinRoom();
            }
        });

        this.parent.signaler.events.on('handshake', async () => {
            this.logger.info("Handshake performed, joining");
            this.tryJoinRoom();
        });
        this.parent.signaler.events.on('room_destroyed', async () => {
            this.world.editResource(NETWORK_STATUS_TYPE, {
                discoveryStatus: 'connecting',
                statusDescription: 'Room destroyed',
            });
            this.logger.info("Room destroyed, rejoining");
            this.tryJoinRoom();
        });
    }

    async tryJoinRoom() {
        const statusRes = this.world.getResource(NETWORK_STATUS_TYPE)!;
        const configRes = this.world.getResource(DISCOVERY_CONFIG_TYPE)!;
        const ALLOWED_STATES = ['connecting', 'wrong_password']
        if (!ALLOWED_STATES.includes(statusRes.discoveryStatus)) {
            this.logger.warning('called tryJoinRoom in wrong state', statusRes.discoveryStatus);
            return;
        }
        this.logger.trace('tryJoinRoom');

        while(true) {
            this.logger.trace('trying...', statusRes.currentRoom);
            this.world.editResource(statusRes.type, {
                discoveryStatus: 'joining',
                statusDescription: '',
            });
            const res = await this.parent.signaler.joinRoom(statusRes.currentRoom, configRes.password);
            this.logger.trace('| answer:', res);
            switch (res.type) {
                case 'on_hold':
                    this.world.editResource(NETWORK_STATUS_TYPE, {
                        discoveryStatus: 'on_hold',
                    });
                    await res.next;
                    break;// break switch, not return!
                case "joined":
                    this.world.editResource(NETWORK_STATUS_TYPE, {
                        discoveryStatus: 'in_room',
                        gameStatus: 'downloading',
                    });
                    return;
                case "wrong_password":
                    this.world.editResource(NETWORK_STATUS_TYPE, {
                        discoveryStatus: 'wrong_password',
                        statusDescription: 'Hint: ' + res.hint,
                    });
                    return;
            }
        }
    }

    private onEcsBootstrap(packet: P.EcsBootrstrap, info: PacketInfo): void {
        if (info.senderId !== 0) return; // Only admin

        this.world.clear();
        this.world.deserialize(packet.payload, {
            addShare: true,
        });
        this.world.editResource(NETWORK_STATUS_TYPE, { gameStatus: "playing" });
        this.world.events.emit('focus_on_random_party');
    }

    private onCmd(packet: P.CommandPacket, info: PacketInfo): void {
        for (let cmd of packet.data) {
            if (!this.checkCommand(info.senderId, cmd)) continue;
            if (cmd.kind === 'spawn') {
                (cmd as SpawnCommand).addShare = true;
            }
            this.world.events.emit("command_emit", cmd);
        }
    }

    private onDeviceLeave(connId: number): void {
        this.world.editResource(NETWORK_STATUS_TYPE, { discoveryStatus: "connecting" });
        // TODO: try reconnecting to master?
    }

    private checkCommand(sender: number, command: Command): boolean {
        if (sender === 0) return true;
        console.warn("Received command from non-admin: ", command);
        return false;
    }

    enable(): void {
        let packets = this.parent.channel.packets;
        packets.on('ecs_bootstrap', this.onEcsBootstrap, this);
        packets.on('cmd', this.onCmd, this);
        let chEvents = this.parent.channel.events;
        chEvents.on('device_left', this.onDeviceLeave, this);
        this.world.editResource(NETWORK_STATUS_TYPE, { discoveryStatus: "connecting" });
    }

    destroy(): void {
        let packets = this.parent.channel.packets;
        packets.off('ecs_bootstrap', this.onEcsBootstrap, this);
        packets.off('cmd', this.onCmd, this);
        let chEvents = this.parent.channel.events;
        chEvents.off('device_left', this.onDeviceLeave, this);
    }
}
