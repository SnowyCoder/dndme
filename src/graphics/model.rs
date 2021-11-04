use js_sys::Float32Array;
use web_sys::{WebGlRenderingContext, WebGlVertexArrayObject};
use crate::graphics::GraphicContext;

#[derive(Clone)]
pub struct RenderModel {
    pub vao: WebGlVertexArrayObject,
    pub triangle_count: u32,
}

impl RenderModel {
    pub fn new(ctx: &GraphicContext, vertices: &[f32]) -> RenderModel {
        let vao: WebGlVertexArrayObject = ctx.vao_ext.create_vertex_array_oes().expect("failed to create VAO");
        ctx.vao_ext.bind_vertex_array_oes(Some(&vao));

        let buffer = ctx.gl.create_buffer().expect("failed to create buffer");
        ctx.gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(&buffer));

        // Note that `Float32Array::view` is somewhat dangerous (hence the
        // `unsafe`!). This is creating a raw view into our module's
        // `WebAssembly.Memory` buffer, but if we allocate more pages for ourself
        // (aka do a memory allocation in Rust) it'll cause the buffer to change,
        // causing the `Float32Array` to be invalid.
        //
        // As a result, after `Float32Array::view` we have to be very careful not to
        // do any memory allocations before it's dropped.
        unsafe {
            let vert_array = Float32Array::view(vertices);

            ctx.gl.buffer_data_with_array_buffer_view(
                WebGlRenderingContext::ARRAY_BUFFER,
                &vert_array,
                WebGlRenderingContext::STATIC_DRAW,
            );
        }

        ctx.gl.enable_vertex_attrib_array(ctx.position_loc);
        ctx.gl.vertex_attrib_pointer_with_i32(ctx.position_loc, 2, WebGlRenderingContext::FLOAT, false, 0, 0);


        ctx.vao_ext.bind_vertex_array_oes(None);

        RenderModel {
            vao,
            triangle_count: (vertices.len() / 2) as u32
        }
    }
}