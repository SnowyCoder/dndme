import { WebApp } from "dndme";

let app = WebApp.create();

let canvas = document.getElementById("canvas");

// TODO: https://developers.google.com/web/fundamentals/native-hardware/fullscreen/

function pointer_update(e) {
    e.preventDefault()
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    app.on_pointer_update(e, x, y);
}

canvas.onpointerenter = pointer_update;
canvas.onpointerdown = pointer_update;
canvas.onpointermove = pointer_update;
canvas.onpointerup = pointer_update;

canvas.onpointerleave = function (e) {
    app.on_pointer_leave(e);
}

window.onkeyup = function (e) {
    app.on_key_up(e);
};

window.onkeydown = function (e) {
    console.log("Key down")
    app.on_key_down(e);
};

canvas.onwheel = function (e) {
    e.preventDefault()
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    app.on_mouse_wheel(e.deltaY, x, y);
}

function onMouseMove(e) {
    app.on_mouse_move(e.movementX, e.movementY);
}

function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    app.on_resize();
}

function update() {
    app.update(performance.now());
    requestAnimationFrame(update);
}

requestAnimationFrame(update);
