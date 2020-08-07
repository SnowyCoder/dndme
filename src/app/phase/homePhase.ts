import {Phase} from "./phase";
import {stage} from "../index"

import HomeComponent from "../ui/home/home.vue";
import {GameMap} from "../map/gameMap";
import {HostEditMapPhase} from "./editMap/hostEditMapPhase";

export class HomePhase extends Phase {

    constructor() {
        super("home");
    }

    ui() {
        return new HomeComponent();
    }

    createMap() {
        let map = new GameMap();
        stage.setPhase(new HostEditMapPhase(map));
    }

    async editMap(file: File) {
        let map = await GameMap.loadFromFile(file);
        stage.setPhase(new HostEditMapPhase(map));
    }


    enable() {
        super.enable();
        this.uiEventEmitter.on('create_map', this.createMap, this);
        this.uiEventEmitter.on('edit', this.editMap, this);
    }

    disable() {
        this.uiEventEmitter.on('edit', this.editMap, this);
        this.uiEventEmitter.on('create_map', this.createMap, this);
        super.disable();
    }
}
