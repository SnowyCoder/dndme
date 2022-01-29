import { App } from "vue";

export class Phase {
    name: string;

    vue: App | undefined;

    constructor(name: string) {
        this.name = name;
    }

    log(message: string) {
        console.log(`[${this.name}] ` + message);
    }

    ui(): App | undefined {
        return undefined;
    }

    enable() {
        this.log("Enabling");

        this.vue = this.ui();
        if (this.vue) {
            this.vue.mount('#vue-mount-point');
        }

        // Done ^^
    }

    disable() {
        console.log(`[${this.name}] Disabling`);
        if (this.vue) {
            this.vue.unmount();
            this.vue = undefined;
        }
    }



    /**
     * Overrides the `Object.prototype.toString.call(obj)` result.
     * This is done to hide this object and its children from observers (see https://github.com/vuejs/vue/issues/2637)
     * @returns {string} - type name
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag}
     */
    get [Symbol.toStringTag]() {
        // Anything can go here really as long as it's not 'Object'
        return 'ObjectNoObserve';
    }
}
