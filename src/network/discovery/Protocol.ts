// Keep always in sync with signaling/src/protocol.rs

export type ClientId = ArrayBuffer;

export type ProtocolError = 'room_has_leader' | 'invalid_user' | 'rename_room_name_taken' | 'invalid_room_name' | 'room_password_wrong' | 'already_in_room' | 'server_error';

export type MessageC2S =  {
    type: 'create_room',
    name?: string,
    password: string,
    password_hint: string,
} | {
    type: 'join_room',
    room: string,
    net: 'mesh' | 'leader',
    password?: string,
} | {
    type: 'rename_room',
    name?: string,
} | {
    type: 'edit_password',
    password: string,
    password_hint: string,
} | {
    type: 'leave_room',
} | {
    type: 'message',
    to: ClientId,
    data: ArrayBuffer,
};

export type MessageS2C = {
    type: 'success',
} | {
    type: 'room_created',
    name: string,
} | {
    type: 'room_on_hold',
} | {
    type: 'room_joined',
    master: ClientId,
    others: Array<ClientId>,
} | {
    type: 'error',
    reason: ProtocolError,
    hint?: string,// Only when reason == 'room_password_wrong'
};

export type ServerEvent =  {
    type: 'room_present' | 'room_destroyed',
} | {
    type: 'room_renamed',
    name: string,
} | {
    type: 'user_join' | 'user_leave',
    id: ClientId,
} | {
    type: 'message',
    from: ClientId,
    data: ArrayBuffer,
};

export type ClientInbound = ({
    kind: 'message',
} & MessageS2C) | ({
    kind: 'event'
} & ServerEvent);
