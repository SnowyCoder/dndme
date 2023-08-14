import SafeEventEmitter from "../../util/safeEventEmitter";
import { WrtcChannel } from "./WrtcChannel";
import { Logger, getLogger } from "@/ecs/systems/back/log/Logger";

const BASE_RTC_CONFIG = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:global.stun.twilio.com:3478",
            ]
        }
    ],
} as RTCConfiguration;

export type WebRTCErrorCause = 'ICE_FAILED' | 'SIGNALER_FAILED';

export class WebRTCError extends Error {
    cause: WebRTCErrorCause;
    constructor(message: string, cause: WebRTCErrorCause) {
        super(message);
        this.cause = cause;
        this.name = 'WebRTCError';
    }
}

function extractFingerprint(sdp: string): string {
    const index = sdp.indexOf("a=fingerprint:");
    if (index < 0) throw new Error("SDP contains no fingerprint");
    const newLine = sdp.indexOf("\n", index);

    return sdp.substring(index, newLine).trim();
}

// In WebRTC negotiation is quite strange, we're using the "Perfect Negotiation"
// protocol to avoid deadlocks, to do this we must first decide a polite and an impolite peer.
// We decide the peer based on SDPs, who has the "lower" fingerprint will be impolite.
// Can this be used by a malicious peer to attack us and decide wether it should be polite or impolite? yes
// can we fix this? yeah probably, deciding with some random oracle like hash(totalOrdering(descriptions))
// Do we really care? no, not really.
function decideRole(localDescription: string, remoteDescription: string): "polite" | "impolite" {
    const fingLocal = extractFingerprint(localDescription);
    const fingRemote = extractFingerprint(remoteDescription);

    return fingLocal < fingRemote ? "impolite" : "polite";
}


// TODO: Can we handle ICE restarts?
export class WrtcConnection {
    readonly handle: RTCPeerConnection;
    readonly events: SafeEventEmitter;
    readonly signaler: Signaler;

    private readonly logger: Logger;

    isConnected: boolean;

    private isMakingOffer: boolean;
    private isIgnoringOffer: boolean;
    private isDestroyed: boolean;

    constructor(config: RTCConfiguration, signaler: Signaler) {
        this.events = new SafeEventEmitter();
        this.logger = getLogger('connection.wrtc');

        const rtcConfig = Object.assign({}, BASE_RTC_CONFIG, config);
        this.handle = new RTCPeerConnection(rtcConfig);
        this.signaler = signaler;

        this.signaler.onmessage = this.onSignalMessage.bind(this);
        this.signaler.onerror = this.onSignalerError.bind(this);

        this.isMakingOffer = false;
        this.isIgnoringOffer = false;
        this.isDestroyed = false;
        this.isConnected = false;

        this.handle.oniceconnectionstatechange = () => {
            const state = this.handle.iceConnectionState;
            this.logger.debug("ice-connection-state", state);

            switch (state) {
                case 'disconnected':
                    this.onDestroy();
                    break;
                case 'failed':
                    this.handle.restartIce();
                    // TODO: use counter? use TURN? idk
                    // this.onDestroy(new WebRTCError("ICE Connection failed", 'ICE_FAILED'));
                    break;
            }
        };
        this.handle.onicecandidate = ({ candidate }) => {
            this.logger.debug('ice-candidate', candidate);
            this.signaler.signal({ candidate });
        };
        this.handle.onnegotiationneeded = () => {
            this.logger.debug('negotiation-needed')
            this.makeOffer();
        }
        this.handle.onconnectionstatechange = () => {
            const state = this.handle.connectionState;

            this.logger.debug("connection-state", state);
            switch (state) {
                case 'connected':
                    this.checkConnected();
                    break;
                case 'failed':
                    this.onDestroy(new WebRTCError("ICE Connection failed", 'ICE_FAILED'));
                    break;
                case 'disconnected':
                    this.onDestroy();
                    break;
            }
        }
        this.handle.ondatachannel = ev => this.events.emit('datachannel', new WrtcChannel(ev.channel));

        // Creates a channel and, when possible, renegotiates the connection using the already opened connection
        // TODO: renegotiate using the open channel instead of passing through the signaler.
    }

    async makeOffer() {
        this.isMakingOffer = true;
        try {
            await this.handle.setLocalDescription();
            this.signaler.signal({
                description: this.handle.localDescription!,
            });
        } finally {
            this.isMakingOffer = false;
        }
    }

    private checkConnected() {
        if (!this.isConnected) {// handle ICE restarts
            this.isConnected = true;
            this.events.emit('connect');
        }
    }

    private onSignalerError(e: string) {
        this.logger.error("signaler error reported", e);
        this.onDestroy(new WebRTCError(e, "SIGNALER_FAILED"));
    }

    async onSignalMessage(data: SignalData) {
        this.logger.trace('onSignalMessage', data);
        try {
            if ('description' in data) {
                this.logger.debug("Description received!", data.description);
                const description = data.description;
                const offerCollision = data.description.type === 'offer' && (this.isMakingOffer || this.handle.signalingState !== 'stable');
                if (offerCollision) {
                    if (decideRole(description.sdp, this.handle.localDescription!.sdp) == 'impolite') {
                        this.logger.debug("Ignored offer because role=impolite!");
                        this.isIgnoringOffer = true;
                        return;
                    }
                }
                this.isIgnoringOffer = false;
                await this.handle.setRemoteDescription(description);
                if (description.type == 'offer') {
                    await this.handle.setLocalDescription();
                    this.signaler.signal({
                        description: this.handle.localDescription!
                    });
                }
            } else if ('candidate' in data) {
                this.logger.debug("Candidate received!", data.candidate);
                try {
                    // why as any? I have no idea, WebRTC is weird magic and so is javascript
                    await this.handle.addIceCandidate(data.candidate as any);
                } catch (err) {
                    if (!this.isIgnoringOffer) {
                        throw err;
                    } else {
                        this.logger.debug("Offer is about old request, ignoring!");
                    }
                }
            } else {
                this.logger.warning("Unknown signaling message received", data);
            }
        } catch(e) {
            this.logger.error("Error while processing signaling message", e);
        }
    }

    createDataChannel(label: string, config: RTCDataChannelInit) {
        const channel = this.handle.createDataChannel(label, config);
        return new WrtcChannel(channel);
    }

    destroy() {
        this.onDestroy();
    }

    private onDestroy(err?: Error | undefined) {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        this.isConnected = false;

        try {
            this.handle.close();
        } catch (err2) {}
        if (err !== undefined) this.events.emit('error', err);
        this.events.emit('close');
    }
}

export type SignalData = {
    description: RTCSessionDescription
} | {
    candidate: RTCIceCandidate | null
}

export interface Signaler {
    signal(data: SignalData): void;

    onmessage: (data: SignalData) => void;
    onerror: (error: string) => void;
}
