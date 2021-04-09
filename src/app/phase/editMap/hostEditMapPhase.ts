import {EditMapPhase} from "./editMapPhase";
import {Component, NameComponent, PositionComponent, TransformComponent} from "../../ecs/component";
import {BackgroundImageComponent} from "../../ecs/systems/backgroundImageSystem";
import {app} from "../../index";
import {GameMap} from "../../map/gameMap";
import {MapLevel} from "../../map/mapLevel";
import {PIXI_BOARD_TYPE, PixiBoardSystem} from "../../ecs/systems/back/pixiBoardSystem";
import {HostNetworkSystem} from "../../ecs/systems/back/networkSystem";
import {SelectionSystem} from "../../ecs/systems/back/selectionSystem";
import {SpawnCommand} from "../../ecs/systems/command/spawnCommand";
import {executeAndLogCommand} from "../../ecs/systems/command/command";
import {
    BACKGROUND_LAYER_TYPE,
    BackgroundLayerResource,
    PARENT_LAYER_TYPE,
    ParentLayerComponent
} from "../../ecs/systems/back/layerSystem";

export class HostEditMapPhase extends EditMapPhase {
    map: GameMap;
    currentLevel: MapLevel;

    constructor(map: GameMap) {
        super('editHost', true);

        this.map = map;
        if (this.map.levels.size == 0) {
            this.map.levels.set(42, new MapLevel(42));
        }
        this.currentLevel = this.map.levels.values().next().value;


        this.world.events.on('command_history_change', (canUndo: boolean, canRedo: boolean) => {
            this.vue.canUndo = canUndo;
            this.vue.canRedo = canRedo;
        });

        this.world.events.on('selection_update', (group: SelectionSystem) => {
            this.vue.selectedEntityOpts = group.getCommonEntityOpts();
            this.vue.selectedComponents = group.getCommonComponents();
            this.vue.selectedAddable = group.getAddableComponents();
        });

        this.world.events.on('layer_lock_toggle', () => {
            let locked = (this.world.getResource(BACKGROUND_LAYER_TYPE) as BackgroundLayerResource).locked;
            this.world.editResource(BACKGROUND_LAYER_TYPE, { locked: !locked });
        });
    }

    registerSystems() {
        this.world.addSystem(new HostNetworkSystem(this.world, this.networkManager.channel));
        super.registerSystems();
    }

    async onDrop(event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();

        let x = event.pageX;
        let y = event.pageY;

        if (event.dataTransfer!.items) {
            let res = [];
            for (let f of event.dataTransfer!.items) {
                let file = f.getAsFile();
                if (file != null) {
                    res.push(file);
                }
            }

            await this.onFileDrop(res, x, y);
        } else {
            await this.onFileDrop(event.dataTransfer!.files, x, y);
        }
    }

    onDragOver(event: DragEvent) {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer!.dropEffect = "copy";
        return false;
    }

    async onFileDrop(files: AbsFileList, x: number, y: number) {
        if (files.length == 0) return;
        let firstFile = files[0];

        // Sometimes this does not work but the problem is not the matrix calculation, it's the browser coords
        // so if you have firefox and linux (this seems to be the wrong stack) and have spare time, pls debug this.
        // Could be caused by: https://bugzilla.mozilla.org/show_bug.cgi?id=505521#c80
        let p = new PIXI.Point(x, y);
        let pixiBoard = this.world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
        pixiBoard.board.updateTransform();
        pixiBoard.board.transform.worldTransform.applyInverse(p, p);

        if (firstFile.type.startsWith("image/")) {
            let cmd = {
                kind: 'spawn',
                entities: [{
                    id: -1,
                    components: [
                        {
                            type: 'name',
                            name: firstFile.name,
                            clientVisible: false,
                        } as NameComponent,
                        {
                            type: "position",
                            x: p.x,
                            y: p.y,
                        } as PositionComponent,
                        {
                            type: "transform",
                            rotation: 0,
                            scale: 1,
                        } as TransformComponent,
                        {
                            type: "background_image",
                            imageType: firstFile.type,
                            image: new Uint8Array(await firstFile.arrayBuffer()),
                        } as BackgroundImageComponent,
                    ]
                }]
            } as SpawnCommand;
            executeAndLogCommand(this.world, cmd);
            console.log("Image loaded")
        }
    }


    async exportMap() {
        this.currentLevel.saveFrom(this.world);
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

        this.currentLevel.loadInto(this.world);

        //let ch = this.networkManager.channel.eventEmitter;
        //ch.on("_device_join", this.onDeviceJoin, this);
    }

    disable() {
        //let ch = this.networkManager.channel.eventEmitter;
        //ch.off("_device_join", this.onDeviceJoin, this);

        app.view.ondrop = () => {};
        app.view.ondragover = () => {};

        super.disable();
    }

}


interface AbsFileList {
    readonly length: number;
    [index: number]: File;
}
