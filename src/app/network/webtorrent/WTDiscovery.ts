import SimplePeer from "simple-peer";
import { Buffer } from "buffer";
import { randombytes } from "../../util/jsobj";
import {OfferFilterData, TrackerConfig, WebTorrentTracker} from "./WebTorrentTracker";

// https://github.com/ngosang/trackerslist/blob/master/trackers_all_ws.txt
const TRACKERS = [
    //'ws://localhost:8000',
    'wss://tracker.openwebtorrent.com',
    'wss://tracker.btorrent.xyz',
    'wss://tracker.files.fm:7073/announce',
    //'wss://spacetradersapi-chatbox.herokuapp.com:443/announce',
    //'wss://peertube.cpy.re:443/tracker/socket',
]

const WAITING_FOR_INIT = {};

export interface OfferData {
    master?: true,
}

export class WTDiscovery {
    private trackerConfig: TrackerConfig;
    readonly peerId: string;
    peers = new Map<string, SimplePeer.Instance | typeof WAITING_FOR_INIT>();
    connectedTrackers: number;
    onPeerCallback: (peer: SimplePeer.Instance, peerId: string) => void = () => {};
    onTrackerConnectionCountEdit: (count: number) => void = () => {};

    isMaster: boolean = false;
    isPaused = true;
    trackers: {[trackerUrl: string]: WebTorrentTracker} = {};

    constructor() {
        let peerId = randombytes(20);
        this.trackerConfig = {
            peerIdBinary: peerId.toString('binary'),
            infoHashBinary: '',
            defAnnounceOptions: {},
            peerOptions: {
                channelConfig: {
                    ordered: true,
                },
            },
            offerData: {},
        };
        this.peerId = peerId.toString('hex');
        this.connectedTrackers = 0;
    }

    async setInfoHash(str: string): Promise<void> {
        const buffer = new TextEncoder().encode(str);
        const digest = await crypto.subtle.digest('SHA-1', buffer);

        // Convert digest to hex string
        this.trackerConfig.infoHashBinary = Buffer.from(digest).toString('binary');
    }

    addTracker(trackerUrl: string): void {
        if (trackerUrl in this.trackers) {
            return;
        }
        const tracker = new WebTorrentTracker(trackerUrl, this.trackerConfig);
        this.trackers[trackerUrl] = tracker;
        tracker.events.on('connect', () => {
            console.log('Tracker connection established ' + trackerUrl);
            this.connectedTrackers++;
            this.onTrackerConnectionCountEdit(this.connectedTrackers);
        });
        tracker.events.on('disconnect', (ev: CloseEvent) => {
            console.log("Tracker closed", ev);
            this.connectedTrackers--;
            this.onTrackerConnectionCountEdit(this.connectedTrackers);
        });
        tracker.events.on('error', x => {
            console.error('Tracker error', x);
        });
        tracker.events.on('offer_filter', (e: OfferFilterData) => {
            if ((!!(e.offer as OfferData).master) === this.isMaster) {
                console.log("Offer rejected (non-master): " + e.offer);
                e.continue = false;
                return;
            }
            if (this.peers.has(e.peerId)) {
                // already have one
                e.continue = false;
                console.log("Offer rejected (already present): " + e.offer);
                return;
            }
            this.peers.set(e.peerId, WAITING_FOR_INIT);
        });
        tracker.events.on('offer_timeout', (peerId: string) => {
            // someone passed offer_filter, received an answer but didn't reply back
            this.peers.delete(peerId);
        });
        tracker.events.on('peer', (peer: SimplePeer.Instance, peerId: string) => {
            const oldPeerData = this.peers.get(peerId);
            if (oldPeerData !== undefined && oldPeerData !== WAITING_FOR_INIT) {
                console.error("Opened another socket for an already connected peer");
                peer.destroy();
                return;
            }
            console.log('Peer connected', peerId);
            this.peers.set(peerId, peer);
            peer.once('connect', () => {
                if (!this.isMaster) {
                    console.log("Master connected, pausing.")
                    this.pause();
                }
            });
            this.onPeerCallback(peer, peerId);
            peer.once('close', () => {
                this.peers.delete(peerId);
            })
        });
        tracker.events.on('warning', x => {
            console.warn('warning', x);
        });
    }

    pause(): Promise<void> {
        if (this.isPaused) return Promise.resolve();
        this.isPaused = true;

        const promises = [];
        for (let trackerName in this.trackers) {
            const tracker = this.trackers[trackerName];
            promises.push(tracker.stop());
        }
        return Promise.all(promises).then(() => {});
    }

    private resumeTracker(tracker: WebTorrentTracker): void {
        tracker.start();
        tracker.announce({
            event: 'started',
        });
    }

    resume(): void {
        if (!this.isPaused) return;
        this.isPaused = false;

        for (let trackerName in this.trackers) {
            const tracker = this.trackers[trackerName];
            this.resumeTracker(tracker);
        }
    }

    async start(isMaster: boolean, identifier: string): Promise<void> {
        this.isMaster = isMaster;
        this.trackerConfig.defAnnounceOptions.numwant = isMaster ? 0 : 10;
        this.trackerConfig.offerData.master = isMaster;
        this.setInfoHash(identifier);
        for (let url of TRACKERS) {
            this.addTracker(url);
        }
        this.resume();
    }

    async stop(): Promise<void> {
        await this.pause();
        this.trackers = {};
    }
}