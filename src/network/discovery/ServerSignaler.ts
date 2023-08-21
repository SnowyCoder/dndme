import { NetworkIdentity } from "../Identity";
import { Logger, getLogger } from "@/ecs/systems/back/log/Logger";
import { decode, encode } from "@msgpack/msgpack";
import { ClientId, ClientInbound, MessageC2S, MessageS2C, ProtocolError, ServerEvent } from "./Protocol";
import { EventEmitter } from "eventemitter3";

const DNDME_SIGNALING_VERSION: bigint = BigInt(0);
const URL: string = import.meta.env.VITE_DISCOVERY_URL;
const MAXIMUM_BACKOFF_TIME = 10 * 60 * 1000;// 10 mins.

export type DiscoveryStatus = 'no_room' | 'in_room' | 'creating_room' | 'joining_room' | 'on_hold' | 'leaving_room' | 'reconnecting' | 'destroyed';

export enum DisconnectReason {
    WrongVersion = 0,
    WrongProtocol,
    CleanClose,

    SocketFail = 0x100,
    ProtocolError,
}

export type SignalerDiscoveryEventTypes = {
    'connect': [],
    'handshake': [],
    'disconnect': [DisconnectReason],
    'room_joined': [ClientId, ClientId[]],
    'room_created': [string],
    'room_password_wrong': [string],
    'room_has_leader': [],
    'user_join': [ClientId],
    'user_leave': [ClientId],
    'room_on_hold': [],
    'room_present': [],// sent when a player is no more on_hold.
    'room_destroyed': [],
    'room_left': [],
    'room_renamed': [string],
    'room_rename_name_taken': [],
    'room_rename_name_invalid': [],
    'user_message': [ClientId, ArrayBuffer],
};

export type RoomJoinPromiseResult = {
    type: 'joined',
    master: ClientId,
    others: ClientId[],
} | {
    type: 'on_hold',
    next: Promise<void>,
} | {
    type: 'wrong_password',
    hint: string,
};

export type SignalerNetowkring = 'leader' | 'mesh';

export type RoomRenamePromiseResult = 'ok' | 'name_already_taken' | 'invalid_name';

export class SignalerError extends Error {
    cause: ProtocolError;
    constructor(message: string, cause: ProtocolError) {
        super(message);
        this.cause = cause;
        this.name = 'SignalerError';
    }
}

export class ChannelClosedError extends Error {
    reason: DisconnectReason;
    constructor(reason: DisconnectReason) {
        super("Channel closed for reason: " + reason);
        this.reason = reason;
        this.name = 'ChannelClosedError';
    }
}

export class ServerSignaler {
    private readonly identity: NetworkIdentity;
    private readonly logger: Logger;

    readonly networking: SignalerNetowkring;

    readonly events = new EventEmitter<SignalerDiscoveryEventTypes>();
    isConnected: boolean = false;

    private socket!: WebSocket;

    private status: DiscoveryStatus = 'no_room';
    private requestCallbacks: Array<[(pkt: MessageS2C) => void, (reason: Error) => void]> = [];
    private onHoldCallback?: [() => void, (reason: Error) => void];

    private lastWaitTime = 0;
    private backoffTimeout: any;

    constructor(identity: NetworkIdentity, networking: SignalerNetowkring) {
        this.identity = identity;
        this.logger = getLogger("network.signaler");
        this.networking = networking;

        this.logger.info("Connecting to", URL);
        this.tryOpen();
    }

    private tryOpen() {
        try {
            this.socket = new WebSocket(URL, "dndme-hermes");
        } catch(e) {
            this.logger.error("Error while opening socket", e);
            this.destroy(DisconnectReason.SocketFail);
            return;
        }

        this.socket.binaryType = "arraybuffer";
        this.socket.onclose = this.onClose.bind(this);
        this.socket.onerror = this.onError.bind(this);
        this.socket.onmessage = this.onMessageHandshake.bind(this);
        this.socket.onopen = this.onOpen.bind(this);
        // Useful for debugging
        /*(window as any).severeConnections = () => {
            this.socket.close();
        }*/
    }

    private reopenStrategy() {
        this.status = 'reconnecting';

        if (this.lastWaitTime == 0) {
            this.lastWaitTime = 1;
        } else {
            this.lastWaitTime = this.lastWaitTime * 2;
        }
        const randomSecs = Math.random();
        const sleepTimeMillis = Math.min((this.lastWaitTime + randomSecs) * 1000, MAXIMUM_BACKOFF_TIME);
        this.logger.debug('Sleeping for', sleepTimeMillis, this.lastWaitTime);

        if (this.backoffTimeout !== undefined) clearTimeout(this.backoffTimeout);
        this.backoffTimeout = setTimeout(() => {
            this.backoffTimeout = undefined;
            this.tryOpen();
        }, sleepTimeMillis);
    }

