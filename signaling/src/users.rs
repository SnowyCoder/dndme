use std::{
    num::NonZeroU64,
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
};

use dashmap::DashMap;
use tokio::sync::mpsc;

// TODO: for someone that has more time than me, trying to import MailboxMessage from "protocol"
// will generate a surprisingly long error message
use crate::{client::MailboxMessage, protocol::ClientId, rooms::RoomId};

#[derive(Debug)]
pub struct UserProfile {
    pub user_id: ClientId,
    pub room: AtomicU64,
    pub mailbox: mpsc::Sender<MailboxMessage>,
}

impl UserProfile {
    pub fn new(user_id: ClientId, mailbox: mpsc::Sender<MailboxMessage>) -> Self {
        UserProfile {
            user_id,
            room: AtomicU64::new(0),
            mailbox,
        }
    }

    pub fn current_room(&self) -> Option<RoomId> {
        NonZeroU64::new(self.room.load(Ordering::Relaxed)).map(RoomId)
    }

    pub fn set_current_room(&self, room: Option<RoomId>) {
        let id = room.map(|x| x.0.get()).unwrap_or(0);
        self.room.store(id, Ordering::Relaxed);
    }
}

pub struct UserRegistry {
    users: DashMap<ClientId, Arc<UserProfile>>,
}

impl UserRegistry {
    pub fn new() -> Self {
        UserRegistry {
            users: DashMap::new(),
        }
    }

    pub fn registry_size(&self) -> usize {
        return self.users.len();
    }

    pub fn register(&self, profile: Arc<UserProfile>) {
        self.users.entry(profile.user_id).or_insert(profile);
    }

    pub fn unregister(&self, id: ClientId) {
        self.users.remove(&id);
    }

    pub fn profile(&self, id: ClientId) -> Option<Arc<UserProfile>> {
        self.users.get(&id).map(|x| x.clone())
    }
}
