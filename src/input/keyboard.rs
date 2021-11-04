use specs::{prelude::*, shrev::EventChannel};


#[derive(Debug, PartialEq)]
pub enum KeyState {
    UP, DOWN,
}

#[derive(Debug)]
pub struct KeyboardEvent {
    pub state: KeyState,
    pub key: String,
}

pub fn setup(world: &mut World) {
    world.insert(EventChannel::<KeyboardEvent>::new());
}

