import {EditMapPhase} from "./editMapPhase";
import {FlagEcsStorage} from "../../ecs/storage";
import {Component, NameComponent, PositionComponent, TransformComponent} from "../../ecs/component";
import {BackgroundImageComponent} from "../../ecs/systems/backgroundSystem";
import {app} from "../../index";
import {GameMap} from "../../map/gameMap";
import {MapLevel} from "../../map/mapLevel";
import {HostNetworkSystem} from "../../ecs/systems/networkSystem";

export class HostEditMapPhase extends EditMapPhase {
    map: GameMap;
    currentLevel: MapLevel;

    networkSystem: HostNetworkSystem;

    constructor(map: GameMap) {
        super('editHost', true);

        this.map = map;
        if (this.map.levels.size == 0) {
            this.map.levels.set(42, new MapLevel(42));
        }
        this.currentLevel = this.map.levels.values().next().value;


        this.setupEcs();
    }

    setupEcs() {
        super.setupEcs();
        this.ecs.addStorage(new FlagEcsStorage("host_hidden", false, true));

        this.networkSystem = new HostNetworkSystem(this.ecs, this.networkManager.channel);
    }

    async onDrop(event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();

        if (event.dataTransfer.items) {
            let res = [];
            for (let f of event.dataTransfer.items) {
                let file = f.getAsFile();
                if (file != null) {
                    res.push(file);
                }
            }

            await this.onFileDrop(res);
        } else {
            await this.onFileDrop(event.dataTransfer.files);
        }
    }

    onDragOver(event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        return false;
    }


    async onFileDrop(files: AbsFileList) {
        if (files.length == 0) return;
        let firstFile = files[0];

        if (firstFile.type.startsWith("image/")) {
            this.ecs.spawnEntity(
                {
                    type: 'host_hidden'
                } as Component,
                {
                    type: 'name',
                    name: firstFile.name,
                    clientVisible: false,
                } as NameComponent,
                {
                    type: "position",
                    x: 0,
                    y: 0,
                } as PositionComponent,
                {
                    type: "transform",
                    rotation: 0,
                } as TransformComponent,
                {
                    type: "background_image",
                    imageType: firstFile.type,
                    image: new Uint8Array(await firstFile.arrayBuffer()),
                } as BackgroundImageComponent,
            );
            console.log("Image loaded")
        }
    }


    async exportMap() {
        this.currentLevel.saveFrom(this.ecs);
        let blob = await this.map.saveToFile();
        this.saveBlob(blob, "map.dndm");
    }

    saveBlob(blob: Blob, fileName: string) {
        let a = document.getElementById("hidden-download-link") as HTMLAnchorElement;
        let url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    enable() {
        super.enable();

        app.view.ondrop = this.onDrop.bind(this);
        app.view.ondragover = this.onDragOver.bind(this);

        this.currentLevel.loadInto(this.ecs);

        //let ch = this.networkManager.channel.eventEmitter;
        //ch.on("_device_join", this.onDeviceJoin, this);
    }

    disable() {
        //let ch = this.networkManager.channel.eventEmitter;
        //ch.off("_device_join", this.onDeviceJoin, this);

        app.view.ondrop = undefined;
        app.view.ondragover = undefined;

        super.disable();
    }

}


interface AbsFileList {
    readonly length: number;
    [index: number]: File;
}
