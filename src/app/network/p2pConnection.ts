import {RtcStatsManager} from "./RtcStatsManager";

export interface P2pConnection {
    send(data: any): void;
    ondata?: (data: any, conn: P2pConnection) => void;
    channelId: number;
    nextPacketId: number;

    buffered: boolean,
    bufferedBytes(): number;
    onBufferChange?: (buffered: boolean) => void;

    getHandle(): RTCPeerConnection | undefined;
    getStatsReporter(): RtcStatsManager | undefined;

}