import {randombytes} from "../../util/jsobj";
import { Buffer } from "buffer";
import SafeEventEmitter from '../../util/safeEventEmitter';
import { WrtcConnection, WrtcConnectionConfig } from "../channel/WrtcConnection";

interface Offer {
    offer: any;
    offer_id: string;
}

interface AnnounceResponse {
    info_hash: string;
    peer_id?: string;
    'failure reason'?: string;
    'warning message'?: string;
    interval?: number;
    'min interval'?: number;
    'tracker id'?: string;
    complete: any;
    offers: Array<Offer>;
    offer: any;
    offer_id: string;
    trackerId: any;
    answer: any;
}

export interface OfferFilterData {
    peerId: string;
    offer: any;
    // set this to false to decline the offer
    continue: boolean;
}

export interface PeerEventData {
    peerId: string;
    peer: WrtcConnection;
}

export interface AnnounceOptions {
    numwant?: number;
    event?: 'started' | 'stopped' | 'completed' | 'update';
}

interface ConnectingPeer {
    peer?: WrtcConnection;
    offerTimeout?: any;
}

export interface TrackerConfig {
    peerIdBinary: string;
    infoHashBinary: string;
    defAnnounceOptions: AnnounceOptions;
    offerData: any;
    peerOptions?: WrtcConnectionConfig;
}

const RECONNECT_MINIMUM = 5 * 1000;
const RECONNECT_MAXIMUM = 10 * 60 * 1000;
const RECONNECT_VARIANCE = 10 * 1000;
const OFFER_TIMEOUT = 30 * 1000;

/*
 * Protocol: 3-way handshake
 * originally there was only a 2-way handshake:
 * client A ---offer --> client B (offer = WebRTC offer)
 * client A <--answer--- client B (answer = WebRTC answer)
 * connection established
 *
 * but after the offer the client might not continue the answer,
 * maybe because it's already connected or because it's searching someone else.
 * So the WebRTC offer will be wasted (and that's a bit of waste in resource).
 *
 * To mitigate this we'll make the actual offer only after we're sure that the
 * client will receive it.
 * A ---offer --> B  (offer = custom data)
 * A <--answer--- B  (answer=WebRTC offer)
 * A ---answer--> B  (answer=WebRTC response)
 *
 * The server does not store any data regarding offers/answers so this is compatible.
 * About the cross-client compatibility: we don't have work with real webtorrent clients.
 *
 */

export class WebTorrentTracker {
    readonly config: TrackerConfig;
    events: SafeEventEmitter;
    isConnected: boolean = false;

    announceUrl: string;
    socket?: WebSocket;
    destroyed: boolean = false;

    expectingResponse: boolean = false;

    private reconnecting = false;
    private reconnectRetries = 0;
    private reconnectTimer: any = null;

    trackerId: any;
    private interval: any;
    private connectingPeers: {[id: string]: ConnectingPeer};

    constructor(announceUrl: string, config: TrackerConfig) {
        this.config = config;
        this.announceUrl = announceUrl;
        this.connectingPeers = {};
        this.events = new SafeEventEmitter();
    }

    start(): void {
        if (this.socket !== undefined) {
            throw new Error("Already started");
        }
        this.openSocket();
    }

    setInterval(intervalMs: number | undefined): void {
        if (intervalMs == null) intervalMs = 30 * 1000 // 30 seconds

        clearInterval(this.interval)

        if (intervalMs) {
            this.interval = setInterval(() => {
                this.announce()
            }, intervalMs);
        }
    }

    async stop(): Promise<void> {
        this.announce({ event: 'stopped' });
        await this.destroy();
    }

