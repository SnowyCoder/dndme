import { off } from "process";
import SafeEventEmitter from "../../util/safeEventEmitter";
import { WrtcChannel } from "./WrtcChannel";

const BASE_RTC_CONFIG = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:global.stun.twilio.com:3478",
            ]
        }
    ]
} as RTCConfiguration;

type SignalingData = {
    sdp: RTCSessionDescription,
};

export interface WrtcConnectionConfig {
    rtcConfig?: RTCConfiguration,
    initiator: boolean,
}

export type WebRTCErrorCause = 'ICE_FAILED';

export class WebRTCError extends Error {
    cause: WebRTCErrorCause;
    constructor(message: string, cause: WebRTCErrorCause) {
        super(message);
        this.cause = cause;
        this.name = 'WebRTCError';
    }
}

function filterTrickle(sdp: string | undefined): string | undefined {
    return sdp?.replace(/a=ice-options:trickle\s\n/g, '')
}

// TODO: Can we handle ICE restarts?
export class WrtcConnection {
    handle: RTCPeerConnection;
    events: SafeEventEmitter;
    private sdpSent: boolean;
    private sdpReceived: boolean;
    private isDestroyed: boolean;
    private isConnected: boolean;
    private isInitiator: boolean;

    constructor(config: WrtcConnectionConfig) {
        this.events = new SafeEventEmitter();

        const rtcConfig = Object.assign({}, BASE_RTC_CONFIG, config.rtcConfig);
        this.handle = new RTCPeerConnection(rtcConfig);
        this.sdpSent = false;
        this.sdpReceived = false;
        this.isDestroyed = false;
        this.isConnected = false;
        this.isInitiator = !!config.initiator;

        this.handle.onicegatheringstatechange = () => {
            const state = this.handle.iceGatheringState;
            if (state === 'complete' && !this.sdpSent) {
                this.sdpSent = true;
                this.events.emit('signal', {
                    sdp: this.handle.localDescription,
                } as SignalingData);
                this.checkConnected();
            }
        };
        this.handle.oniceconnectionstatechange = () => {
            const state = this.handle.iceConnectionState;

            switch (state) {
                case 'disconnected':
                    this.onDestroy();
                    break;
                case 'failed':
                    this.onDestroy(new WebRTCError("ICE Connection failed", 'ICE_FAILED'));
                    break;
            }
        };
        this.handle.createDataChannel('unused', {
            negotiated: false,
            id: 0,
        })
        if (this.isInitiator) {
            this.makeOffer();
        }
    }

    private async makeOffer() {
        const offer = await this.handle.createOffer();
        offer.sdp = filterTrickle(offer.sdp);
        await this.handle.setLocalDescription(offer);
    }

    async signal(message: SignalingData) {
        this.sdpReceived = true;
        await this.handle.setRemoteDescription(message.sdp);
        if (message.sdp.type == 'offer') {
            this.sdpSent = false;
            const offer = await this.handle.createAnswer();
            offer.sdp = filterTrickle(offer.sdp);
            await this.handle.setLocalDescription(offer);
        }
        this.checkConnected();
    }

    private checkConnected() {
        if (!this.sdpSent || !this.sdpReceived) return;
        if (!this.isConnected) {// handle ICE restarts
            this.isConnected = true;
            this.events.emit('connect');
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


        try {
            this.handle.close();
        } catch (err) {}
        if (err) this.events.emit('error', err);
        this.events.emit('close');
    }
}