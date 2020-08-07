export interface P2pConnection {
    send(data: any): void;
    ondata?: (data: any, conn: P2pConnection) => void;
    channelId: number;
    nextPacketId: number;
}