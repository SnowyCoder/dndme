use specs::{prelude::*, shrev::EventChannel};

pub mod pointer;
pub mod keyboard;

#[derive(Copy, Clone, Debug)]
pub struct ResizeEvent {
    pub width: u32,
    pub height: u32,
}

pub fn setup(world: &mut World) {
    pointer::setup(world);
    keyboard::setup(world);
    
    world.insert(EventChannel::<ResizeEvent>::new());
}