    destroy(): Promise<void> {
        return new Promise(resolve => {
            if (this.destroyed) return resolve();

            if (this.isConnected) {
                this.isConnected = false;
                this.events.emit('disconnect');
            }

            this.destroyed = true;

            clearInterval(this.interval);
            clearTimeout(this.reconnectTimer);

            for (const peerId in this.connectingPeers) {
                const peer = this.connectingPeers[peerId];
                clearTimeout(peer.offerTimeout);
                peer.peer?.destroy();
            }
            this.connectingPeers = {}

            let socket = this.socket;
            if (!socket) return resolve();
            socket.onopen = noop;
            socket.onmessage = noop;
            socket.onclose = noop;
            socket.onerror = noop;
            this.socket = undefined;

            if (socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
                return resolve();
            }

            socket.onclose = () => resolve();

            let timeout: any;

            // If there is no data response expected, destroy immediately.
            if (!this.expectingResponse) return destroyCleanup();

            // Otherwise, wait a short time for potential responses to come in from the
            // server, then force close the socket.
            timeout = setTimeout(destroyCleanup, 1000);

            // But, if a response comes from the server before the timeout fires, do cleanup
            // right away.
            socket.onmessage = destroyCleanup;

            function destroyCleanup () {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                if (socket) {
                    socket.onmessage = noop;
                    if (socket.readyState === WebSocket.CLOSED) {
                        socket.close();
                    }
                }
            }
        });
    }

    private onSocketConnect(): void {
        if (this.destroyed) return;
        this.isConnected = true;
        this.events.emit('connect');

        if (this.reconnecting) {
            this.reconnecting = false;
            this.reconnectRetries = 0;
            this.announce({});
        }
    }

    private async onSocketError(err: Error): Promise<void> {
        if (this.destroyed) return;
        console.error("WTT: Socket error", err);
        this.events.emit('error', err);
        await this.destroy();
        // errors will often happen if a tracker is offline, so don't treat it as fatal
        this.startReconnecting();
    }

    private onSocketData(chunk: MessageEvent): void {
        if (this.destroyed) return;

        this.expectingResponse = false;

        let data;
        try {
            data = JSON.parse(chunk.data as string);
        } catch (err) {
            console.warn(new Error("Invalid tracker response"));
            return;
        }

        if (data.action == 'announce') {
            this.onAnnounceResponse(data);
        } else if (data.action === 'scrape') {
            // ignore
        } else {
            this.onSocketError(new Error(`invalid action in WS response: ${data.action}`))
        }

    }

    private async onSocketClose(ev: CloseEvent): Promise<void> {
        if (this.destroyed) return;
        console.log("Tracker closed", ev);
        await this.destroy();

        this.startReconnecting();
    }

