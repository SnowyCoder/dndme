
export interface PacketContainer {
    id?: number;
    sender: number;
    receiver?: number;// if undefined: broadcast
    payload: Packet;
}

export interface Packet {
    type: string;
}

export interface ResponsePacket extends Packet {
    requestId?: number;
}

type KnownErrorType = 'invalid_json' | 'unknown_receiver';

export interface ErrorPacket extends ResponsePacket {
    errorType: KnownErrorType | string;
}
