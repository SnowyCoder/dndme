import {World} from "../world";
import PIXI from "../../PIXI";
import {SELECTION_TYPE, SelectionSystem} from "../systems/back/selectionSystem";
import {PointerClickEvent, PointerDownEvent, PointerEvents, PointerMoveEvent, PointerUpEvent} from "../systems/back/pixiBoardSystem";
import {ToolPart} from "../systems/back/toolSystem";
import {RectangularSelection} from "./rectangularSelection";
import {LAYER_TYPE, LayerSystem} from "../systems/back/layerSystem";
import {KEYBOARD_TYPE, KeyboardResource} from "../systems/back/keyboardSystem";
import SafeEventEmitter from "../../util/safeEventEmitter";

export class FilteredPanPart implements ToolPart {
    readonly name;
    private readonly world: World;
    readonly filter: (world: World, event: PointerDownEvent) => boolean;
    readonly priority: number;

    isPanning: boolean = false;

    constructor(
            world: World, name: string,
            filter: (world: World, event: PointerDownEvent) => boolean,
            priority: number = 0
        ) {
        this.name = name;
        this.world = world;
        this.filter = filter;
        this.priority = priority;
    }

    onPointerDown(event: PointerDownEvent): void {
        if (event.consumed) return;
        this.isPanning = this.filter(this.world, event);

        if (this.isPanning) {
            event.consumed = true;
            event.consumeDragBoard = true;
        }
    }

    onPointerUp(event: PointerUpEvent): void {
        if (event.isClick) {
            event.consumed = true;
        }
        this.isPanning = false;
    }

    initialize(events: SafeEventEmitter): void {
        events.on(PointerEvents.POINTER_DOWN, this.onPointerDown, this, this.priority);
        events.on(PointerEvents.POINTER_UP, this.onPointerUp, this, this.priority);
    }

    destroy(): void {
    }

    onEnable(): void {
    }
    onDisable(): void {
    }
}

export class InteractPart implements ToolPart {
    readonly name = "interact";
    private readonly world: World;
    private lastClick: number = 0;

    constructor(world: World) {
        this.world = world;
    }

    onPointerClick(event: PointerClickEvent): void {
        const now = Date.now();

        if (now - this.lastClick < 800) {
            // double click!
            this.lastClick = 0;

            this.world.events.emit("interact", event.entitiesHovered());
        } else {
            this.lastClick = now;
        }
    }

    initialize(events: SafeEventEmitter): void {
        events.on(PointerEvents.POINTER_CLICK, this.onPointerClick, this);
    }

    destroy(): void {
    }

    onEnable(): void {
    }
    onDisable(): void {
    }
}

export class SelectPart implements ToolPart {
    readonly name = "select";
    private readonly world: World;
    private readonly layerSys: LayerSystem;
    private readonly selectionSys: SelectionSystem;
    private readonly keyboard: KeyboardResource;
    private rectSelection: RectangularSelection;

    private isDown = false;

    private lastDownEntities: number[] = [];
    private lastDownSelected: number[] = [];
    private justSelected: number | undefined;

    private canMoveSelected: boolean = false;
    private isMoving: boolean = false;
    private movingStart = new PIXI.Point();
    private lastMove = new PIXI.Point();

    constructor(world: World) {
        this.world = world;
        this.layerSys = world.systems.get(LAYER_TYPE) as LayerSystem;
        this.selectionSys = world.systems.get(SELECTION_TYPE) as SelectionSystem;
        this.keyboard = this.world.getResource(KEYBOARD_TYPE) as KeyboardResource;
        this.rectSelection = new RectangularSelection(world);
        this.rectSelection.predicate = id => !this.layerSys.getEntityLayer(id).locked;
    }

    private onPointerDown(event: PointerDownEvent): void {
        if (event.consumed) return;
        this.isDown = true;
        this.lastDownEntities.length = 0;
        this.lastDownSelected.length = 0;
        this.justSelected = undefined;

        for (let entity of event.entitiesHovered()) {
            if (this.layerSys.getEntityLayer(entity).locked) {
                this.lastDownEntities.push(entity);
            } else {
                this.lastDownSelected.push(entity);
            }
        }

        if (this.lastDownSelected.length === 0 && this.world.isMaster) {
            this.rectSelection.begin(event.boardPos);
            event.consumed = true;
        }

        // Clients can't move anything (TODO: this should be false)
        event.consumed ||= this.world.isMaster;
        // event.consumed = true;

        const ctrlPressed = this.keyboard.ctrl;
        if (ctrlPressed) {
            let selected = this.selectionSys.selectedEntities;
            let e = [];
            for (let entity of this.lastDownSelected) {
                if (!selected.has(entity)) {
                    e.push(entity);
                }
            }
            this.selectionSys.addEntities(e);
        } else if (this.lastDownSelected.length > 0) {
            const entity = this.lastDownSelected[0];
            this.justSelected = entity;
        }

        // TODO: better move system
        this.canMoveSelected = this.world.isMaster && !ctrlPressed;
        if (!this.canMoveSelected) return;

        this.movingStart.copyFrom(event.boardPos);
        this.lastMove.set(0, 0);
    }

    private onPointerUp(event: PointerUpEvent): void {
        this.canMoveSelected = false;
        this.isDown = false;

        if (event.isClick) {
            if (event.entitiesHovered().length === 0) {
                this.selectionSys.clear();
            } else if (this.justSelected !== undefined) {
                this.selectionSys.setOnlyEntity(this.justSelected);
            }
        }

        if (this.rectSelection.isActive) {
            this.rectSelection.done();
        }

        if (this.isMoving) {
            this.isMoving = false;
            this.world.events.emit('tool_move_end');
        }
    }

    onPointerMove(event: PointerMoveEvent): void {
        if (!this.isDown || !this.canMoveSelected || event.canBecomeClick) return;

        if (this.lastDownSelected.length === 0) {
            if (!this.rectSelection.isActive) {
                this.rectSelection.begin(this.movingStart);
            }

            this.rectSelection.moveEnd(event.boardPos)
        } else {
            if (!this.isMoving) {
                if (this.justSelected !== undefined && !this.selectionSys.selectedEntities.has(this.justSelected)) {
                    this.selectionSys.setOnlyEntity(this.justSelected);
                }
                this.isMoving = true;
                this.world.events.emit('tool_move_begin');
            }

            let diffX = event.boardPos.x - this.movingStart.x;
            let diffY = event.boardPos.y - this.movingStart.y;

            let moveX = diffX - this.lastMove.x;
            let moveY = diffY - this.lastMove.y;
            this.lastMove.set(diffX, diffY);
            this.selectionSys.moveAll(moveX, moveY, this.selectionSys.selectedEntities);
        }
    }

    initialize(events: SafeEventEmitter): void {
        events.on(PointerEvents.POINTER_DOWN, this.onPointerDown, this);
        events.on(PointerEvents.POINTER_MOVE, this.onPointerMove, this);
        events.on(PointerEvents.POINTER_UP, this.onPointerUp, this);
    }

    destroy(): void {
    }

    onEnable(): void {
    }
    onDisable(): void {
    }
}