    private startReconnecting(): void {
        const ms = Math.floor(Math.random() * RECONNECT_VARIANCE) + Math.min(Math.pow(2, this.reconnectRetries) * RECONNECT_MINIMUM, RECONNECT_MAXIMUM)

        console.log("Reconnecting in " + ms / 1000);
        this.reconnecting = true;
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
            console.log("Reconnecting...");
            this.reconnectRetries++;
            this.openSocket();
        }, ms);
    }

    announce(options: AnnounceOptions = {}) {
        if (this.destroyed || this.reconnecting) return;

        if (this.socket?.readyState != WebSocket.OPEN) {
            this.events.once('connect', () => this.announce(options));
            return;
        }
        // console.log("Announcing: " + Buffer.from(this.config.infoHashBinary, 'binary').toString('hex'));

        const params = Object.assign({
            action: 'announce',
            info_hash: this.config.infoHashBinary,
            peer_id: this.config.peerIdBinary,
        }, this.config.defAnnounceOptions, options) as any;

        if (this.trackerId) params.trackerId = this.trackerId;

        if (options.event !== 'stopped' && options.event !== 'completed') {
            params.numwant = options.numwant ?? 10;
            const offers = [];

            for (let i = 0; i < params.numwant; i++) {
                let offerId = randombytes(20);
                this.connectingPeers[offerId.toString('hex')] = {}
                offers.push({
                    offer_id: offerId.toString('binary'),
                    offer: this.config.offerData,
                });
            }

            params.offers = offers;
        }
        // console.log("  Offers: " + JSON.stringify(params.offers));

        this.send(params);
    }

    private async onAnnounceResponse(data: AnnounceResponse): Promise<void> {
        // console.log("Announce response: " + JSON.stringify(data));
        if (data.info_hash !== this.config.infoHashBinary) {
            return;
        }
        if (data.peer_id && data.peer_id === this.config.peerIdBinary) {
            // ignore offers/answers from this client
            return;
        }
        const failure = data['failure reason'];
        if (failure) {
            this.onSocketError(new Error(failure));
            return;
        }

        const warning = data['warning message'];
        if (warning) {
            this.events.emit('warning', new Error(warning));
        }

        const interval = data.interval || data['min interval'];
        if (interval) this.setInterval(interval * 1000);

        const trackerId = data['tracker id'];
        if (trackerId) {
            // If absent, do not discard previous trackerId value
            this.trackerId = trackerId;
        }

        if (data.offer && data.peer_id) {
            const peerId = Buffer.from(data.peer_id, 'binary').toString('hex');
            const eventData = {
                peerId,
                offer: data.offer,
                continue: true,
            } as OfferFilterData;
            this.events.emit('offer_filter', eventData);
            if (!eventData.continue) {
                console.log("Discarding offer");
                return;
            }
            const offer = await this.createInitPeer(peerId, Buffer.from(data.offer_id, 'binary'), {});
            const params = {
                action: 'announce',
                info_hash: this.config.infoHashBinary,
                peer_id: this.config.peerIdBinary,
                to_peer_id: data.peer_id,
                answer: offer,
                offer_id: data.offer_id,
            } as any;
            if (this.trackerId) params.trackerId = this.trackerId;
            // console.log("Answering offer");
            this.send(params);
        }

        if (data.answer && data.peer_id) {
            // console.log("Received answer");
            const offerId = Buffer.from(data.offer_id, 'binary').toString('hex');

            let offerData = this.connectingPeers[offerId];
            const peerId = Buffer.from(data.peer_id, 'binary').toString('hex');

            if (offerData == undefined) {
                this.events.emit('warning', new Error("Got answer for unknown offer from " + peerId));
            }

            delete this.connectingPeers[offerId];
            if (offerData.peer === undefined) {
                // console.log("Received second");
                // Received the second message of the 3-way handshake!
                const peer = this.createPeer({});
                peer.events.once('signal', answer => {
                    const params = {
                        action: 'announce',
                        info_hash: this.config.infoHashBinary,
                        peer_id: this.config.peerIdBinary,
                        to_peer_id: data.peer_id,
                        answer,
                        offer_id: data.offer_id,
                    } as any;
                    if (this.trackerId) params.trackerId = this.trackerId;
                    this.send(params);
                    // console.log("Sending third message");

                });
                peer.signal(data.answer);
                this.events.emit('peer', peer, peerId);
            } else {
                // console.log("Received third");
                clearTimeout(offerData.offerTimeout);

                this.events.emit('peer', offerData.peer, peerId);
                offerData.peer.signal(data.answer);
            }
        }
    }

    private send(data: any): void {
        if (this.destroyed) return;
        this.expectingResponse = data.answer === undefined;
        const message = JSON.stringify(data);
        this.socket!!.send(message);
    }

    private createPeer(options: {}): WrtcConnection {
        const peerOpts = Object.assign({}, options, this.config.peerOptions);

        let peer = new WrtcConnection(peerOpts);

        const onErr = (err: Error) => {
            console.error(err);
            peer.destroy();
        };
        peer.events.once('error', onErr);
        peer.events.once('connect', () => {
            peer.events.off('error', onErr);
        });
        return peer;
    }

    private createInitPeer(peerId: string, offerId: Buffer, options: {}): Promise<WrtcConnection> {
        return new Promise(resolve => {
            const offerHex = offerId.toString('hex');
            const peer = this.createPeer(Object.assign({ initiator: true }, options));

            peer.events.once('signal',  offer => {
                resolve(offer);
            })
            const offerTimeout = setTimeout(() => {
                delete this.connectingPeers[offerHex];
                peer.destroy();
                this.events.emit('offer_timeout', peerId);
            }, OFFER_TIMEOUT);

            const connPeer = {
                peer,
                offerTimeout,
            } as ConnectingPeer;
            this.connectingPeers[offerHex] = connPeer;
        });
    }

    private openSocket(): void {
        this.destroyed = false;
        try {
            this.socket = new WebSocket(this.announceUrl);
        } catch (e) {
            this.onSocketError(e);
            return;
        }
        this.socket.binaryType = 'arraybuffer';
        this.socket.onopen = this.onSocketConnect.bind(this);
        this.socket.onmessage = this.onSocketData.bind(this);
        this.socket.onclose = this.onSocketClose.bind(this);
        this.socket.onerror = () => this.onSocketError(new Error("Error connecting to " + this.announceUrl));
    }
}

function noop() {}
