import * as PIXI from "pixi.js";
import {System} from "../system";
import {EcsTracker} from "../ecs";
import {EditMapPhase, Tool} from "../../phase/editMap/editMapPhase";
import {DESTROY_ALL} from "../../util/pixi";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {SingleEcsStorage} from "../storage";
import {Component, PositionComponent} from "../component";
import {polygonPointIntersect} from "../../util/geometry";

export interface RoomComponent extends Component {
    type: "room";

    polygon: Array<number>;
    _worldPolygon?: Array<number>;// polygon + position
    visible: boolean;
    _graphics?: PIXI.Graphics;
    _selected?: boolean;
}

enum FillType {
    NONE, SELECTION, OBSCURED,
}

export class RoomSystem implements System {
    readonly ecs: EcsTracker;
    readonly phase: EditMapPhase;

    readonly roomStorage = new SingleEcsStorage<RoomComponent>('room');

    displayRooms: PIXI.Container;

    currentRoom?: Array<number>;
    currentRoomDisplay: PIXI.Graphics;
    currentRoomDisplayLastSegment: PIXI.Graphics;

    private isTranslating: boolean = false;

    constructor(tracker: EcsTracker, phase: EditMapPhase) {
        this.ecs = tracker;
        this.phase = phase;
        tracker.addStorage(this.roomStorage);
        tracker.events.on('entity_spawned', this.onEntitySpawned, this);
        tracker.events.on('component_edited', this.onComponentEdited, this);
        tracker.events.on('component_remove', this.onComponentRemove, this);
        tracker.events.on('selection_begin', this.onSelectionBegin, this);
        tracker.events.on('selection_end', this.onSelectionEnd, this);
        tracker.events.on('tool_move_begin', this.onToolMoveBegin, this);
        tracker.events.on('tool_move_end', this.onToolMoveEnd, this);
    }

    findRoomAt(point: PIXI.Point): number | undefined {
        for (let room of this.roomStorage.allComponents()) {
            if (polygonPointIntersect(point, room._worldPolygon)) {
                return room.entity;
            }
        }
        return undefined;
    }


    private static recomputeWorld(room: RoomComponent, pos: PositionComponent) {
        if (room._worldPolygon === undefined || room._worldPolygon.length !== room.polygon.length) {
            room._worldPolygon = new Array<number>(room.polygon.length);
        }
        let pol = room._worldPolygon;
        for (let i = 0; i < pol.length; i += 2) {
            pol[i] = room.polygon[i] + pos.x;
            pol[i + 1] = room.polygon[i + 1] + pos.y;
        }
    }

    onEntitySpawned(entity: number): void {
        let room = this.ecs.getComponent(entity, "room") as RoomComponent;
        if (room === undefined) return;
        let pos = this.ecs.getComponent(entity, "position") as PositionComponent;
        if (pos === undefined) return;

        if (room._worldPolygon === undefined) {
            RoomSystem.recomputeWorld(room, pos);
        }

        this.addRoom(room as RoomComponent);
    }

    onComponentEdited(comp: Component, changed: any): void {
        if (comp.type !== 'room' && comp.type !== 'position') return;

        let room, position;
        if (comp.type === 'room') {
            room = comp as RoomComponent;
            position = this.ecs.getComponent(comp.entity, 'position') as PositionComponent;
        } else {
            room = this.ecs.getComponent(comp.entity, 'room') as RoomComponent;
            position = comp as PositionComponent;
        }

        if (room === undefined || position === undefined) return;

        if (!this.isTranslating) {
            for (let i = 0; i < room._worldPolygon.length; i += 2) {
                if (!this.phase.pointDb.remove([room._worldPolygon[i], room._worldPolygon[i + 1]])) {
                    console.error("Error removing point");
                }
            }

            RoomSystem.recomputeWorld(room, position);

            for (let i = 0; i < room._worldPolygon.length; i += 2) {
                this.phase.pointDb.insert([room._worldPolygon[i], room._worldPolygon[i + 1]]);
            }
        }
        if (comp.type === 'position') {
            let oldX = changed.x !== undefined ? changed.x : position.x;
            let oldY = changed.y !== undefined ? changed.y : position.y;
            let diffX = position.x - oldX;
            let diffY = position.y - oldY;
            let pos = room._graphics.position;
            pos.set(pos.x + diffX, pos.y + diffY);
        } else {
            this.redrawComponent(room);
        }
    }

    onComponentRemove(component: Component): void {
        if (component.type !== 'room') return;
        (component as RoomComponent)._graphics.destroy(DESTROY_ALL);
    }

    onSelectionBegin(entity: number): void {
        let room = this.ecs.getComponent(entity, 'room') as RoomComponent;
        if (room === undefined) return;
        room._selected = true;
        this.redrawComponent(room);
    }

    onSelectionEnd(entity: number): void {
        let room = this.ecs.getComponent(entity, 'room') as RoomComponent;
        if (room === undefined) return;
        room._selected = undefined;
        this.redrawComponent(room);
    }

    onToolMoveBegin(): void {
        this.isTranslating = true;
        for (let component of this.phase.selection.getSelectedByType("room")) {
            let room = component as RoomComponent;
            for (let i = 0; i < room._worldPolygon.length; i += 2) {
                if (!this.phase.pointDb.remove([room._worldPolygon[i], room._worldPolygon[i + 1]])) {
                    console.error("Error removing point");
                }
            }
        }
    }

