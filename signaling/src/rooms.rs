use std::{
    iter,
    mem,
    num::NonZeroU64,
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
};

use compact_str::CompactString;
use dashmap::{mapref::entry::Entry, DashMap};
use futures::Future;
use parking_lot::{MappedMutexGuard, Mutex, MutexGuard};
use tracing::{error, trace};

use crate::{
    client::MailboxMessage,
    protocol::{ClientId, RoomNetworkType, ServerEvent, ServerOutbound},
    users::UserProfile,
};

pub struct UserCredentials {
    pub net: RoomNetworkType,
    pub psw: CompactString,
}

#[derive(Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord, Debug)]
pub struct RoomId(pub NonZeroU64);

pub struct ActiveRoom {
    room_id: RoomId,
    name: CompactString,
    master: Arc<UserProfile>,
    password: CompactString,
    hint: CompactString,
    users: Vec<(Arc<UserProfile>, RoomNetworkType)>,
}

impl ActiveRoom {
    fn check_password(&self, psw: &str) -> Result<(), RoomJoinError> {
        return match self.password.as_str() {
            "" => Ok(()),
            p if p == psw => Ok(()),
            _ => Err(RoomJoinError::PasswordWrong {
                hint: self.hint.clone(),
            }),
        };
    }

    pub fn join(&mut self, user: Arc<UserProfile>, creds: UserCredentials) -> RoomJoinResponse {
        self.check_password(&creds.psw)?;

        user.set_current_room(Some(self.room_id));

        let others = if creds.net == RoomNetworkType::Mesh {
            self.users
                .iter()
                .filter(|x| x.1 == RoomNetworkType::Mesh)
                .map(|x| x.0.clone())
                .collect()
        } else {
            Vec::new()
        };

        self.users.push((user, creds.net));

        Ok(RoomJoinData {
            master: self.master.clone(),
            others,
        })
    }

    pub fn leave(&mut self, id: ClientId) -> Vec<Arc<UserProfile>> {
        let index = self.users.iter().position(|x| x.0.user_id == id);
        let index = match index {
            Some(i) => i,
            None => return Vec::new(),
        };
        let (profile, net) = self.users.remove(index);
        profile.set_current_room(None);

        if net == RoomNetworkType::Mesh {
            self.users
                .iter()
                .filter(|(_prof, net)| *net == RoomNetworkType::Mesh)
                .map(|(prof, _net)| prof.clone())
                .chain(iter::once(self.master.clone()))
                .collect()
        } else {
            vec![self.master.clone()]
        }

    }

    pub fn destroy(mut self) -> Vec<Arc<UserProfile>> {
        self.master.set_current_room(None);
        for (profile, _net) in self.users.iter() {
            profile.set_current_room(None);
        }
        self.users.drain(..).map(|x| x.0).collect()
    }
}

#[derive(Debug)]
pub struct RoomJoinData {
    pub master: Arc<UserProfile>,
    // Other clients that have net::Mesh
    pub others: Vec<Arc<UserProfile>>,
}

#[derive(Debug)]
pub enum RoomJoinError {
    PasswordWrong { hint: CompactString },
}

pub type RoomJoinResponse = Result<RoomJoinData, RoomJoinError>;

#[derive(Debug)]
pub enum RoomCreateError {
    RoomAlreadyPresent,
}

#[derive(Debug)]
pub enum RoomJoinNext {
    Done(RoomJoinResponse),
    OnHold,
}

pub struct VacantRoom {
    name: CompactString,
    room_id: RoomId,
    on_hold: Vec<Arc<UserProfile>>,
}

pub enum RoomEntry {
    Active(ActiveRoom),
    Vacant(VacantRoom),
}

impl RoomEntry {
    pub fn new_vacant(name: CompactString, room_id: RoomId) -> Self {
        RoomEntry::Vacant(VacantRoom {
            name,
            room_id,
            on_hold: Vec::new(),
        })
    }

    fn upgrade(
        &mut self,
        master: Arc<UserProfile>,
        password: CompactString,
        hint: CompactString,
    ) -> Option<Vec<Arc<UserProfile>>> {
        let room = match self {
            RoomEntry::Active(_) => return None,
            RoomEntry::Vacant(v) => v,
        };

        let mut replacement = ActiveRoom {
            room_id: room.room_id,
            name: CompactString::new(""),
            master,
            password,
            hint,
            users: Vec::new(),
        };

        let mut on_hold = Vec::new();
        mem::swap(&mut room.name, &mut replacement.name);
        mem::swap(&mut room.on_hold, &mut on_hold);

        *self = RoomEntry::Active(replacement);
        Some(on_hold)
    }

