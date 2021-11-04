use wasm_bindgen::JsValue;
use web_sys::console;

pub fn set_panic_hook() {
    // When the `console_error_panic_hook` feature is enabled, we can call the
    // `set_panic_hook` function at least once during initialization, and then
    // we will get better error messages if our code ever panics.
    //
    // For more details see
    // https://github.com/rustwasm/console_error_panic_hook#readme
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

pub trait RefClone {
    fn ref_clone(&self) -> Self;
}

impl<T: AsRef<JsValue> + From<JsValue>> RefClone for T {
    fn ref_clone(&self) -> Self {
        let jsref: &JsValue = self.as_ref();
        let jsval: JsValue = jsref.into();
        let tval: T = jsval.into();
        tval
    }
}

#[macro_export]
macro_rules! console_log {
    ($($t:tt)*) => (web_sys::console::log_1(&format_args!($($t)*).to_string().into()))
}
#[macro_export]
macro_rules! console_warn {
    ($($t:tt)*) => (web_sys::console::warn_1(&format_args!($($t)*).to_string().into()))
}

pub struct Timer<'a> {
    name: &'a str,
}

impl<'a> Timer<'a> {
    pub fn new(name: &'a str) -> Timer<'a> {
        console::time_with_label(name);
        Timer { name }
    }
}

impl<'a> Drop for Timer<'a> {
    fn drop(&mut self) {
        console::time_end_with_label(self.name);
    }
}