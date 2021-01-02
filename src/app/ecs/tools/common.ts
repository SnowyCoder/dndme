import {World} from "../world";
import PIXI from "../../PIXI";
import {SELECTION_TYPE, SelectionSystem} from "../systems/selectionSystem";
import {PointerClickEvent, PointerDownEvent, PointerMoveEvent, PointerUpEvent} from "../systems/pixiBoardSystem";
import {ToolDriver} from "../systems/toolSystem";
import {findEntitiesAt, getBoardPosFromOrigin, getMapPointFromMouseInteraction} from "./utils";
import {Tool} from "./toolType";


export class InspectToolDriver implements ToolDriver {
    readonly name = Tool.INSPECT;
    private readonly world: World;
    private readonly selectionSys: SelectionSystem;

    constructor(world: World) {
        this.world = world;
        this.selectionSys = world.systems.get(SELECTION_TYPE) as SelectionSystem;
    }

    onPointerClick(event: PointerClickEvent) {
        let point = getBoardPosFromOrigin(this.world, event);
        let ctrlPressed = !!event.data.originalEvent.ctrlKey;

        let entities = findEntitiesAt(this.world, point, ctrlPressed);
        if (!ctrlPressed) {
            if (entities.length !== 0) {
                this.selectionSys.setOnlyEntity(entities[0]);
            } else {
                this.selectionSys.clear()
            }
        } else {
            this.selectionSys.toggleEntities(entities);
        }
    }
}

export class MoveToolDriver implements ToolDriver {
    readonly name = Tool.MOVE;
    private readonly world: World;

    private isMovingSelection: boolean = false;
    private movingStart = new PIXI.Point();
    private lastMove = new PIXI.Point();
    private selectionSys: SelectionSystem;

    constructor(world: World) {
        this.world = world;
        this.selectionSys = world.systems.get(SELECTION_TYPE) as SelectionSystem;
    }

    onPointerDown(event: PointerDownEvent): void {
        if (!(event.data.button === 1 && event.data.pointerType === 'mouse')) {
            event.consumed = true;
            this.isMovingSelection = true;

            let point = getMapPointFromMouseInteraction(this.world, event);
            this.movingStart.copyFrom(point);
            this.lastMove.set(0, 0);
            this.world.events.emit('tool_move_begin');
        }
    }

    onPointerMove(event: PointerMoveEvent): void {
        if (!this.isMovingSelection) return;
        let point = getMapPointFromMouseInteraction(this.world, event);
        let diffX = point.x - this.movingStart.x;
        let diffY = point.y - this.movingStart.y;

        let moveX = diffX - this.lastMove.x;
        let moveY = diffY - this.lastMove.y;
        this.lastMove.set(diffX, diffY);
        this.selectionSys.moveAll(moveX, moveY);
    }

    onPointerUp(event: PointerUpEvent) {
        if (this.isMovingSelection) {
            this.isMovingSelection = false;
            this.world.events.emit('tool_move_end');
        }
    }
}