    fn unwrap_active_mut(&mut self) -> &mut ActiveRoom {
        match self {
            RoomEntry::Active(x) => x,
            RoomEntry::Vacant(_) => unreachable!(),
        }
    }
}

// The Option is None only if the room is destroyed
#[derive(Clone)]
pub struct Room(Arc<Mutex<Option<RoomEntry>>>);

impl Room {
    pub fn new(name: CompactString, room_id: RoomId) -> Self {
        Room(Arc::new(Mutex::new(Some(RoomEntry::new_vacant(
            name, room_id,
        )))))
    }
}

impl PartialEq for Room {
    fn eq(&self, other: &Self) -> bool {
        Arc::ptr_eq(&self.0, &other.0)
    }
}

pub enum RoomRenameResult {
    ServerError,
    NameTaken,
    Renamed,
}

pub struct RoomRegistry {
    rooms: DashMap<CompactString, Room>,
    rooms_created: AtomicU64,
    rooms_destroyed: AtomicU64,
}

impl RoomRegistry {
    pub fn new() -> RoomRegistry {
        RoomRegistry {
            rooms: DashMap::new(),
            rooms_created: AtomicU64::new(1),
            rooms_destroyed: AtomicU64::new(1),
        }
    }

    pub fn registry_size(&self) -> usize {
        let created = self.rooms_created.load(Ordering::Relaxed);
        let destroyed = self.rooms_destroyed.load(Ordering::Relaxed);
        created.wrapping_sub(destroyed) as usize
    }

    fn alloc_room_id(&self) -> RoomId {
        let id = match self.rooms_created.fetch_add(1, Ordering::Relaxed) {
            0 => {
                self.rooms_destroyed.fetch_add(1, Ordering::Relaxed);
                self.rooms_created.fetch_add(1, Ordering::Relaxed)
            }
            x => x,
        };
        // Can room_id still really be 0? unlikely, but yes!
        // If we create one room per millisecond, the counter will last us for 500 million years, and then it will wrap to 0.
        // I think in 500 million years this code will be pretty obsolete
        // If such a case happens the second if will get another value, the only case in which we get another 0 is if
        // the program is open for 500 million years, we get a 0, the processor stops the program for another 500 million years and we get another 0.
        // Pretty unlikely don't you think?
        RoomId(
            NonZeroU64::new(id)
                .expect("Either you are the unluckiest pal on earth or your RAM is fucked up"),
        )
    }

