import SafeEventEmitter from "../../util/safeEventEmitter";
import { WrtcChannel } from "./WrtcChannel";
import { WrtcRenegotiator } from "./WrtcRenegotiator";

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

type SignalingData = {
    sdp: RTCSessionDescriptionInit,
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
    readonly handle: RTCPeerConnection;
    readonly events: SafeEventEmitter;

    isConnected: boolean;

    private sdpSent: boolean;
    private sdpReceived: boolean;
    private isDestroyed: boolean;
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
            //console.log("[WrtcConnection] ice-gathering-state ", state);
            if (state === 'complete' && !this.sdpSent) {
                this.sdpSent = true;
                //console.log("[WC] Local gathering complete");
                this.events.emit('signal', {
                    sdp: this.handle.localDescription,
                } as SignalingData);
                this.checkConnected();
            }
        };
        // this.handle.onicecandidate = (e)  => console.log("[WrtcConnection] ice candidate", e.candidate);
        this.handle.oniceconnectionstatechange = () => {
            const state = this.handle.iceConnectionState;
            //console.log("[WrtcConnection] ice-connection-state " + state);

            switch (state) {
                case 'disconnected':
                    this.onDestroy();
                    break;
                case 'failed':
                    this.onDestroy(new WebRTCError("ICE Connection failed", 'ICE_FAILED'));
                    break;
            }
        };
        this.handle.ondatachannel = ev => this.events.emit('datachannel', new WrtcChannel(ev.channel));

        // Creates a channel and, when possible, renegotiates the connection using the already opened connection
        new WrtcRenegotiator(this);

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
        //console.log("[WC] SET REMOTE");
        await this.handle.setRemoteDescription(message.sdp);
        if (message.sdp.type == 'offer') {
            this.sdpSent = false;
            const offer = await this.handle.createAnswer();
            offer.sdp = filterTrickle(offer.sdp);
            //console.log("[WC] SET LOCAL");
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
        //console.log("[WrtcConnection] DESTROY", err);
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
