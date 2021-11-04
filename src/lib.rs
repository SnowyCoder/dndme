mod utils;
mod app;
mod graphics;
mod input;
mod web;
mod systems;

use wasm_bindgen::prelude::*;
use crate::utils::set_panic_hook;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

type Vec2 = nalgebra::Vector2<f32>;

#[wasm_bindgen]
pub fn start() -> Result<(), JsValue> {
    set_panic_hook();

    Ok(())
}