    fn entry_from_name<'a>(&'_ self, room_name: &CompactString) -> Room {
        let entry = self.rooms.entry(room_name.clone());
        let entry = match entry {
            Entry::Occupied(x) => x.into_ref(),
            Entry::Vacant(v) => {
                let name = v.key().clone();
                v.insert(Room::new(name, self.alloc_room_id()))
            }
        };

        entry.clone()
    }

    fn lock_room_or_insert<'a>(
        &self,
        room: &'a Room,
        name: CompactString,
    ) -> MappedMutexGuard<'a, RoomEntry> {
        MutexGuard::map(room.0.lock(), |room| {
            room.get_or_insert_with(|| RoomEntry::new_vacant(name, self.alloc_room_id()))
        })
    }

    fn destroy<'a>(&self, room: Option<RoomEntry>) -> impl Future<Output = ()> {
        let mut name = CompactString::new("");

        let to_notify = match room {
            Some(RoomEntry::Active(mut x)) => {
                mem::swap(&mut name, &mut x.name);

                x.destroy()
            },
            Some(RoomEntry::Vacant(mut x)) => {
                mem::swap(&mut name, &mut x.name);
                Vec::new()
            },
            None => panic!("Room already destroyed"),
        };

        // Always lock dashmap before room!
        // If we kept the room lock and tryed to lock the hashmap this would result in a possible deadlock
        self.rooms.remove_if(&name, |_k, v| v.0.lock().is_none());
        self.rooms_destroyed.fetch_add(1, Ordering::Relaxed);

        async {
            for user in to_notify {
                let _ = user.mailbox.send(MailboxMessage::RoomDestroyed).await;
            }
        }
    }

    pub async fn join_room(
        &self,
        room_name: CompactString,
        user: Arc<UserProfile>,
        creds: UserCredentials,
    ) -> (Room, RoomId, RoomJoinNext) {
        let user_id = user.user_id;
        trace!("join_room room={room_name} user={user_id:?}");
        let (entry, id, next) = {
            let entry = self.entry_from_name(&room_name);
            let mut room = self.lock_room_or_insert(&entry, room_name);

            let (id, next) = match &mut *room {
                RoomEntry::Active(room) => {
                    (room.room_id, RoomJoinNext::Done(room.join(user, creds)))
                }
                RoomEntry::Vacant(vacant) => {
                    user.set_current_room(Some(vacant.room_id));
                    vacant.on_hold.push(user);
                    (vacant.room_id, RoomJoinNext::OnHold)
                }
            };
            drop(room);
            (entry, id, next)
        };

        // Send messages
        if let RoomJoinNext::Done(Ok(data)) = &next {
            match rmp_serde::to_vec_named(&ServerOutbound::Event(ServerEvent::UserJoin { id: user_id })) {
                Ok(x) => {
                    for user in data.others.iter() {
                        let _ = user
                            .mailbox
                            .send(MailboxMessage::DirectMessage(x.clone()))
                            .await;
                    }
                    let _ = data
                        .master
                        .mailbox
                        .send(MailboxMessage::DirectMessage(x))
                        .await;
                }
                Err(e) => {
                    error!("Error encoding UserJoin: {e}");
                }
            };
        }
        (entry, id, next)
    }

    pub async fn release_hold_users(users: Vec<Arc<UserProfile>>) {
        for profile in users {
            profile.set_current_room(None);
            // ignore sending errors
            let _ = profile
                .mailbox
                .send(MailboxMessage::RoomCreated)
                .await;
        }
    }

    pub async fn create_room(
        &self,
        name: CompactString,
        user: &Arc<UserProfile>,
        psw: CompactString,
        hint: CompactString,
    ) -> Result<(Room, RoomId), RoomCreateError> {
        trace!("create_room name={name} user={:?}", user.user_id);
        let (entry, on_hold, room_id) = {
            let entry = self.entry_from_name(&name);
            let mut room = self.lock_room_or_insert(&entry, name);

            let on_hold = match room.upgrade(user.clone(), psw, hint) {
                Some(x) => x,
                None => return Err(RoomCreateError::RoomAlreadyPresent),
            };
            let aroom = room.unwrap_active_mut();

            let room_id = aroom.room_id;

            drop(room);
            (entry, on_hold, room_id)
        };

        user.set_current_room(Some(room_id));
        Self::release_hold_users(on_hold).await;

        Ok((entry, room_id))
    }

    pub async fn leave_room(&self, room: Room, id: ClientId) {
        trace!("leave_room {id:?}");
        let (to_notify, to_destroy) = {
            let mut entry = room.0.lock();
            let room = match &mut *entry {
                Some(x) => x,
                None => return,
            };
            let mut destroy = None;
            let res = match &mut *room {
                RoomEntry::Active(room) => {
                    if room.master.user_id != id {
                        Some(room.leave(id))
                    } else {
                        destroy = Some(entry.take());
                        None
                    }
                }
                RoomEntry::Vacant(v) => {
                    let index = v.on_hold.iter().position(|x| x.user_id == id);
                    if let Some(index) = index {
                        v.on_hold.remove(index);
                    }
                    if v.on_hold.is_empty() {
                        destroy = Some(entry.take());
                    }
                    None
                }
            };

            (res, destroy)
        };

        if let Some(entry) = to_destroy {
            self.destroy(entry).await;
        }

        let to_notify = to_notify.unwrap_or(Vec::new());
        if !to_notify.is_empty() {
            let mex = ServerOutbound::Event(ServerEvent::UserLeave { id });
            let data = match rmp_serde::to_vec_named(&mex) {
                Ok(x) => x,
                Err(e) => {
                    error!("Error creating UserLeave message: {e}");
                    return;
                }
            };

            for user in to_notify {
                let _ = user
                    .mailbox
                    .send(MailboxMessage::DirectMessage(data.clone()))
                    .await;
            }
        }
    }

    pub async fn rename_room(&self, room: &Room, new_name: CompactString) -> RoomRenameResult {
        trace!("rename_room {new_name}");

        // Already generate message (so we can fail early if something goes wrong)
        let mex = ServerOutbound::Event(ServerEvent::RoomRenamed {
            name: new_name.clone(),
        });
        let data = match rmp_serde::to_vec_named(&mex) {
            Ok(x) => x,
            Err(e) => {
                error!("Error creating RoomRenamed message: {e}");
                return RoomRenameResult::ServerError;
            }
        };

        // Get old name and drop the lock (remember: lock order is dashmap THEN room)
        let old_name = match &*room.0.lock() {
            Some(RoomEntry::Active(x)) => x.name.clone(),
            _ => {
                error!("Trying to rename a non-active room");
                return RoomRenameResult::ServerError;
            }
        };
        //trace!("old_name: {old_name}");

        if old_name == new_name {
            return RoomRenameResult::Renamed;
        }

        // What is "rename"? Baby don't overthink shit, oh no.
        // Ok, we have a dashmap {name => room} where room is an Arc to the real room.
        // We can simply write the old room in the new space atomically (if it is not yet occupied)
        // then, if everything went well, remove the old entry.
        // But Snowy! This is the obvious thing to do, why are you writing it down?
        // Ohhh, of course it's obvious, I didn't almost end up writing a PR for an atomic renaming
        // that didn't even cover all edge cases, yes, yes...
        let entry = self.rooms.entry(new_name.clone());
        let on_hold = match entry {
            Entry::Occupied(mut occ) => {
                // Little change to the plan: the room might also be "vacant" with some
                // users that are on_hold, if that's the case let them join!
                let mut locked = occ.get().0.lock();
                let on_hold = match &mut *locked {
                    // Active => Occupied
                    Some(RoomEntry::Active(_)) => return RoomRenameResult::NameTaken,
                    // Vacant => Someone was waiting for it to be used
                    Some(RoomEntry::Vacant(vac)) => vac.on_hold.drain(..).collect(),
                    // None => should never happen, it means that the room is being removed
                    None => Vec::new(),
                };
                // Remove the old room (Vacant)
                *locked = None;
                drop(locked);
                // Put the new room (well, a copy of it)
                occ.insert(room.clone());
                on_hold
            },
            Entry::Vacant(v) => {
                // Free real estate! (easy path)
                v.insert(room.clone());
                Vec::new()
            },
        };
        // Ok, now we have a foot in both spaces
        self.rooms.remove(&old_name);
        // Not anymore :3

        // Change room name
        match &mut *room.0.lock() {
            Some(RoomEntry::Active(x)) => x.name = new_name,
            _ => {
                error!("Room changed state while renaming");
                return RoomRenameResult::ServerError;
            }
        };
        // Notify `on_hold`ers
        Self::release_hold_users(on_hold).await;

        // Notify players
        let to_notify: Vec<_> = {
            let mut lock = room.0.lock();
            let aroom = match &mut *lock {
                Some(RoomEntry::Active(x)) => x,
                _ => return RoomRenameResult::Renamed,
            };
            aroom
                .users
                .iter()
                .map(|(profile, _net)| profile.clone())
                .chain(iter::once(aroom.master.clone()))
                .collect()
        };

        for u in to_notify {
            let _ = u
                .mailbox
                .send(MailboxMessage::DirectMessage(data.clone()))
                .await;
        }

        RoomRenameResult::Renamed
    }

    pub async fn edit_password(&self, room: &Room, password: CompactString, hint: CompactString) {
        trace!("edit_password {password} {hint}");

        let r = &mut *room.0.lock();
        match r {
            Some(RoomEntry::Active(x)) => {
                x.password = password;
                x.hint = hint;
            },
            _ => {},
        }
    }
}