    onToolMoveEnd(): void {
        this.isTranslating = false;
        for (let component of this.phase.selection.getSelectedByType("room")) {
            let room = component as RoomComponent;
            let pos = this.ecs.getComponent(room.entity, 'position') as PositionComponent;
            RoomSystem.recomputeWorld(room, pos);
            for (let i = 0; i < room._worldPolygon.length; i += 2) {
                this.phase.pointDb.insert([room._worldPolygon[i], room._worldPolygon[i + 1]]);
            }
        }
    }

    addVertex(point: PIXI.Point) {
        if (this.currentRoom.length > 0 && point.x == this.currentRoom[0] && point.y == this.currentRoom[1]) {
            this.endRoomCreation(true);
        } else {
            this.currentRoom.push(point.x, point.y);
            this.phase.pointDb.insert([point.x, point.y]);
            this.redrawRoomCreation(this.currentRoom, this.currentRoomDisplay, false, true, FillType.SELECTION);
        }
    }

    undoVertex(point: PIXI.Point) {
        let lastPointY = this.currentRoom.pop();
        let lastPointX = this.currentRoom.pop();
        if (lastPointX !== undefined) {
            this.phase.pointDb.remove([lastPointX, lastPointY]);
            this.redrawRoomCreation(this.currentRoom, this.currentRoomDisplay, false, true, FillType.SELECTION);
            this.redrawLastLine(this.currentRoom, point);
        }
    }

    initRoomCreation() {
        this.endRoomCreation(false);
        this.currentRoom = [];
    }

    addRoom(r: RoomComponent) {
        let g = new PIXI.Graphics();

        this.displayRooms.addChild(g);
        r._graphics = g;
        this.redrawComponent(r);
    }

    endRoomCreation(save: boolean) {
        if (this.currentRoom === undefined) {
            return;
        }
        this.currentRoomDisplay.clear();
        this.currentRoomDisplayLastSegment.clear();
        let room = this.currentRoom;
        this.currentRoom = undefined;

        let minX = Infinity, minY = Infinity;

        for (let i = 0; i < room.length; i += 2) {
            minX = Math.min(minX, room[i]);
            minY = Math.min(minY, room[i + 1]);
        }

        let polygon = new Array<number>(room.length);
        for (let i = 0; i < room.length; i += 2) {
            polygon[i] = room[i] - minX;
            polygon[i + 1] = room[i + 1] - minY;
        }

        if (save) {
            let id = this.ecs.spawnEntity(
                {
                    type: "position",
                    x: minX,
                    y: minY,
                } as PositionComponent,
                {
                    type: "room",
                    polygon: polygon,
                    _worldPolygon: room,
                    visible: false,
                } as RoomComponent,
            );
            this.phase.selection.setOnlyEntity(id);
            this.phase.changeTool(Tool.INSPECT);
        }
    }

    redrawComponent(room: RoomComponent) {
        room._graphics.position.set(0, 0);
        room._graphics.cacheAsBitmap = false;

        let fillType = FillType.NONE;

        if (room._selected === true) {
            fillType = FillType.SELECTION;
        } else if (!room.visible) {
            fillType = FillType.OBSCURED;
        }

        this.redrawRoomCreation(room._worldPolygon, room._graphics, true, false, fillType);
        //room._graphics.cacheAsBitmap = true;
    }

    redrawRoomCreation(room: number[], display: PIXI.Graphics, close: boolean, drawPoints: boolean, fillType: FillType) {
        display.clear();

        let fillColor = 0, fillAlpha = 0;
        if (fillType === FillType.SELECTION) {
            fillColor = 0x7986CB;
            fillAlpha = 0.2;
        } else if (fillType === FillType.OBSCURED) {
            fillColor = 0;
            fillAlpha = 0.5;
        }


        if (room.length === 0) return;
        if (fillType !== FillType.NONE) display.beginFill(fillColor, fillAlpha);
        display.moveTo(room[0], room[1]);

        display.lineStyle(5);
        for (let i = 2; i < room.length; i += 2) {
            display.lineTo(room[i], room[i + 1]);
        }
        if (close) {
            display.lineTo(room[0], room[1]);
        }
        if (fillType !== FillType.NONE) display.endFill();

        if (drawPoints) {
            display.lineStyle(0);
            display.beginFill(0xe51010);
            display.drawCircle(room[0], room[1], 10);

            display.endFill();
            display.beginFill();

            for (let i = 2; i < room.length; i += 2) {
                display.drawCircle(room[i], room[i + 1], 10);
            }
            display.endFill();
        }
    }

    redrawLastLine(room: number[], point: PIXI.Point) {
        let g = this.currentRoomDisplayLastSegment;
        g.clear();
        if (room.length !== 0) {
            g.lineTo(room[room.length - 2], room[room.length - 1]);
            g.lineStyle(5);
            g.lineTo(point.x, point.y);
        }
        g.lineStyle(0);
        g.beginFill(0x405FFE);
        g.drawCircle(point.x, point.y, 10);
        g.endFill();
    }

    enable() {
        this.displayRooms = new PIXI.Container();
        this.displayRooms.zIndex = EditMapDisplayPrecedence.ROOM;

        this.currentRoomDisplay = new PIXI.Graphics();
        this.currentRoomDisplay.zIndex = EditMapDisplayPrecedence.ROOM_CREATOR;
        this.currentRoomDisplayLastSegment = new PIXI.Graphics();
        this.currentRoomDisplayLastSegment.zIndex = EditMapDisplayPrecedence.ROOM_CREATOR + 1;
        this.phase.board.addChild(this.displayRooms, this.currentRoomDisplay, this.currentRoomDisplayLastSegment);
    }

    destroy(): void {
        this.displayRooms.destroy(DESTROY_ALL);
        this.currentRoomDisplay.destroy(DESTROY_ALL);
        this.currentRoomDisplayLastSegment.destroy(DESTROY_ALL);
    }
}