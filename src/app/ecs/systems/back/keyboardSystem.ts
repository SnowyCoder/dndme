import {System} from "../../system";
import {World} from "../../world";
import {Resource} from "../../resource";

export const KEYBOARD_KEY_UP = 'keyboard_key_up';
export const KEYBOARD_KEY_DOWN = 'keyboard_key_down';

export const KEYBOARD_TYPE = 'keyboard';
export type KEYBOARD_TYPE = typeof KEYBOARD_TYPE;
export interface KeyboardResource extends Resource {
    type: KEYBOARD_TYPE;
    _save: false;
    _sync: false;

    pressedKeys: Set<string>;
    shift: boolean;
    ctrl: boolean;
}

export const WEB_KEYBOARD_TYPE = 'web_keyboard';
export type WEB_KEYBOARD_TYPE = typeof WEB_KEYBOARD_TYPE;
export class WebKeyboardSystem implements System {
    readonly dependencies = [];
    readonly name = WEB_KEYBOARD_TYPE;
    readonly provides = [KEYBOARD_TYPE];

    private world: World;

    private keyDownListener: any;
    private keyUpListener: any;
    private blurListener: any;

    private keyboard: KeyboardResource;

    constructor(world: World) {
        this.world = world;

        this.keyboard = {
            type: KEYBOARD_TYPE,
            _save: false,
            _sync: false,

            pressedKeys: new Set(),
            shift: false,
            ctrl: false,
        } as KeyboardResource;
        this.world.addResource(this.keyboard);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.target instanceof HTMLInputElement) {
            return;
        }
        let edit = {
            shift: event.shiftKey,
            ctrl: event.ctrlKey,
        };
        this.world.editResource(KEYBOARD_TYPE, edit);
        if (event.key) {
            let key = event.key.toLowerCase();
            this.keyboard.pressedKeys.add(key);
            this.world.events.emit(KEYBOARD_KEY_UP, key)
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        let edit = {
            shift: event.shiftKey,
            ctrl: event.ctrlKey,
        };
        this.world.editResource(KEYBOARD_TYPE, edit);

        if (event.key) {
            let key = event.key.toLowerCase();
            if (this.keyboard.pressedKeys.delete(key)) {
                this.world.events.emit(KEYBOARD_KEY_DOWN, key);
            }
        }
    }

    onBlur(event: FocusEvent): void {
        if (this.keyboard.shift || this.keyboard.ctrl) {
            const edit = {
                shift: false, ctrl: false,
            };
            this.world.editResource(KEYBOARD_TYPE, edit);
        }
        let pressedKeys = [...this.keyboard.pressedKeys];
        for (let key of pressedKeys) {
            this.keyboard.pressedKeys.delete(key);
            this.world.events.emit(KEYBOARD_KEY_DOWN, key);
        }
    }

    enable(): void {
        this.keyDownListener = this.onKeyDown.bind(this);
        document.addEventListener('keydown', this.keyDownListener);

        this.keyUpListener = this.onKeyUp.bind(this);
        document.addEventListener('keyup', this.keyUpListener);

        this.blurListener = this.onBlur.bind(this);
        document.addEventListener('blur', this.blurListener);
    }

    destroy(): void {
        document.removeEventListener('keydown', this.keyDownListener);
        document.removeEventListener('keyup', this.keyUpListener);
    }
}