#[cfg(test)]
mod tests {
    use assert_matches::assert_matches;

    use super::*;

    use rand::{thread_rng, Rng};
    use tokio::{
        sync::mpsc::{self, error::TryRecvError},
        test,
    };

    fn create_user() -> (mpsc::Receiver<MailboxMessage>, Arc<UserProfile>) {
        let (mailbox, sender) = mpsc::channel(16);
        let user_id = ClientId(thread_rng().gen());
        (sender, Arc::new(UserProfile::new(user_id, mailbox)))
    }

    #[test]
    pub async fn test_one_user_one_room() {
        let reg = RoomRegistry::new();

        let (mut mail1, user1) = create_user();

        let (room, _room_id) = reg
            .create_room("room1".into(), &user1, "".into(), "".into())
            .await
            .unwrap();
        assert_eq!(
            user1.current_room().expect("No current_room set"),
            room.0
                .lock()
                .as_mut()
                .expect("Returned an empty room")
                .unwrap_active_mut()
                .room_id
        );
        assert_eq!(mail1.try_recv().unwrap_err(), TryRecvError::Empty);

        assert_eq!(reg.registry_size(), 1);
        reg.leave_room(room.clone(), user1.user_id).await;
        assert!(user1.current_room().is_none());
        assert_eq!(mail1.try_recv().unwrap_err(), TryRecvError::Empty);
        assert!(room.0.lock().is_none());
        assert_eq!(reg.registry_size(), 0);
    }

