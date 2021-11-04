use wasm_bindgen::JsCast;
use wasm_bindgen::prelude::*;
use web_sys::{HtmlCanvasElement, WebGlRenderingContext, WebGlProgram, WebGlShader, WebGlUniformLocation, OesVertexArrayObject};
use crate::console_log;

pub mod camera;
pub mod component;
mod system;
mod model;

pub use system::RenderSystem;

const VERTEX_SHADER_SRC: &str = r#"attribute vec2 position;

uniform mat3 world_to_screen;
uniform mat3 model_to_world;

void main() {
    // Multiply the position by the matrix.
    gl_Position = vec4(world_to_screen * model_to_world * vec3(position.xy, 1), 1);
}
"#;

const FRAGMENT_SHADER_SRC: &str = r#"
precision mediump float;

void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
"#;

pub struct GraphicContext {
    pub gl: WebGlRenderingContext,
    pub vao_ext: OesVertexArrayObject,
    pub canvas: HtmlCanvasElement,
    program: WebGlProgram,
    position_loc: u32,
    world_to_screen_loc: WebGlUniformLocation,  // view * proj
    model_to_world_loc: WebGlUniformLocation,  // model
}

impl GraphicContext {
    pub fn from_canvas(id: &str) -> Result<GraphicContext, JsValue> {
        let document = web_sys::window().unwrap().document().expect("failed to find document");
        let canvas = document.get_element_by_id(id).expect("failed to find canvas");
        let canvas: web_sys::HtmlCanvasElement = canvas.dyn_into::<HtmlCanvasElement>()?;


        let gl = canvas
            .get_context("webgl")?
            .expect("Cannot create WebGl context")
            .dyn_into::<WebGlRenderingContext>()?;

        let vao_ext: OesVertexArrayObject = gl.get_extension("OES_vertex_array_object")
            .expect("Get OES vao EXT")
            .expect("No OES vao EXT found")
            .unchecked_into();

        let vert_shader = compile_shader(
            &gl,
            WebGlRenderingContext::VERTEX_SHADER,
            VERTEX_SHADER_SRC)?;

        let frag_shader = compile_shader(
            &gl,
            WebGlRenderingContext::FRAGMENT_SHADER,
            FRAGMENT_SHADER_SRC)?;

        let program = link_program(&gl, &vert_shader, &frag_shader)?;
        gl.use_program(Some(&program));

        let position_loc = gl.get_attrib_location(&program, "position") as u32;
        let world_to_screen_loc = gl.get_uniform_location(&program, "world_to_screen").expect("Cannot find uniform world_to_screen");
        let model_to_world_loc = gl.get_uniform_location(&program, "model_to_world").expect("Cannot find uniform model_to_world");

        Ok(GraphicContext {
            gl,
            vao_ext,
            canvas,
            program,
            position_loc,
            world_to_screen_loc,
            model_to_world_loc,
        })
    }

    pub fn on_resize(&mut self, width: u32, height: u32) {
        console_log!("Resized! {} {}", width, height);

        self.canvas.set_width(width);
        self.canvas.set_height(height);

        self.gl.viewport(0, 0, width as i32, height as i32);
    }
}


pub fn compile_shader(
    gl: &WebGlRenderingContext,
    shader_type: u32,
    source: &str,
) -> Result<WebGlShader, String> {
    let shader = gl
        .create_shader(shader_type)
        .expect("Unable to create shader");
    //.ok_or_else(|| String::from("Unable to create shader object"))?;
    gl.shader_source(&shader, source);
    gl.compile_shader(&shader);

    if gl
        .get_shader_parameter(&shader, WebGlRenderingContext::COMPILE_STATUS)
        .as_bool()
        .unwrap_or(false) {
        Ok(shader)
    } else {
        let description = gl
            .get_shader_info_log(&shader)
            .unwrap_or_else(|| String::from("unknown error"));
        Err(format!(
            "cannot compile {} shader, {}",
            if shader_type == WebGlRenderingContext::VERTEX_SHADER { "vertex" } else { "fragment" },
            description
        ))
    }
}

pub fn link_program(
    context: &WebGlRenderingContext,
    vert_shader: &WebGlShader,
    frag_shader: &WebGlShader,
) -> Result<WebGlProgram, String> {
    let program = context
        .create_program()
        .ok_or_else(|| String::from("Unable to create shader object"))?;

    context.attach_shader(&program, vert_shader);
    context.attach_shader(&program, frag_shader);
    context.link_program(&program);

    if context
        .get_program_parameter(&program, WebGlRenderingContext::LINK_STATUS)
        .as_bool()
        .unwrap_or(false) {
        Ok(program)
    } else {
        Err(context
            .get_program_info_log(&program)
            .unwrap_or_else(|| String::from("Unknown error creating program object")))
    }
}


