use std::time::Duration;

use specs::{prelude::*, Component};
use wasm_bindgen::JsValue;
use web_sys::HtmlCanvasElement;
use crate::{Vec2, graphics::{self, GraphicContext, RenderSystem}};
use crate::utils::RefClone;
use crate::input;
use crate::systems::{PanZoomSystem, KeyboardSystem};

#[derive(Debug, Default)]
pub struct DeltaTime(pub Duration);


#[derive(Component, Debug, Clone, Copy, PartialEq)]
#[storage(VecStorage)]
pub struct BodyLocation {
    pub loc: Vec2,
}


pub struct App {
    pub world: World,
    pub dispatcher: Dispatcher<'static, 'static>,
    pub canvas: HtmlCanvasElement,
}

impl App {
    pub fn create() -> Result<App, JsValue> {
        let mut world = World::new();
        world.insert(DeltaTime(Duration::from_nanos(0)));
        world.register::<BodyLocation>();
        input::setup(&mut world);
        graphics::component::register_components(&mut world);

        let graphics = GraphicContext::from_canvas("canvas")?;
        let canvas = graphics.canvas.ref_clone();
        let render_system = RenderSystem::new(graphics, &mut world);

        let mut dispatcher = DispatcherBuilder::new()
        //    .with(PlayerMoveSystem::new(&mut world), "player_move", &[])
            .with(PanZoomSystem::new(), "pan_zoom", &[])
            .with(KeyboardSystem::new(&mut world), "player_move", &[])
            .with_thread_local(render_system)
            .build();


        dispatcher.setup(&mut world);

        world.create_entity()
            .with(BodyLocation { loc: Vec2::new(0.0, 0.0) })
            .with(graphics::component::RenderBodyPoint {
                offset: Vec2::default(),
                color: 0,
                size: 1.0,
            })
            .build();
            
        world.create_entity()
            .with(BodyLocation { loc: Vec2::new(-1000.0, 1000.0) })
            .with(graphics::component::RenderBodyPoint {
                offset: Vec2::default(),
                color: 0,
                size: 1.0,
            })
            .build();

        Ok(App {
            world,
            dispatcher,
            canvas,
        })
    }

    pub fn update(&mut self, delta: Duration) {
        {// Update delta
            let deltatime = self.world.get_mut::<DeltaTime>().unwrap();
            deltatime.0 = delta
        }

        self.dispatcher.dispatch(&self.world);
        self.world.maintain();
    }
}