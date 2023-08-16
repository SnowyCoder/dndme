use std::sync::Arc;

use axum::extract::ws::{Message, WebSocket};
use base64::{engine::general_purpose, Engine};
use compact_str::CompactString;
use thiserror::Error;
use tokio::sync::mpsc;
use tracing::{error, info};

use crate::{
    protocol::{ClientId, ErrorS2C, MessageC2S, MessageS2C, RoomName, RoomNetworkType, ServerOutbound, RoomJoinedData, ServerEvent},
    rooms::{
        Room, RoomCreateError, RoomId, RoomJoinError, RoomJoinNext,
        UserCredentials, RoomRenameResult,
    },
    users::UserProfile,
    ServerState,
};

#[derive(Error, Debug)]
pub enum HandleMessageError {
    #[error("invalid message received")]
    InvalidMessage,
    #[error("Error sending message {0}")]
    SendError(#[from] axum::Error),
    #[error("Error encoding message {0}")]
    EncodingError(#[from] rmp_serde::encode::Error),
}

#[derive(Debug)]
pub enum MailboxMessage {
    RoomCreated,// Sent only when a room is no longer on hold
    DirectMessage(Vec<u8>),
    RoomDestroyed,
}

pub struct ClientState {
    state: Arc<ServerState>,

    current_room: Option<(Room, RoomId)>,
    room_net: RoomNetworkType,
    master_id: ClientId,
    is_master: bool,
    on_hold: bool,

    profile: Arc<UserProfile>,
    mailbox: mpsc::Receiver<MailboxMessage>,
    socket: WebSocket,
}

impl ClientState {
    pub fn new(state: Arc<ServerState>, socket: WebSocket, client_id: ClientId) -> ClientState {
        let (msg_send, mailbox) = mpsc::channel(8);
        let profile = Arc::new(UserProfile::new(client_id, msg_send));
        state.users.register(profile.clone());
        ClientState {
            state,
            current_room: None,
            room_net: RoomNetworkType::Leader,
            is_master: false,
            master_id: profile.user_id,
            on_hold: false,
            profile,
            mailbox,
            socket,
        }
    }

    async fn handle_message(&mut self, data: Vec<u8>) -> Result<(), HandleMessageError> {
        let msg: MessageC2S =
            rmp_serde::from_slice(&data).map_err(|_| HandleMessageError::InvalidMessage)?;

        match msg {
            MessageC2S::CreateRoom {
                name,
                password,
                password_hint,
            } => {
                if self.current_room.is_some() {
                    return self.send_error(ErrorS2C::AlreadyInRoom).await;
                }
                info!(name=name.as_str(), "Create room");
                let name = self.compute_name(name);
                let name = match name {
                    Ok(x) => x,
                    Err(e) => {
                        return self.send_error(e).await;
                    }
                };
                let password = password.unwrap_or(CompactString::new(""));
                let password_hint = password_hint.unwrap_or(CompactString::new(""));
                let res = self
                    .state
                    .rooms
                    .create_room(name.clone(), &self.profile, password, password_hint)
                    .await;
                match res {
                    Ok(room) => {
                        self.is_master = true;
                        self.current_room = Some(room);
                        self.send_message(MessageS2C::RoomCreated { name })
                            .await?;
                    }
                    Err(err) => match err {
                        RoomCreateError::RoomAlreadyPresent => {
                            self.send_error(ErrorS2C::RoomHasLeader).await?;
                        }
                    },
                }
            }

            MessageC2S::JoinRoom {
                room,
                net,
                password,
            } => {
                if self.current_room.is_some() {
                    return self.send_error(ErrorS2C::AlreadyInRoom).await;
                }
                info!(name=room.as_str(), "Join room");
                let password = password.unwrap_or(CompactString::new(""));
                let credentials = UserCredentials { net, psw: password };
                self.is_master = false;
                let (room, id, next) = self
                    .state
                    .rooms
                    .join_room(room, self.profile.clone(), credentials)
                    .await;
                self.current_room = Some((room, id));
                match next {
                    RoomJoinNext::Done(Ok(data)) => {
                        self.master_id = data.master.user_id;
                        let data = RoomJoinedData {
                            master: self.master_id,
                            others: data.others.into_iter().map(|x| x.user_id).collect(),
                        };
                        let packet = ServerOutbound::Message(MessageS2C::RoomJoined(data));
                        self.send_packet(&packet).await?;
                    }
                    RoomJoinNext::Done(Err(e)) => {
                        self.current_room = None;
                        match e {
                            RoomJoinError::PasswordWrong { hint } => {
                                self.send_error(ErrorS2C::RoomPasswordWrong { hint })
                                    .await?;
                            }
                        }
                    },
                    RoomJoinNext::OnHold => {
                        self.on_hold = true;
                        self.send_message(MessageS2C::RoomOnHold).await?
                    }
                }
            }

            MessageC2S::Message { to, data } => {
                // TODO: you can still send messages to people that don't have Mesh networking
                // it's relatively unlikely because the client doesn't know their ID.
                let is_master = self.master_id == to || self.is_master;
                let can_send = is_master || self.room_net == RoomNetworkType::Mesh;
                let room_id = self.current_room.as_ref().map(|x| x.1);
                let profile = can_send
                    .then(|| self.state.users.profile(to))
                    .flatten()
                    .filter(|x| x.current_room() == room_id && room_id.is_some());
                let profile = match profile {
                    Some(x) => x,
                    None => {
                        self.send_error(ErrorS2C::InvalidUser).await?;
                        return Ok(());
                    }
                };
                let mex = ServerOutbound::Event(ServerEvent::Message {
                    from: self.profile.user_id,
                    data,
                });
                let data = rmp_serde::to_vec_named(&mex)?;
                let _ = profile
                    .mailbox
                    .send(MailboxMessage::DirectMessage(data))
                    .await;
                self.send_message(MessageS2C::Success).await?;
            }
            MessageC2S::LeaveRoom => {
                info!("Leave room");
                if let Some((room, _room_id)) = self.current_room.take() {
                    self.state
                        .rooms
                        .leave_room(room, self.profile.user_id)
                        .await;
                }
                self.send_message(MessageS2C::Success).await?;
            }
            MessageC2S::RenameRoom { name } => {
                info!(name=name.as_str(), "Rename room");
                let (room, _room_id) = match &self.current_room {
                    Some(room_id) if self.is_master => room_id,
                    _ => {
                        self.send_error(ErrorS2C::InvalidRoomName).await?;
                        return Ok(());
                    }
                };
                let new_name = self.compute_name(name);
                let new_name = match new_name {
                    Ok(x) => x,
                    Err(e) => {
                        self.send_error(e).await?;
                        return Ok(());
                    }
                };
                let res = self.state.rooms.rename_room(room, new_name.clone()).await;
                let pkt = match res {
                    RoomRenameResult::ServerError => MessageS2C::Error(ErrorS2C::ServerError),
                    RoomRenameResult::NameTaken => MessageS2C::Error(ErrorS2C::RenameRoomNameTaken),
                    RoomRenameResult::Renamed => MessageS2C::Success,
                };
                self.send_message(pkt).await?;
            }
            MessageC2S::EditPassword { password, password_hint } => {
                info!("Edit password");
                let (room, _room_id) = match &self.current_room {
                    Some(room_id) if self.is_master => room_id,
                    _ => {
                        self.send_error(ErrorS2C::InvalidRoomName).await?;
                        return Ok(());
                    }
                };
                let password = password.unwrap_or(CompactString::new(""));
                let hint = password_hint.unwrap_or(CompactString::new(""));

                self.state.rooms.edit_password(room, password, hint).await;

                self.send_message(MessageS2C::Success).await?;
            }
        }

        Ok(())
    }

    async fn handle_inbox(&mut self, msg: MailboxMessage) -> Result<(), HandleMessageError> {
        use MailboxMessage::*;
        match msg {
            RoomCreated => {
                info!("Event: room created");
                if !self.on_hold {
                    error!("Received RoomJoinResult while not on hold!");
                    return Ok(());
                }
                self.on_hold = false;
                self.current_room = None;
                self.send_event(ServerEvent::RoomPresent).await?;
            }
            DirectMessage(data) => {
                self.socket.send(Message::Binary(data)).await?;
            }
            RoomDestroyed => {
                info!("Event: room destroyed");
                self.on_hold = false;
                self.current_room = None;
                self.send_event(ServerEvent::RoomDestroyed).await?;
            }
        }
        Ok(())
    }

    pub async fn handle_socket(mut self) {
        loop {
            tokio::select! {
                Some(msg) = self.mailbox.recv() => {
                    if let Err(e) = self.handle_inbox(msg).await {
                        error!("Error handling inbox: {e}");
                        break;
                    }
                }
                data = self.socket.recv() => match data {
                    None => {
                        // Client disconnected (I guess?)
                        info!("Channel closed normally 2 I guess?");
                        break
                    }
                    Some(Err(e)) => {
                        error!("Error while receiving data: {e}");
                        break
                    }
                    Some(Ok(Message::Binary(data))) => {
                        if let Err(e) = self.handle_message(data).await {
                            error!("Error handling message: {e}");
                            break
                        }
                    }
                    Some(Ok(Message::Close(_))) => {
                        info!("Channel closed normally");
                        break
                    }
                    Some(Ok(_)) => {}, // Ignore other messages
                }
            }
        }
        if let Some((room, _room_id)) = self.current_room.take() {
            info!("Leaving room");
            self.state
                .rooms
                .leave_room(room, self.profile.user_id)
                .await;
        }
    }

    async fn send_error(&mut self, err: ErrorS2C) -> Result<(), HandleMessageError> {
        self.send_packet(&ServerOutbound::Message(MessageS2C::Error(err))).await
    }

    async fn send_message(&mut self, m: MessageS2C) -> Result<(), HandleMessageError> {
        self.send_packet(&ServerOutbound::Message(m)).await
    }

    async fn send_event(&mut self, m: ServerEvent<'_>) -> Result<(), HandleMessageError> {
        self.send_packet(&ServerOutbound::Event(m)).await
    }

    async fn send_packet(&mut self, m: &ServerOutbound<'_>) -> Result<(), HandleMessageError> {
        let data = rmp_serde::to_vec_named(m)?;
        self.socket.send(Message::Binary(data)).await?;
        Ok(())
    }

    fn compute_name(&self, name: RoomName) -> Result<CompactString, ErrorS2C> {
        Ok(if name.is_empty() {
            if !self.state.config.self_signed_room {
                return Err(ErrorS2C::InvalidRoomName);
            }
            // TODO: optimize further
            let original = general_purpose::URL_SAFE.encode(self.profile.user_id.0);
            CompactString::new(original)
        } else {
            if !self.state.config.arbitrary_name_room {
                return Err(ErrorS2C::InvalidRoomName);
            }
            name
        })
    }
}

impl Drop for ClientState {
    fn drop(&mut self) {
        self.state.users.unregister(self.profile.user_id);
    }
}