    #[test]
    pub async fn test_user_on_hold_no_psw() {
        let reg = RoomRegistry::new();

        let (mut mail1, user1) = create_user();
        let (mut _mail2, user2) = create_user();

        let (_room1, roomid1, res) = reg.join_room("room2".into(), user1.clone(), UserCredentials { net: RoomNetworkType::Mesh, psw: "".into() }).await;
        assert_matches!(res, RoomJoinNext::OnHold);
        assert_eq!(user1.current_room(), Some(roomid1));
        assert_eq!(mail1.try_recv().unwrap_err(), TryRecvError::Empty);

        let (room, _room_id) = reg
            .create_room("room2".into(), &user2, "".into(), "".into())
            .await
            .unwrap();
        match mail1.try_recv().unwrap() {
            MailboxMessage::RoomCreated => {},
            _ => panic!("Received wrong message"),
        }
        assert!(user1.current_room().is_none());

        reg.leave_room(room.clone(), user2.user_id).await;
        assert!(room.0.lock().is_none());

        assert_eq!(mail1.try_recv().unwrap_err(), TryRecvError::Empty);
    }

    #[test]
    pub async fn test_user_on_hold_with_psw() {
        let reg = RoomRegistry::new();

        let (mut mail1, user1) = create_user();
        let (mut mail2, user2) = create_user();

        let (_room1, roomid1, res) = reg.join_room("room".into(), user1.clone(), UserCredentials { net: RoomNetworkType::Mesh, psw: "psw1".into() }).await;
        assert_matches!(res, RoomJoinNext::OnHold);
        assert_eq!(user1.current_room(), Some(roomid1));
        assert_eq!(mail1.try_recv().unwrap_err(), TryRecvError::Empty);

        let (room, _room_id) = reg
            .create_room("room".into(), &user2, "psw2".into(), "this is hint".into())
            .await
            .unwrap();
        match mail1.try_recv().unwrap() {
            MailboxMessage::RoomCreated => {},
            _ => panic!("Received wrong message"),
        }
        assert_eq!(user1.current_room(), None);

        let (_room1, _roomid1, res) = reg.join_room("room".into(), user1.clone(), UserCredentials { net: RoomNetworkType::Mesh, psw: "psw2".into() }).await;
        let res = assert_matches!(res, RoomJoinNext::Done(x) => x).unwrap();
        assert_eq!(res.master.user_id, user2.user_id);
        assert!(res.others.is_empty());
        assert_eq!(user1.current_room(), Some(roomid1));
        assert_eq!(mail1.try_recv().unwrap_err(), TryRecvError::Empty);

        reg.leave_room(room.clone(), user1.user_id).await;
        assert!(user1.current_room().is_none());
        assert!(user2.current_room().is_some());
        assert!(room.0.lock().is_some());
        assert_eq!(mail1.try_recv().unwrap_err(), TryRecvError::Empty);

        assert_matches!(mail2.try_recv().unwrap(), MailboxMessage::DirectMessage(_));
        assert_matches!(mail2.try_recv().unwrap(), MailboxMessage::DirectMessage(_));
        assert_matches!(mail2.try_recv().unwrap_err(), TryRecvError::Empty);
    }
}
