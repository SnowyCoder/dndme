import Peer from "peerjs";
import {P2pConnection} from "./p2pConnection";
import {Channel} from "./channel";
import PIXI from "../PIXI";
import EventEmitter = PIXI.utils.EventEmitter;

export class NetworkManager extends EventEmitter {
    peer: Peer;
    isHost: boolean;
    myId: number = -1;

    channel: Channel;

    // If is host:
    connections?: Map<number, NetworkConnection>;
    nextConnectionId: number = 1;

    // If client:
    hostConnection?: NetworkConnection;
    connectId?: string;


    constructor(isHost: boolean) {
        super();
        this.isHost = isHost;
        this.channel = new Channel(isHost);
        this.peer = new Peer(undefined, {
            host: 'peerjs.92k.de',
            secure: true,
            debug: 2
        });

        if (this.isHost) {
            this.myId = 0;
            this.connections = new Map();
        }

        this.peer.on('connection', this.onConnection.bind(this));
        this.peer.on('open', this.onPeerConnectionOpen.bind(this));
        this.peer.on('error', this.onPeerConnectionError.bind(this))
    }

    onConnection(conn: Peer.DataConnection) {
        let id = 0;
        if (this.isHost) {
            id = this.nextConnectionId++;
        }
        let c = new NetworkConnection(this, id, conn);
        if (this.isHost) {
            this.connections.set(id, c);
        } else {
            this.hostConnection = c;
        }
    }

    onPeerConnectionOpen() {
        if (this.connectId !== undefined) {
            this.connectReady();
        }

        this.emit('ready');
    }

    onPeerConnectionError(err: any) {
        this.emit('error', err);
    }

    getId(): string {
        return this.peer.id;
    }

    connectTo(id: string) {
        if (this.isHost) {
            throw 'A host cannot open a connection, for now!';
        }
        if (this.connectId !== undefined) {
            throw 'Cannot connect to multiple hosts'
        }
        this.connectId = id;
        if (this.peer.id != null) {
            this.connectReady();
        }
    }

    private connectReady() {
        let conn = this.peer.connect(this.connectId, {
            reliable: true,
        });

        this.hostConnection = new NetworkConnection(this, undefined, conn);
    }
}

export class NetworkConnection implements P2pConnection {
    parent: NetworkManager;
    connection: Peer.DataConnection;

    ondata?: (data: any, conn: P2pConnection) => void;
    channelId: number;
    nextPacketId: number;

    bootstrap: boolean = false;
    buffered: boolean = false;
    onBufferChange?: (buffered: boolean) => void;

    constructor(parent: NetworkManager, chId: number | undefined, connection: Peer.DataConnection) {
        this.parent = parent;
        this.channelId = chId;
        this.connection = connection;
        if (parent.isHost) {
            this.bootstrap = true;
        }

        connection.on('open', this.onOpen.bind(this));
        connection.on('data', this.onData.bind(this));
        connection.on('close', this.onClose.bind(this));
    }

    onOpen() {
        this.connection.dataChannel.onbufferedamountlow = this.updateBuffered.bind(this);
        if (this.parent.isHost) {
            this.connection.send(this.channelId);
            this.parent.channel.registerNewConnection(this);
        }
    }

    onData(data: any) {
        if (!this.bootstrap) {
            this.parent.myId = data as number;
            this.parent.channel.myId = data as number;
            this.bootstrap = true;
            this.parent.channel.registerNewConnection(this);
            return;
        } else if (this.ondata !== undefined) {
            this.ondata(data, this);
        }
    }

    onClose() {
        this.parent.channel.removeConnection(this);
    }

    send(data: any): void {
        this.connection.send(data);
        this.updateBuffered();
    }

    bufferedBytes() {
        return this.connection.dataChannel.bufferedAmount;
    }

    private updateBuffered() {
        let oldBuffered = this.buffered;
        this.buffered = (this.connection.bufferSize + this.connection.dataChannel.bufferedAmount) !== 0;
        if (oldBuffered !== this.buffered && this.onBufferChange !== undefined) {
            this.onBufferChange(this.buffered);
        }
    }
}

