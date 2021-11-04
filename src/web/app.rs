use std::{rc::Rc, time::Duration};
use std::cell::RefCell;

use nalgebra::Point2;
use specs::WorldExt;
use specs::shrev::EventChannel;
use wasm_bindgen::{prelude::*, JsValue};
use web_sys::{KeyboardEvent as WebKeyboardEvent, PointerEvent};

use crate::{console_log, graphics::camera::Camera, input::{keyboard::{KeyState, KeyboardEvent}, pointer::{PointerButtonApplier, PointerButtons, PointerData, PointerType}}};
use crate::app::App;
use crate::utils;
use crate::input::ResizeEvent;

#[wasm_bindgen]
pub struct WebApp {
    app: Rc<RefCell<App>>,
    last_time: u32,
}

#[wasm_bindgen]
impl WebApp {
    pub fn create() -> Result<WebApp, JsValue> {
        utils::set_panic_hook();
        console_log!("Starting up");

        let app = App::create()?;

        let mut webapp = WebApp{
            app: Rc::new(RefCell::new(app)),
            last_time: 0,
        };

        webapp.on_resize();

        console_log!("Started");

        Ok(webapp)
    }

    pub fn on_pointer_update(&mut self, event: PointerEvent, x: f32, y: f32) {
        let btn = pointer_convert(&event, x, y);
        let world = &mut self.app.borrow_mut().world;
        PointerButtonApplier::update(world, btn);
    }

    pub fn on_pointer_leave(&mut self, pid: i32) {
        let world = &mut self.app.borrow_mut().world;

        PointerButtonApplier::leave(world, pid);
    }

    pub fn on_resize(&mut self) {
        let app = self.app.borrow_mut();
        let width = app.canvas.client_width() as u32;
        let height = app.canvas.client_height() as u32;
        app
            .world
            .write_resource::<EventChannel<ResizeEvent>>()
            .single_write(ResizeEvent {
                width, height
            });
    }

    pub fn on_mouse_wheel(&mut self, val: f32, x: f32, y: f32) {
        let delta = 1.0 - val.signum() * 0.1;
        let app = self.app.borrow_mut();
        app
            .world
            .write_resource::<Camera>()
            .zoom(delta, Point2::new(x, y));
    }

    pub fn update(&mut self, now: u32) {
        //Timer::new("update");
        if self.last_time == 0 {
            self.last_time = now;
            return;
        }
        let deltatime = now - self.last_time;

        self.app.borrow_mut().update(Duration::from_millis(deltatime as u64));

        self.last_time = now;
    }

    pub fn on_key_up(&mut self, e: &WebKeyboardEvent) {
        self.app
            .borrow_mut()
            .world
            .write_resource::<EventChannel<KeyboardEvent>>()
            .single_write(KeyboardEvent {
                state: KeyState::UP,
                key: e.key()
            })
    }

    pub fn on_key_down(&mut self, e: &WebKeyboardEvent) {
        self.app
            .borrow_mut()
            .world
            .write_resource::<EventChannel<KeyboardEvent>>()
            .single_write(KeyboardEvent {
                state: KeyState::DOWN,
                key: e.key()
            })
    }
}

pub fn pointer_convert(pev: &PointerEvent, x: f32, y: f32) -> PointerData {
    let ptype = pev.pointer_type();
    let buttons = pev.buttons();

    PointerData {
        id: pev.pointer_id(),
        ptype: PointerType::from(&ptype as &str),
        buttons: PointerButtons::from_bits_truncate(buttons as u8),
        pos: Point2::<f32>::new(x, y),
        is_primary: pev.is_primary(),
    }
}
