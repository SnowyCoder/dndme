import {Phase} from "./phase";
import {stage} from "../index"

import HomeComponent from "../ui/home/Home.vue";
import {GameMap} from "../map/gameMap";
import {HostEditMapPhase} from "./editMap/hostEditMapPhase";
import { App, createApp } from "vue";
import SafeEventEmitter from "../util/safeEventEmitter";

export class HomePhase extends Phase {

    uiEvents = new SafeEventEmitter();

    constructor() {
        super("home");
    }

    ui(): App {
        return createApp(HomeComponent, {
            uiEvents: this.uiEvents,
        });
    }

    createMap() {
        const map = new GameMap();
        stage.setPhase(new HostEditMapPhase(map));
    }

    async editMap(file: File, progress: (prog: number) => void, onError?: (err: string) => void) {
        let map;
        try {
            map = await GameMap.loadFromFile(file, progress);
        } catch (e: any) {
            console.error("Error loading zip file", e);
            if (onError) onError("Error loading file, is it a zip file?");
            return;
        }
        stage.setPhase(new HostEditMapPhase(map));
    }


    enable() {
        super.enable();
        this.uiEvents.on('create_map', this.createMap, this);
        this.uiEvents.on('edit', this.editMap, this);
    }

    disable() {
        this.uiEvents.off('edit', this.editMap, this);
        this.uiEvents.off('create_map', this.createMap, this);
        super.disable();
    }
}
