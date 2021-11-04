use nalgebra::Point2;
use specs::{prelude::*, shrev::EventChannel};
use bitflags::bitflags;

use crate::{console_warn};

type PointerId = i32;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PointerType {
    Mouse,
    Pen,
    Touch,
    Unknown,
}

impl From<&str> for PointerType {
    fn from(x: &str) -> Self {
        match x {
            "mouse" => Self::Mouse,
            "pen" => Self::Pen,
            "touch" => Self::Touch,
            _ => Self::Unknown,
        }
    }
}

bitflags! {
    pub struct PointerButtons: u8 {
        const MAIN        = 0b000001;
        const AUXILIARY   = 0b000010;// Middle
        const SECONDARY   = 0b000100;// Right
        const BACK        = 0b001000;
        const FORWARD     = 0b010000;
        const ERASER      = 0b100000;
    }
}

#[derive(Clone, Debug)]
pub struct PointerData {
    pub id: PointerId,
    pub ptype: PointerType,
    pub buttons: PointerButtons,
    pub pos: Point2<f32>,
    pub is_primary: bool,
}

#[derive(Clone, Debug, Default)]
pub struct Pointers(pub Vec<PointerData>);

// events

#[derive(Clone, Debug)]
pub struct PointerEvent {
    pub data: PointerData,
    pub ptype: PointerEventType
}

#[derive(Copy, Clone, Debug)]
pub enum PointerEventType {
    Enter, Leave, Update
}

pub fn setup(world: &mut World) {
    world.insert(EventChannel::<PointerEvent>::new());
    world.insert(Pointers::default());
}

pub struct PointerButtonApplier;

impl PointerButtonApplier {
    /*pub fn enter(world: &mut World, btn: PointerData) {
        let id = btn.id;

        let mut pointers = world.write_resource::<Pointers>();
        if pointers.0.iter()
                .find(|x| x.id == id)
                .is_some() {
            console_warn!("Error on pointer enter: pointer with the same ID already present");
            return;
        }
        pointers.0.push(btn.clone());

        let mut events = world.write_resource::<EventChannel<PointerEvent>>();
        events.single_write(PointerEvent {
            data: btn,
            ptype: PointerEventType::Enter,
        });
    }*/

    pub fn leave(world: &mut World, id: PointerId) {
        let mut pointers = world.write_resource::<Pointers>();
        let i = match pointers.0.iter().position(|x| x.id == id) {
            Some(i) => i,
            None => {
                console_warn!("Error on pointer leave: cannot find pointer id");
                return;
            }
        };

        let x = pointers.0.remove(i);
        let mut events = world.write_resource::<EventChannel<PointerEvent>>();
        events.single_write(PointerEvent {
            data: x,
            ptype: PointerEventType::Leave,
        });
    }

    pub fn update(world: &mut World, btn: PointerData) {
        let mut pointers = world.write_resource::<Pointers>();

        let event = match pointers.0.iter().position(|x| x.id == btn.id) {
            Some(i) => {
                pointers.0[i] = btn.clone();
                PointerEventType::Update
            },
            None => {
                pointers.0.push(btn.clone());
                PointerEventType::Enter
            }
        };
        let mut events = world.write_resource::<EventChannel<PointerEvent>>();
        events.single_write(PointerEvent {
            data: btn,
            ptype: event
        });
    }
}