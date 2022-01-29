import {Phase} from "./phase";
import LoadingComponent from "../ui/loading/Loading.vue";
import { App, createApp } from "vue";

export class LoadingPhase extends Phase {
    constructor() {
        super("loading");
    }

    ui(): App {
        return createApp(LoadingComponent);
    }
}
