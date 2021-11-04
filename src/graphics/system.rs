use nalgebra::{Similarity2};
use specs::{Read, ReadStorage, ReaderId, System, World, WorldExt, Write};
use web_sys::{WebGlRenderingContext};
use crate::{app::BodyLocation, graphics::component::RenderBodyPoint};
use crate::graphics::GraphicContext;
use crate::input::ResizeEvent;
use specs::shrev::EventChannel;

use super::{camera::Camera, model::RenderModel};

const VERTICES: [f32; 12] = [
    -1.0, -1.0,
    -1.0,  1.0,
     1.0, -1.0,

     1.0, -1.0,
    -1.0,  1.0,
     1.0,  1.0,
];

pub struct RenderSystem {
    gctx: GraphicContext,
    point_model: RenderModel,
    resize_reader: ReaderId<ResizeEvent>,
}

impl RenderSystem {
    pub fn new(graphics: GraphicContext, world: &mut World) -> RenderSystem {
        let model = RenderModel::new(&graphics, &VERTICES);

        RenderSystem {
            gctx: graphics,
            point_model: model,
            resize_reader: world.write_resource::<EventChannel<ResizeEvent>>().register_reader(),
        }
    }
}

impl<'a> System<'a> for RenderSystem {
    type SystemData = (
        ReadStorage<'a, BodyLocation>,
        ReadStorage<'a, RenderBodyPoint>,
        Write<'a, Camera>,
        Read<'a, EventChannel<ResizeEvent>>,
    );

    fn run(&mut self, (location, point, mut camera, resize_events): Self::SystemData) {
        for event in resize_events.read(&mut self.resize_reader) {
            self.gctx.on_resize(event.width, event.height);
            camera.on_resize(event.width, event.height);
        }

        let world_to_screen = camera.build_matrix();

        let graphics = &self.gctx;
        let gl = &graphics.gl;
        let vao = &graphics.vao_ext;
        //self.gctx.gl.enable_vertex_attrib_array(0);

        gl.clear_color(0.0, 0.0, 0.0, 1.0);
        gl.clear(WebGlRenderingContext::COLOR_BUFFER_BIT | WebGlRenderingContext::DEPTH_BUFFER_BIT);

        gl.use_program(Some(&self.gctx.program));

        gl.uniform_matrix3fv_with_f32_array(
            Some(&graphics.world_to_screen_loc),
            false,
            world_to_screen.as_slice()
        );

        use specs::Join;

        for (pos, _point) in (&location, &point).join() {
            gl.uniform_matrix3fv_with_f32_array(
                Some(&graphics.model_to_world_loc),
                false,
                Similarity2::new(pos.loc, 0.0, 100.0)
                    .to_homogeneous()
                    .as_slice(),
            );

            vao.bind_vertex_array_oes(Some(&self.point_model.vao));

            gl.draw_arrays(WebGlRenderingContext::TRIANGLES, 0, self.point_model.triangle_count as i32);
            vao.bind_vertex_array_oes(None);
        }
    }
}
