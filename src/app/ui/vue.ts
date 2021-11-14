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
