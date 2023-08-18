import {Phase} from "./phase";
import LoadingComponent from "../ui/loading/Loading.vue";
import { App, createApp, shallowRef } from "vue";

export type LoadingState = 'sw_register' | 'sw_error' | 'loading';

export class LoadingPhase extends Phase {
    private state = shallowRef('sw_register');

    constructor() {
        super("loading");
    }

    ui(): App {
        return createApp(LoadingComponent, {
            status: this.state,
        });
    }

    update(state: LoadingState) {
        this.state.value = state;
    }
}
