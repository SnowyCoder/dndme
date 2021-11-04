use core::f32;

use nalgebra::{Matrix3, Point2, Vector2};

use crate::console_log;
#[derive(Debug)]
pub struct Camera {
    pub width: f32,
    pub height: f32,
    pub pos: Point2<f32>,
    pub zoom: f32,
}

impl Camera {
    pub fn new(width: f32, height: f32) -> Camera {
        Camera {
            width, height,
            pos: Point2::new(0.0, 0.0),
            zoom: 1.0,
        }
    }

    pub fn build_matrix(&self) -> Matrix3<f32> {
        let sx = self.zoom / self.width;
        let sy = self.zoom / self.height;
        let tx = -self.pos.x;
        let ty = -self.pos.y;

        // translate THEN scale
        // S(s) * T(t)

        Matrix3::new(
            sx, 0.0, tx*sx,
            0.0, sy, ty*sy,
            0.0, 0.0, 1.0
        )
    }

    #[inline]
    pub fn screen_to_world(&self, point: Point2<f32>) -> Point2<f32> {
        // Note: screen coords are -1 to 1 top-left so we need to invert y and normalize
        //
        let x = (point.coords.x / self.width) * 2.0 - 1.0;
        let y = 1.0 - (point.coords.y / self.height) * 2.0;

        // Real screen to word matrix is the inverse of the one returned in build_matrix
        // (if world to screen is Scale(s) * Trans(-t), screen to word is Trans(t) * Scale(1/s))
        // 1/sx |   0   | tx
        //   0  | 1/sy  | ty
        //   0  |   0   | 1

        // x / sx + tx
        // y / sy + ty
        // with s = camera_zoom / screen_size
        //      t = camera_pos

        self.pos + Vector2::new(
            x * self.width,
            y * self.height
        ) / self.zoom
    }

    pub fn on_resize(&mut self, width: u32, height: u32) {
        self.width = width as f32;
        self.height = height as f32;
    }

    pub fn zoom(&mut self, delta: f32, center: Point2<f32>) {
        let min_scale = 0.05;
        let max_scale = 3.0;

        if (self.zoom < min_scale && delta < 1.0) || (self.zoom > max_scale && delta > 1.0) {
            return;
        }

        // Before scaling adjust the position:
        // Takes the vector that goes from the board position (upper-left) to the cursor.
        // Apply the dScale factor to that vector and find the new board position.
        // Finally, the cursor position plus the vector obtained is the new board position.
        let center = self.screen_to_world(center);

        self.pos = center + (self.pos - center) / delta;
        self.zoom *= delta;
    }

    pub fn pan(&mut self, screen_delta: Vector2<f32>) {
        let world_delta = Vector2::new(
            -screen_delta.x,
            screen_delta.y
        );
        self.pos += world_delta * 2.0 / self.zoom;
    }
}

impl Default for Camera {
    fn default() -> Self {
        Camera::new(920.0, 1080.0)
    }
}

/*#[derive(Debug, Default)]
pub struct CameraFollow(pub Option<Entity>); */
