import {Vue, Watch} from "vue-property-decorator";
import EventEmitter = PIXI.utils.EventEmitter;
import {VueDecorator} from "vue-class-component";

export interface PhaseVue {
    eventEmitter: EventEmitter;
}

export {
    Vue,
    Component as VComponent,
    Prop as VProp,
    Watch as VWatch,
    Ref as VRef,
} from "vue-property-decorator";


export function VWatchImmediate(name: string): VueDecorator {
    return Watch(name, { immediate: true });
}

export const networkStatus = Vue.observable({
    isOnline: navigator.onLine,
});

window.addEventListener('online', () => networkStatus.isOnline = true);
window.addEventListener('offline', () => networkStatus.isOnline = false);

export class ShallowRef<T> {
    value: T;

    constructor(value: T) {
        this.value = value;
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

export function shallowRef<T>(x: T): ShallowRef<T> {
    return new ShallowRef(x);
}
