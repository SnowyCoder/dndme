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

    private justSelected: number[] = [];
    private lastDownEntities: number[] = [];
    private isDown: boolean = false;
    private canMoveSelected: boolean = false;
    private isMoving: boolean = false;
    private movingStart = new PIXI.Point();
    private lastMove = new PIXI.Point();

    constructor(world: World) {
        this.world = world;
        this.selectionSys = world.systems.get(SELECTION_TYPE) as SelectionSystem;
    }

    onPointerClick(event: PointerClickEvent) {
        let ctrlPressed = !!event.data.originalEvent.ctrlKey;

        let entities = this.lastDownEntities;

        if (entities.length === 0 && !ctrlPressed) {
            this.selectionSys.clear();
        }

        if (ctrlPressed && entities.length !== 0) {
            let toRemove = []
            for (let entity of entities) {
                if (this.justSelected.indexOf(entity) !== -1) return;
                toRemove.push(entity);
            }
            this.selectionSys.removeEntities(toRemove);
        }
    }

    onPointerDown(event: PointerDownEvent) {
        this.isDown = true;
        this.justSelected.length = 0;
        let point = getBoardPosFromOrigin(this.world, event);
        let ctrlPressed = !!event.data.originalEvent.ctrlKey;

        let entities = findEntitiesAt(this.world, point, ctrlPressed);
        this.lastDownEntities = entities;

        if (this.lastDownEntities.length !== 0) {
            event.consumed = true;

            if (!ctrlPressed) {
                this.selectionSys.setOnlyEntity(entities[0]);
            } else {
                let selected = this.selectionSys.selectedEntities;
                for (let entity of this.lastDownEntities) {
                    if (!selected.has(entity)) {
                        this.justSelected.push(entity);
                    }
                }
                this.selectionSys.addEntities(this.justSelected);
            }

            // TODO: better move system
            this.canMoveSelected = this.world.isMaster;
            if (!this.canMoveSelected) return;

            let point = getMapPointFromMouseInteraction(this.world, event);
            this.movingStart.copyFrom(point);
            this.lastMove.set(0, 0);
        }
    }

    onPointerUp(event: PointerUpEvent) {
        this.isDown = false;

        if (this.isMoving) {
            this.isMoving = false;
            this.world.events.emit('tool_move_end');
        }
    }

    onPointerMove(event: PointerMoveEvent): void {
        if (!this.isDown || !this.canMoveSelected || this.lastDownEntities.length === 0) return;
        if (!this.isMoving) {
            this.isMoving = true;
            this.world.events.emit('tool_move_begin');
        }

        let point = getMapPointFromMouseInteraction(this.world, event);
        let diffX = point.x - this.movingStart.x;
        let diffY = point.y - this.movingStart.y;

        let moveX = diffX - this.lastMove.x;
        let moveY = diffY - this.lastMove.y;
        this.lastMove.set(diffX, diffY);
        this.selectionSys.moveAll(moveX, moveY);
    }
}