    stop() {
        this.destroy(DisconnectReason.CleanClose);
    }

    private destroy(reason: DisconnectReason) {
        if (this.status === 'destroyed') return;
        this.status = 'destroyed';
        this.socket.close();
        this.events.emit('disconnect', reason);

        const proms = this.requestCallbacks;
        this.requestCallbacks = [];
        if (this.onHoldCallback != undefined) {
            proms.push(this.onHoldCallback);
            this.onHoldCallback = undefined;
        }
        for (let prom of proms) {
            prom[1](new ChannelClosedError(reason));
        }

        if (reason == DisconnectReason.SocketFail) {
            this.reopenStrategy();
        }
    }

    private onOpen(): void {
        this.logger.info('Open');
        this.lastWaitTime = 0;
        this.isConnected = true;
        this.status = 'no_room';
        this.events.emit('connect');
    }

    private onClose(ev: CloseEvent): void {
        const c = ev.code;
        this.isConnected = false;
        if (this.status == 'destroyed') return;// Disconnect was requested by us.

        this.logger.info(`Closed, reason: ${ev.reason} code: ${ev.code}`);
        if (c == 1000) { // Normal closure
            this.destroy(DisconnectReason.CleanClose);
        } else {
            // Other reasons:
            // - 1001: going away (server is closing or user is navigating away)
            // - 1002: protocol error
            // - 1003: invalid data
            // They all could mean that we can reattempt to open a connection
            this.destroy(DisconnectReason.SocketFail);
        }
    }

    private onError(): void {
        this.isConnected = false;
        this.logger.error(`Socket Error`);
    }

    private async onMessageHandshake(ev: MessageEvent<ArrayBuffer>): Promise<void> {
        let dv = new DataView(ev.data);
        this.logger.debug('Handshake! data', ev.data);

        const version = dv.getBigUint64(0, true);
        this.logger.debug('| version: ', version);

        if (version != DNDME_SIGNALING_VERSION) {
            this.logger.error(`Expected signaler version ${DNDME_SIGNALING_VERSION} but found version ${version}`);
            this.destroy(DisconnectReason.WrongVersion);
            return;
        }

        const proofRequest = new Uint8Array(ev.data, 64 / 8);

        const key = await this.identity.exportPubKey();
        const proof = await this.identity.sign(proofRequest);
        const data = {
            identity: new Uint8Array(key),
            proof: new Uint8Array(proof),
        };
        this.logger.debug('| request: ', proofRequest);
        this.logger.debug('| proof: ', data);
        const rawData = encode(data);
        this.logger.debug('| sending: ', rawData);
        this.socket.onmessage = this.onPacket.bind(this);
        this.socket.send(rawData);

        this.events.emit('handshake');
    }

    private sendPacket(msg: MessageC2S): void {
        if (!this.isConnected) throw new Error("Channel is closed");
        if (this.status === 'destroyed') return;
        this.logger.trace('Send: ', msg);

        let data = encode(msg);
        this.socket.send(data);
    }

    private onEvent(msg: ServerEvent): void {
        // Yes, it's just a big ass state machine
        this.logger.trace('event', msg);
        let isUsed = false;
        switch (this.status) {
            case 'in_room':
                isUsed = true;
                switch (msg.type) {
                    case 'message':
                        this.events.emit('user_message', msg.from, msg.data);
                        break;
                    case 'room_destroyed':
                        this.status = 'no_room';
                        this.events.emit('room_destroyed');
                        break;
                    case 'room_renamed':
                        this.events.emit('room_renamed', msg.name)
                        break;
                    case 'user_join':
                        this.events.emit('user_join', msg.id);
                        break;
                    case 'user_leave':
                        this.events.emit('user_leave', msg.id);
                        break;
                    default:
                        isUsed = false;
                }
                break;
            case 'on_hold':
                if (msg.type === 'room_present') {
                    isUsed = true;
                    this.status = 'no_room';

                    this.onHoldCallback?.[0]();
                    this.onHoldCallback = undefined;

                    this.events.emit('room_present');
                }
                break;
            case 'leaving_room':
                switch (msg.type) {
                    // We're leaving, we don't care
                    case 'room_destroyed':
                    case 'message':
                    case 'user_join':
                    case 'user_leave':
                    case 'room_renamed':
                        isUsed = true;
                        break;
                }
                break;
            default:
                this.logger.error("Invalid status!", this.status);
        }

        if (!isUsed) {
            this.logger.error("Unused message received: ", msg);
        }
    }

