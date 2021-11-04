use nalgebra::Vector2;
use specs::{prelude::*, shrev::EventChannel};

use crate::{graphics::camera::Camera, input::keyboard::{KeyState, KeyboardEvent}};
use bitflags::bitflags;

bitflags! {
    #[derive(Default)]
    struct MoveDirection: u8 {
        const UP    = 0b0001;
        const DOWN  = 0b0010;
        const LEFT  = 0b0100;
        const RIGHT = 0b1000;
    }
}

pub struct KeyboardSystem {
    keyboard_reader: ReaderId<KeyboardEvent>,
    dir: MoveDirection,
}


impl KeyboardSystem {
    pub fn new(world: &mut World) -> Self {
        KeyboardSystem {
            keyboard_reader: world.write_resource::<EventChannel<KeyboardEvent>>().register_reader(),
            dir: MoveDirection::empty(),
        }
    }

    fn parse_key(key: &str) -> MoveDirection{
        match key {
            "W" => MoveDirection::UP,
            "S" => MoveDirection::DOWN,
            "A" => MoveDirection::LEFT,
            "D" => MoveDirection::RIGHT,
            _ => MoveDirection::empty()
        }
    }

    fn apply_vel(&self, camera: &mut Camera) {
        const VEL: f32 = 10.0;

        let mut dir: Vector2<f32> = Vector2::zeros();

        if self.dir.contains(MoveDirection::UP) {
            dir.y += 1.0;
        }
        if self.dir.contains(MoveDirection::DOWN) {
            dir.y -= 1.0;
        }
        if self.dir.contains(MoveDirection::LEFT) {
            dir.x -= 1.0;
        }
        if self.dir.contains(MoveDirection::RIGHT) {
            dir.x += 1.0;
        }

        camera.pos += dir * VEL;
    }
}

impl<'a> System<'a> for KeyboardSystem {
    type SystemData = (
        Write<'a, Camera>,
        Read<'a, EventChannel<KeyboardEvent>>,
    );

    fn run(&mut self, (mut camera, keyboard_events): Self::SystemData) {

        // Update direction
        for event in keyboard_events.read(&mut self.keyboard_reader) {
            let dir = Self::parse_key(&event.key.to_uppercase());
            if event.state == KeyState::DOWN {
                self.dir.insert(dir);
            } else {
                self.dir.remove(dir);
            }
        }
        //self.graphics.camera.rotate(Deg(dx as f32 * PREC), Deg(dy as f32 * PREC));
        // Update rotation

        self.apply_vel(&mut camera);
    }
}