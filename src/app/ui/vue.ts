import {Vue} from "vue-property-decorator";
import EventEmitter = PIXI.utils.EventEmitter;

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
