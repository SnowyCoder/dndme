import { WrtcChannel } from "./WrtcChannel";
import { WrtcConnection } from "./WrtcConnection";


type SignalingPacket = {
    type: 'offer',
    sdp: RTCSessionDescriptionInit,
} | {
    type: 'candidate',
    sdp: RTCIceCandidate,
};


export class WrtcRenegotiator {
    private readonly parent: WrtcConnection;
    private readonly handle: RTCPeerConnection;
    private readonly channel: WrtcChannel;

    private packetsToSend: SignalingPacket[] = [];
    private isSending: boolean = false;

    constructor(conn: WrtcConnection) {
        this.parent = conn;
        this.handle = conn.handle;
        this.channel = conn.createDataChannel('reconnector', {
            negotiated: true,
            id: 0,
        });

        this.handle.onnegotiationneeded = async () => {
            if (!this.parent.isConnected) return;
            const description = await this.handle.createOffer();
            await this.handle.setLocalDescription(description);
            this.sendPacket({
                type: 'offer',
                sdp: description,
            } as SignalingPacket);
        };
        this.handle.onicecandidate = e => {
            if (!this.parent.isConnected) return;
            const candidate = e.candidate;
            if (candidate == null) return;
            this.sendPacket({
                type: 'candidate',
                sdp: candidate,
            })
        }

        this.channel.events.on('data', this.onData.bind(this));

        this.onPacketSent = this.onPacketSent.bind(this);
    }

    private sendPacket(packet: SignalingPacket): void {
        if (this.isSending) {
            this.packetsToSend.push(packet);
        } else {
            this.isSending = true;
            this.sendPacket0(packet);
        }
    }

    private sendPacket0(packet: SignalingPacket): void {
        this.channel.send(JSON.stringify(packet), this.onPacketSent);
    }

    private onPacketSent(): void {
        if (this.packetsToSend.length === 0) {
            this.isSending = false;
            return;
        }
        const packet = this.packetsToSend.splice(0, 1)[0];
        this.sendPacket0(packet);
    }

    private async onData(data: string | ArrayBufferLike) {
        if (typeof data !== 'string') return;
        const packet = JSON.parse(data) as SignalingPacket;

        if (packet.type === 'offer') {
            if (packet.sdp.type == 'offer') {
                await this.handle.setRemoteDescription(packet.sdp);
                const ans = await this.handle.createAnswer();
                await this.handle.setLocalDescription(ans);
                this.sendPacket({
                    type: 'offer',
                    sdp: this.handle.localDescription!,
                });
            } else {
                await this.handle.setRemoteDescription(packet.sdp);
            }
        } else if (packet.type === 'candidate') {
            this.handle.addIceCandidate(packet.sdp);
        }
    }

}
