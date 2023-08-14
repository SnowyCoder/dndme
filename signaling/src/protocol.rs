use std::borrow::Cow;

use compact_str::CompactString;
use serde::{Deserialize, Serialize};

// The protocol is pretty simple
// When the WebSocket connection is opened, the server will send a 8 byte PROTOCOL_VERSION followed by a session id that is of length: SESSION_ID_LENGTH_BYTES
// The client will answer with a raw p-256 public key and a signature (decoded by HandshakeClientIdentification using MessagePack)
// If the sent key is invalid, the proof incorrect or a timeout passes, the connection will be closed
// Otherwise client and server can begin sending packets using MessagePack format
// Clients will always send MessageC2S, servers will either send response messages (MessageS2C) or asynchronous events (ServerEvent).
// Messages are answered in order (serialized), while events can be sent at any time.

// TODO: use an immutable string type like smol_str/flexstr to have O(1) clones

pub const PROTOCOL_VERSION: u64 = 0;
pub const SESSION_ID_LENGTH_BYTES: usize = 64;

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ClientId(#[serde(with = "serde_byte_array")] pub  [u8; 256 / 8]);

#[derive(Serialize, Deserialize, Debug)]
pub struct HandshakeClientIdentification<'a> {
    #[serde(with = "serde_bytes")]
    #[serde(borrow)]
    pub identity: Cow<'a, [u8]>,
    #[serde(with = "serde_bytes")]
    #[serde(borrow)]
    pub proof: Cow<'a, [u8]>,
}

pub type RoomName = CompactString;

#[derive(Serialize, Deserialize, PartialEq, Eq, Debug)]
#[serde(rename_all = "snake_case")]
pub enum RoomNetworkType {
    Mesh,// Client creates a connection to everyone else (with Mesh configured)
    Leader,// Client only connects to the leader.
}

#[derive(Serialize, Debug)]
pub struct RoomJoinedData {
    pub master: ClientId,
    // Other clients that have net::Mesh
    pub others: Vec<ClientId>,
}


#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum MessageC2S<'a> {
    CreateRoom {
        name: RoomName,
        password: Option<CompactString>,
        password_hint: Option<CompactString>,
    },
    // Join a room as player, if the leader is not yet present the server will put the user "on hold"
    JoinRoom {
        room: CompactString,
        net: RoomNetworkType,
        // TODO: Use the opaque protocol?
        password: Option<CompactString>,
    },
    RenameRoom {
        name: RoomName,
    },
    EditPassword {
        password: Option<CompactString>,
        password_hint: Option<CompactString>,
    },
    LeaveRoom,
    Message {
        to: ClientId,
        #[serde(with = "serde_bytes")]
        #[serde(borrow)]
        data: Cow<'a, [u8]>,
    },
}

#[derive(Serialize, Debug)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum MessageS2C {
    Success,// Indicating any success without further data, ex: renamed, room left,
    RoomCreated {
        name: CompactString,
    },
    // You tried to join the room but it's not yet created
    // When it will be, the server will notify you with a RoomPresent event.
    RoomOnHold,
    RoomJoined(RoomJoinedData),
    Error(ErrorS2C),
}

#[derive(Serialize, Debug)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ServerEvent<'a> {
    // Sent after a user is on hold on a room and it gets created, now it's still not in a room, but it can try to join.
    // Can the user try to join directly? In a previous version yes, but the server had to hold on to the credentials and
    // give an error in an event, wayyy to hard to implement.
    // 99.999% the client has an user agent, so let him do the work and keep the infrastructure simple.
    RoomPresent,
    RoomDestroyed,
    RoomRenamed {
        name: CompactString,
    },
    // Only if the user is admin or if both users are mesh
    UserJoin {
        id: ClientId,
    },
    UserLeave {
        id: ClientId,
    },
    Message {
        from: ClientId,
        #[serde(with = "serde_bytes")]
        data: Cow<'a, [u8]>,
    },
}

#[derive(Serialize, Debug)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum ServerOutbound<'a> {
    Message(MessageS2C),
    Event(ServerEvent<'a>),
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "reason", rename_all = "snake_case")]
pub enum ErrorS2C {
    RoomHasLeader,
    InvalidUser,
    RenameRoomNameTaken,
    InvalidRoomName,
    RoomPasswordWrong { hint: CompactString },
    AlreadyInRoom,
    ServerError,
}
