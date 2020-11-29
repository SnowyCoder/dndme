import {Phase} from "./phase";
import LoadingComponent from "../ui/loading/loading.vue";

export class LoadingPhase extends Phase {
    constructor() {
        super("loading");
    }

    ui() {
        return new LoadingComponent();
    }
}