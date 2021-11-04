use specs::{Component, VecStorage, World, WorldExt};

use crate::Vec2;

type Color = i32;

#[derive(Component)]
#[storage(VecStorage)]
pub struct RenderBodyPoint {
    pub offset: Vec2,
    pub color: Color, 
    pub size: f32,
}

#[derive(Component)]
#[storage(VecStorage)]
pub struct RenderBodyLine {
    pub offset: Vec2,
    pub color: Color, 
    pub vec: Vec2,
    pub width: f32,
}

/*#[derive(Component)]
#[storage(VecStorage)]
pub struct RenderBodyText {
    offset: Vec2,
    text: String,
}*/

pub fn register_components(world: &mut World) {
    world.register::<RenderBodyPoint>();
    world.register::<RenderBodyLine>();
}
