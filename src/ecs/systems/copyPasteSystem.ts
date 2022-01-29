
import {SerializedEntities, SerializedWorld, World} from "../world";
import {SELECTION_TYPE, SelectionSystem} from "./back/selectionSystem";
import {KEYBOARD_TYPE, KeyboardResource} from "./back/keyboardSystem";
import { System } from "../system";
import { DeSpawnCommand } from "./command/despawnCommand";
import { executeAndLogCommand } from "./command/command";
import { POSITION_TYPE } from "../component";
import { SingleEcsStorageSerialzed } from "../storage";
import { Aabb } from "../../geometry/aabb";
import { BoardSizeResource, BoardTransformResource, BOARD_SIZE_TYPE, BOARD_TRANSFORM_TYPE } from "./back/pixiBoardSystem";

const CLIPBOARD_DATA = 'dndme-clip';

interface CustomClipboardData {
    format: typeof CLIPBOARD_DATA;
    ver: 1,
    data: SerializedEntities;
}

export const COPY_PASTE_TYPE = 'copy_paste';
export type COPY_PASTE_TYPE = typeof COPY_PASTE_TYPE;
export class CopyPasteSystem implements System {
    readonly name = COPY_PASTE_TYPE;
    readonly dependencies = [SELECTION_TYPE, KEYBOARD_TYPE];

    private readonly world: World;
    private readonly selectionSys: SelectionSystem;
    private readonly keyboard: KeyboardResource;

    isActive: boolean = false;

    private copyListener: any;
    private pasteListener: any;
    private cutListener: any;

    private lastIgnorePaste: number = 0;

    constructor(world: World) {
        this.world = world;
        this.keyboard = world.getResource(KEYBOARD_TYPE) as KeyboardResource;
        this.selectionSys = world.systems.get(SELECTION_TYPE) as SelectionSystem;

        this.world.events.on('ignore_next_paste', this.onIgnoreNextPaste, this);
    }


    private onIgnoreNextPaste(): void {
        this.lastIgnorePaste = Date.now();
    }

    onPaste(e: ClipboardEvent) {
        if (e.target instanceof HTMLInputElement || e.clipboardData == null) {
            return;
        }

        if (Date.now() < this.lastIgnorePaste + 300) {
            this.lastIgnorePaste = 0;
            return;
        }
        const text = e.clipboardData.getData('text/plain');

        let parsed: CustomClipboardData;
        try {
            parsed = JSON.parse(text) as CustomClipboardData;
            if (parsed.format !== CLIPBOARD_DATA) {
                console.warn("Invalid JSON format");
                return;
            }
            if (parsed.ver !== 1) {
                console.warn("Invalid pasted version");
                return;
            }
        } catch (e) {
            console.warn("Copied content is not valid dndme data");
            return;
        }

        const transform = this.world.getResource(BOARD_TRANSFORM_TYPE) as BoardTransformResource;
        if (transform !== undefined) {
            const boardSize = this.world.getResource(BOARD_SIZE_TYPE) as BoardSizeResource;
            const randX = Math.random() + 0.5;
            const randY = Math.random() + 0.5;
            this.moveSerialized(
                parsed.data,
                (boardSize.width  * randX / 2 - transform.posX) / transform.scaleX,
                (boardSize.height * randY / 2 - transform.posY) / transform.scaleY
            );
        }

        this.world.deserialize(parsed.data, {
            remap: true,
            thenSelect: true,
        });
    }

    copyOrCut(del: boolean): string {
        const data = this.world.serialize({
            requireSave: true,
            remap: true,
            only: this.selectionSys.selectedEntities,
        });

        this.repositionSerialized(data);
        const ser = JSON.stringify({
            format: CLIPBOARD_DATA,
            ver: 1,
            data,
        } as CustomClipboardData);
        if (del) {
            const cmd = {
                kind: 'despawn',
                entities: [...this.selectionSys.selectedEntities],
            } as DeSpawnCommand;
            executeAndLogCommand(this.world, cmd);
        }
        return ser;
    }

    onCopy(e: ClipboardEvent) {
        if (e.target instanceof HTMLInputElement || e.clipboardData == null) {
            return;
        }
        e.preventDefault();

        const ser = this.copyOrCut(false);

        e.clipboardData.setData("text/plain", ser);
    }

    onCut(e: ClipboardEvent) {
        if (e.target instanceof HTMLInputElement || e.clipboardData == null) {
            return;
        }
        e.preventDefault();

        const ser = this.copyOrCut(true);

        e.clipboardData.setData("text/plain", ser);
    }

    private repositionSerialized(ser: SerializedWorld): void {
        const posStorage = ser.storages[POSITION_TYPE] as SingleEcsStorageSerialzed;
        if (posStorage === undefined) return;

        let bb: Aabb | undefined = undefined;

        for (let name in posStorage) {
            const data = posStorage[name];
            if (bb === undefined) {
                bb = Aabb.fromPoint(data);
            } else {
                bb.intersect(Aabb.fromPoint(data), bb);
            }
        }

        if (bb === undefined) return;

        const center = bb.getCenter();
        this.moveSerialized(ser, -center.x, -center.y);
    }

    private moveSerialized(ser: SerializedWorld, dx: number, dy: number): void {
        const posStorage = ser.storages[POSITION_TYPE] as SingleEcsStorageSerialzed;
        if (posStorage === undefined) return;

        for (let name in posStorage) {
            const data = posStorage[name];

            data.x += dx;
            data.y += dy;
        }
    }

    enable() {
        this.copyListener = this.onCopy.bind(this);
        document.addEventListener('copy', this.copyListener);


        this.cutListener = this.onCut.bind(this);
        document.addEventListener('cut', this.cutListener);

        this.pasteListener = this.onPaste.bind(this);
        document.addEventListener('paste', this.pasteListener);
    }

    destroy() {
        document.removeEventListener('copy', this.copyListener);
        document.removeEventListener('cut', this.cutListener);
        document.removeEventListener('paste', this.pasteListener)
    }
}