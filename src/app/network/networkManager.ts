import Peer from "peerjs";
import {P2pConnection} from "./p2pConnection";
import {Channel} from "./channel";
import PIXI from "../PIXI";
import EventEmitter = PIXI.utils.EventEmitter;
import {RtcStatsManager} from "./RtcStatsManager";

export class NetworkManager extends EventEmitter {
    peer: Peer;
    isHost: boolean;
    myId: number = -1;

    channel: Channel;

    // Used if is host:
    connections = new Map<number, PeerJsConnection>();
    nextConnectionId: number = 1;

    // If client:
    hostConnection?: PeerJsConnection;
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
        let c = new PeerJsConnection(this, id, conn);
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
            throw new Error('A host cannot open a connection, for now!');
        }
        if (this.connectId !== undefined) {
            throw new Error('Cannot connect to multiple hosts');
        }
        this.connectId = id;
        if (this.peer.id != null) {
            this.connectReady();
        }
    }

    disconnect(): void {
        this.connectId = undefined;
        this.peer.destroy();
    }

    private connectReady() {
        if (this.connectId === undefined) return;
        let conn = this.peer.connect(this.connectId, {
            reliable: true,
        });

        this.hostConnection = new PeerJsConnection(this, undefined, conn);
    }
}

export class PeerJsConnection implements P2pConnection {
    parent: NetworkManager;
    connection: Peer.DataConnection;

    ondata?: (data: any, conn: P2pConnection) => void;
    channelId: number;

    bootstrap: boolean = false;
    buffered: boolean = false;
    onBufferChange?: (buffered: boolean) => void;

    nextOutId: number = 0;
    nextInId: number = 0;
    reorderBuffer = new Map<number, any>();

    statsManager?: RtcStatsManager;

    constructor(parent: NetworkManager, chId: number | undefined, connection: Peer.DataConnection) {
        this.parent = parent;
        this.channelId = chId || 0;
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
        this.statsManager = new RtcStatsManager(this.connection.peerConnection);
        this.statsManager.onSummary = summary => this.parent.channel.eventEmitter.emit('report', this, summary);
        //this.connection.peerConnection.addEventListener('iceconnectionstatechange', x => console.log("peer_conn_state_change", this.connection.peerConnection.connectionState));

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
        }
        const id = data[0];
        const pkt = data[1];

        if (id === this.nextInId) {
            this.nextInId += 1;
            this.forwardPacket(pkt);
            while (true) {
                const pkt = this.reorderBuffer.get(this.nextInId);
                if (pkt === undefined) break;
                this.reorderBuffer.delete(this.nextInId);
                this.nextInId++;
                this.forwardPacket(pkt);
            }
        } else if (id > this.nextInId) {
            this.reorderBuffer.set(id, pkt);
        } else {
            console.warn('Received packet back in time?')
        }
    }

    private forwardPacket(pkt: any) {
        // console.log("RECEIVED " + JSON.stringify(pkt));
        if (this.ondata !== undefined) {
            try {
                this.ondata(pkt, this);
            } catch (e) {
                console.error("Error processing packet", e);
            }
        }
    }

    onClose() {
        this.parent.channel.removeConnection(this);
    }

    send(data: any): void {
        // console.log("SEND " + JSON.stringify(data));
        this.connection.send([this.nextOutId++, data]);
        this.updateBuffered();
    }

    bufferedBytes() {
        return this.connection.dataChannel.bufferedAmount;
    }

    private updateBuffered() {
        let oldBuffered = this.buffered;
        let bufferedAmount = this.connection.bufferSize;
        if (this.connection.dataChannel != null) {
            bufferedAmount += this.connection.dataChannel.bufferedAmount;
        }
        this.buffered = bufferedAmount !== 0;
        if (oldBuffered !== this.buffered && this.onBufferChange !== undefined) {
            this.onBufferChange(this.buffered);
        }
    }

    getHandle(): RTCPeerConnection | undefined {
        return this.connection.peerConnection;
    }

    getStatsReporter(): RtcStatsManager | undefined {
        return this.statsManager;
    }
}
