use std::mem::swap;

use nalgebra::{Point2, center, distance};
use specs::{prelude::*, System, Write};

use crate::{graphics::camera::Camera, input::pointer::{Pointers, PointerButtons}};

enum Action {
    None,
    Pan(Point2<f32>),
    Zoom(Point2<f32>, Point2<f32>),
}

pub struct PanZoomSystem {
    action: Action,
}

impl PanZoomSystem {
    pub fn new() -> Self {
        PanZoomSystem {
            action: Action::None,
        }
    }

    fn zoom(&mut self, new0: Point2<f32>, new1: Point2<f32>, camera: &mut Camera) {
        let mut old_action = Action::Zoom(new0, new1);
        swap(&mut old_action, &mut self.action);

        let (old0, old1) = match old_action {
            Action::Zoom(x, y) => (x, y),
            _ => return,
        };

        let old_dist = distance(&old0, &old1);
        let new_dist = distance(&new0, &new1);

        let c: Point2<f32> = center(
            &center(&old0, &old1),
            &center(&new0, &new1)
        );

        let zoom = new_dist / old_dist;

        camera.zoom(zoom, c);
    }

    fn pan(&mut self, new: Point2<f32>, camera: &mut Camera) {
        let mut old_action = Action::Pan(new);
        swap(&mut old_action, &mut self.action);

        let old = match old_action {
            Action::Pan(x) => x,
            _ => return,
        };
        let delta = new - old;
        
        camera.pan(delta);
    }
}

impl<'a> System<'a> for PanZoomSystem {
    type SystemData = (
        Read<'a, Pointers>,
        Write<'a, Camera>,
    );

    fn run(&mut self, (pointers, mut camera): Self::SystemData) {
        let mut active_pointers = pointers.0.iter()
                .filter(|x| x.buttons.contains(PointerButtons::MAIN));

        let ptr1 = match active_pointers.next() {
            Some(x) => x,
            None => {
                self.action = Action::None;
                return;
            },
        };

        let ptr2 = active_pointers.next();

        if ptr2.is_some() && active_pointers.next().is_some() {
            return;
        }

        if let Some(ptr2) = ptr2 {
            // Zoom (two touch)
            self.zoom(ptr1.pos, ptr2.pos, &mut camera);
        } else {
            self.pan(ptr1.pos, &mut camera);
        }
    }
}

