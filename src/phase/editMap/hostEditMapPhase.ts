import {EditMapPhase} from "./editMapPhase";
import {NameComponent, NAME_TYPE, PositionComponent, POSITION_TYPE, SerializedFlag, SERIALIZED_TYPE, SharedFlag, SHARED_TYPE, TransformComponent, TRANSFORM_TYPE} from "../../ecs/component";
import {BackgroundImageComponent, BACKGROUND_IMAGE_TYPE} from "../../ecs/systems/backgroundImageSystem";
import {GameMap} from "../../map/gameMap";
import {MapLevel} from "../../map/mapLevel";
import {PIXI_BOARD_TYPE, PixiBoardSystem} from "../../ecs/systems/back/pixiBoardSystem";
import {SpawnCommandKind} from "../../ecs/systems/command/spawnCommand";
import {executeAndLogCommand} from "../../ecs/systems/command/command";
import {BIG_STORAGE_TYPE, BigStorageSystem, BigEntryFlags} from "../../ecs/systems/back/bigStorageSystem";
import * as PIXI from "pixi.js";

export class HostEditMapPhase extends EditMapPhase {
    map: GameMap;
    currentLevel: MapLevel;

    private beforeUnloadListener: any;

    constructor(map: GameMap) {
        super('editHost', undefined);

        this.map = map;
        if (this.map.levels.size == 0) {
            this.map.levels.set(42, new MapLevel(42));
        }
        this.currentLevel = this.map.levels.values().next().value;

        this.world.events.on('export_map', () => {
            void this.exportMap();
        });
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
            let data = new Uint8Array(await firstFile.arrayBuffer());
            let bigStorage = this.world.systems.get(BIG_STORAGE_TYPE) as BigStorageSystem;
            let dataId = bigStorage.create(
                data,
                BigEntryFlags.READONLY | BigEntryFlags.SHARED,
                false
            ).multiId;
            const cmd = SpawnCommandKind.from(this.world, [
                {
                    type: SERIALIZED_TYPE,
                } as SerializedFlag,
                {
                    type: SHARED_TYPE
                } as SharedFlag,
                {
                    type: NAME_TYPE,
                    name: firstFile.name,
                    clientVisible: false,
                } as NameComponent,
                {
                    type: POSITION_TYPE,
                    x: p.x,
                    y: p.y,
                } as PositionComponent,
                {
                    type: TRANSFORM_TYPE,
                    rotation: 0,
                    scale: 1,
                } as TransformComponent,
                {
                    type: BACKGROUND_IMAGE_TYPE,
                    entity: -1,
                    image: dataId,
                    imageType: firstFile.type,
                } as BackgroundImageComponent,
            ]);
            executeAndLogCommand(this.world, cmd);
            console.log("Image loaded");
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

        const canvas = (this.world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem).renderer.view;
        canvas.ondrop = this.onDrop.bind(this);
        canvas.ondragover = this.onDragOver.bind(this);

        this.beforeUnloadListener = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = 'pls';
        };
        window.addEventListener('beforeunload', this.beforeUnloadListener);

        this.currentLevel.loadInto(this.world);
        //let ch = this.networkManager.channel.eventEmitter;
        //ch.on("_device_join", this.onDeviceJoin, this);
    }

    disable() {
        //let ch = this.networkManager.channel.eventEmitter;
        //ch.off("_device_join", this.onDeviceJoin, this);
        window.removeEventListener('beforeunload', this.beforeUnloadListener);

        super.disable();
    }

}


interface AbsFileList {
    readonly length: number;
    [index: number]: File;
}