import Vue from "vue";
import * as EventEmitter from "eventemitter3";

export class Phase {
    name: string;

    vue: any;
    uiEventEmitter: any;

    constructor(name: string) {
        this.name = name;

        // Create Vue instance that is responsible for handling the UI events of the current phase.
        // https://medium.com/vuejobs/create-a-global-event-bus-in-vue-js-838a5d9ab03a
        this.uiEventEmitter = new EventEmitter();
    }

    log(message: string) {
        console.log(`[${this.name}] ` + message);
    }

    ui(): Vue | undefined {
        return undefined;
    }

    enable() {
        this.log("Enabling");

        (Vue.prototype as any).eventEmitter = this.uiEventEmitter;

        this.vue = this.ui();
        if (this.vue) {
            this.vue.$mount();
            document.body.appendChild(this.vue.$el);
        }

        // Done ^^
    }

    disable() {
        console.log(`[${this.name}] Disabling`);
        if (this.vue) {
            this.vue.$destroy();
            document.body.removeChild(this.vue.$el);
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