    private onPacket(ev: MessageEvent<ArrayBuffer>): void {
        if (this.status === 'destroyed') return;

        let msg;
        try {
            msg = decode(ev.data, {
                maxStrLength: 512,
                maxBinLength: 1024 * 16,
            }) as ClientInbound;
        } catch (e: any) {
            this.logger.error('Wrong packet received', ev.data, e);
            this.destroy(DisconnectReason.ProtocolError);
            return;
        }
        this.logger.trace('Packet: ', msg);

        if (msg.kind == 'message') {
            const [resolve, _reject] = this.requestCallbacks.splice(0, 1)[0]
            resolve(msg);
        } else {
            this.onEvent(msg);
        }
    }

    private requestRaw(msg: MessageC2S): Promise<MessageS2C> {
        return new Promise((resolve, reject) => {
            this.requestCallbacks.push([resolve, reject]);
            this.sendPacket(msg);
        });
    }

    private handleRequestError(msg: MessageS2C) {
        if (msg.type === 'error') {
            throw new SignalerError('Protocol error:' + msg.reason, msg.reason);
        }
    }

    private async request(msg: MessageC2S): Promise<MessageS2C> {
        const res = await this.requestRaw(msg);
        this.handleRequestError(res);
        return res;
    }

    private unhandledPacketType(res: MessageS2C): never {
        throw new Error("Unhandled packet type returned: " + res.type);
    }

    async joinRoom(room: string, password: string): Promise<RoomJoinPromiseResult> {
        if (this.status !== 'no_room') throw new Error("Wrong room state " + this.status);
        this.status = 'joining_room';

        const msg = await this.requestRaw({
            type: 'join_room',
            room,
            password,
            net: this.networking,
        })

        if (msg.type === 'room_on_hold') {
            this.status = 'on_hold';
            this.events.emit('room_on_hold');

            const onHoldFinish: Promise<void> = new Promise((resolve, reject) => {
                this.onHoldCallback = [resolve, reject];
            });

            return {
                type: 'on_hold',
                next: onHoldFinish,
            };
        } else if (msg.type === 'room_joined') {
            this.status = 'in_room';
            this.events.emit('room_joined', msg.master, msg.others);
            return {
                type: 'joined',
                master: msg.master,
                others: msg.others,
            }
        } else if (msg.type === 'error') {
            this.status = 'no_room';
            if (msg.reason === 'room_password_wrong') {
                this.events.emit('room_password_wrong', msg.hint ?? '');
                return {
                    type: 'wrong_password',
                    hint: msg.hint ?? '',
                }
            } else {
                this.handleRequestError(msg);
                return undefined as any;
            }
        } else {
            this.unhandledPacketType(msg);
        }
    }

    async createRoom(name: string | undefined, password: string, password_hint: string) {
        if (this.status !== 'no_room') throw new Error("Wrong room state " + this.status);
        this.status = 'creating_room';


        const res = await this.request({
            type: 'create_room',
            name,
            password,
            password_hint,
        });

        if (res.type === 'room_created') {
            this.status = 'in_room';
            this.events.emit('room_created', res.name);
            return {
                name: res.name,
            }
        } else {
            this.unhandledPacketType(res);
        }
    }

    async renameRoom(name: string | undefined): Promise<RoomRenamePromiseResult> {
        if (this.status !== 'in_room') throw new Error("Wrong room state " + this.status);

        const res = await this.requestRaw({
            type: 'rename_room',
            name,
        });

        if (res.type === 'success') return 'ok';
        if (res.type === 'error' && res.reason === 'invalid_room_name') return 'invalid_name';
        if (res.type === 'error' && res.reason === 'rename_room_name_taken') return 'name_already_taken';
        this.handleRequestError(res);
        this.unhandledPacketType(res);
    }

    async editPassword(password: string, password_hint: string) {
        if (this.status !== 'in_room') throw new Error("Wrong room state " + this.status);

        const res = await this.request({
            type: 'edit_password',
            password,
            password_hint,
        });
        if (res.type != 'success') {
            this.unhandledPacketType(res);
        }
    }

    async leaveRoom(): Promise<void> {
        this.status = 'leaving_room';

        const res = await this.request({
            type: 'leave_room',
        });

        if (res.type !== 'success') {
            this.unhandledPacketType(res);
        }
    }

    sendMessage(to: ClientId, data: ArrayBuffer): void {
        this.request({
            type: 'message',
            to,
            data,
        });
    }

    getStatus(): DiscoveryStatus {
        return this.status;
    }
}
