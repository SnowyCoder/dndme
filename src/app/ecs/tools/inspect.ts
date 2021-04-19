import {World} from "../world";
import PIXI from "../../PIXI";
import {SELECTION_TYPE, SelectionSystem} from "../systems/back/selectionSystem";
import {PointerClickEvent, PointerDownEvent, PointerMoveEvent, PointerUpEvent} from "../systems/back/pixiBoardSystem";
import {ToolDriver} from "../systems/back/toolSystem";
import {findEntitiesAt, getBoardPosFromOrigin, getMapPointFromMouseInteraction} from "./utils";
import {Tool} from "./toolType";
import {RectangularSelection} from "./rectangularSelection";
import {LAYER_TYPE, LayerSystem} from "../systems/back/layerSystem";
import {KEYBOARD_TYPE, KeyboardResource} from "../systems/back/keyboardSystem";


export class InspectToolDriver implements ToolDriver {
    readonly name = Tool.INSPECT;
    private readonly world: World;
    private readonly selectionSys: SelectionSystem;
    private readonly layerSys: LayerSystem;
    private readonly keyboard: KeyboardResource;

    private justSelected: number[] = [];
    private lastDownEntities: number[] = [];
    private lastDownSelected: number[] = [];
    private firstEntity: number = -1;

    private isDown: boolean = false;
    private canMoveSelected: boolean = false;
    private isMoving: boolean = false;
    private movingStart = new PIXI.Point();
    private lastMove = new PIXI.Point();

    private lastClick: number = 0;
    private isPanning: boolean = false;
    private rectSelection: RectangularSelection;

    constructor(world: World) {
        this.world = world;
        this.selectionSys = world.systems.get(SELECTION_TYPE) as SelectionSystem;
        this.layerSys = world.systems.get(LAYER_TYPE) as LayerSystem;
        this.rectSelection = new RectangularSelection(world);
        this.rectSelection.predicate = id => !this.layerSys.getEntityLayer(id).locked;
        this.keyboard = world.getResource(KEYBOARD_TYPE)! as KeyboardResource;
    }

    onPointerClick(event: PointerClickEvent) {
        let now = Date.now();

        if (now - this.lastClick < 800) {
            // double click!
            this.lastClick = 0;

            this.world.events.emit("interact", [...this.lastDownSelected, ...this.lastDownEntities]);
            return;
        }
        this.lastClick = now;

        let ctrlPressed = !!event.data.originalEvent.ctrlKey;

        let entities = this.lastDownEntities.length + this.lastDownSelected.length;

        if (entities === 0 && !ctrlPressed) {
            this.selectionSys.clear();
            return;
        }

        if (ctrlPressed) {
            this.selectionSys.removeEntities(this.lastDownEntities);
            let toRemove = []
            for (let entity of this.lastDownSelected) {
                if (this.justSelected.indexOf(entity) !== -1) return;
                toRemove.push(entity);
            }
            this.selectionSys.removeEntities(toRemove);
        } else if (this.firstEntity !== -1) {
            if (this.selectionSys.selectedEntities.size === 1 && this.justSelected.length === 0) {
                // Clicked a previously clicked entity, remove it.
                this.selectionSys.clear();
            }
        }
    }

    onPointerDown(event: PointerDownEvent) {
        this.isDown = true;
        this.justSelected.length = 0;
        let point = getBoardPosFromOrigin(this.world, event);
        let ctrlPressed = !!event.data.originalEvent.ctrlKey;

        let entities = findEntitiesAt(this.world, point, true);

        this.lastDownEntities = [];
        this.lastDownSelected = [];

        this.firstEntity = entities.length === 0 ? -1 : entities[0];

        for (let entity of entities) {
            if (this.layerSys.getEntityLayer(entity).locked) {
                this.lastDownEntities.push(entity);
            } else {
                this.lastDownSelected.push(entity);
            }
        }

        this.isPanning = this.keyboard.pressedKeys.has(" ");// Check if the space key is pressed;

        if (this.lastDownSelected.length === 0) {
            if (!this.isPanning && this.world.isMaster) {
                this.rectSelection.begin(point);
                event.consumed = true;
            } else {
                return;
            }
        }

        // Clients can't move anything (TODO: this should be false)
        event.consumed ||= this.world.isMaster;
        // event.consumed = true;

        if (ctrlPressed) {
            let selected = this.selectionSys.selectedEntities;
            for (let entity of this.lastDownSelected) {
                if (!selected.has(entity)) {
                    this.justSelected.push(entity);
                }
            }
            this.selectionSys.addEntities(this.justSelected);
        } else if (this.lastDownSelected.length > 0) {
            const entity = this.lastDownSelected[0];

            if (!this.selectionSys.selectedEntities.has(entity)) {
                this.justSelected.push(entity);
            }

            this.selectionSys.setOnlyEntity(entity);
        }

        // TODO: better move system
        this.canMoveSelected = this.world.isMaster;
        if (!this.canMoveSelected) return;

        let p = getMapPointFromMouseInteraction(this.world, event);
        this.movingStart.copyFrom(p);
        this.lastMove.set(0, 0);
    }

    onPointerUp(event: PointerUpEvent) {
        this.isDown = false;

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

        let point = getMapPointFromMouseInteraction(this.world, event);

        if (this.lastDownSelected.length === 0) {
            if (!this.rectSelection.isActive) {
                this.rectSelection.begin(this.movingStart);
            }

            this.rectSelection.moveEnd(point)
        } else {
            if (!this.isMoving) {
                this.isMoving = true;
                this.world.events.emit('tool_move_begin');
            }

            let diffX = point.x - this.movingStart.x;
            let diffY = point.y - this.movingStart.y;

            let moveX = diffX - this.lastMove.x;
            let moveY = diffY - this.lastMove.y;
            this.lastMove.set(diffX, diffY);
            this.selectionSys.moveAll(moveX, moveY, this.selectionSys.selectedEntities);
        }
    }
}
