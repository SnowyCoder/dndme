import {Aabb} from "../../geometry/aabb";
import {World} from "../World";
import {INTERACTION_TYPE, InteractionSystem, ObbShape, Shape, ShapeType, shapeAabb, shapeIntersect} from "../systems/back/InteractionSystem";
import {aabbSameOriginDifference, distSquared2d, projectPointOnLine,} from "../../util/geometry";
import {SELECTION_TYPE, SelectionSystem} from "../systems/back/SelectionSystem";
import {KEYBOARD_TYPE, KeyboardResource} from "../systems/back/KeyboardSystem";
import { IPoint } from "@/geometry/point";
import { Graphics, Point, UPDATE_PRIORITY } from "pixi.js";
import { ToolPart } from "../systems/back/ToolSystem";
import SafeEventEmitter from "@/util/safeEventEmitter";
import { BoardTransformResource, GAME_CLOCK_TYPE, PIXI_BOARD_TYPE, PointerClickEvent, PointerDownEvent, PointerEvents, PointerMoveEvent, PointerUpEvent } from "../systems/back/pixi/pixiBoardSystem";
import { overlapRotatedRectVsPoint } from "@/geometry/collision";
import { Obb } from "@/geometry/obb";
import { POSITION_TYPE, TRANSFORM_TYPE } from "../component";
import { executeAndLogCommand } from "../systems/command/command";
import { ComponentEditCommand, EditType, componentEditCommand } from "../systems/command/componentEdit";

import CURSOR_ROTATE_URL from '@/assets/cursor_rotate.png?url';

type CheckPosResult = undefined | {
    type: 'scale',
    vertex: number
} | {
    type: 'rotate',
}


export class TransformToolPart implements ToolPart {
    readonly name = "transform";
    private readonly world: World;
    private readonly selectionSys: SelectionSystem;
    private readonly keyboard: KeyboardResource;
    private readonly boardTrans: BoardTransformResource;

    private display: Graphics;

    private isActive: boolean = false;

    private entity: number | undefined = undefined;
    private entityShape: ObbShape | undefined = undefined;

    private startMousePos = new Point();
    private lastMousePos = new Point();
    private startPos = new Point();
    private startRot: number = 0;
    private startScale: number = 0;
    private fixedVertexPos = new Point();

    private state: 'none' | 'scale' | 'rotate' = 'none';

    constructor(world: World) {
        this.world = world;
        this.selectionSys = world.requireSystem(SELECTION_TYPE)!;
        this.keyboard = world.getResource('keyboard')!;
        this.boardTrans = world.getResource('board_transform')!;

        const decl = this.world.requireSystem('declarative_listener');
        decl.onResource('keyboard', 'shift', () => this.updatePos(this.lastMousePos));

        const board = this.world.requireSystem(PIXI_BOARD_TYPE);
        this.display = new Graphics();
        this.display.parentGroup = board.toolForegroundGroup;
        board.board.addChild(this.display);
    }

    private* createObbs(): Generator<Obb> {
        const shape = this.entityShape;
        if (shape == undefined) return;

        const tmpPoint = new Point(0, 0);
        const size = new Point(20 / this.boardTrans.scaleX, 20 / this.boardTrans.scaleY);
        const anchor = new Point(0.5, 0.5);
        for (let i = 0; i < 8; i += 2) {
            tmpPoint.set(shape.data.rotVertex[i], shape.data.rotVertex[i + 1]);
            const aabb = Aabb.fromPointAnchor(tmpPoint, size, anchor);
            const obb = Obb.fromAabb(aabb);
            obb.rotation = shape.data.rotation;
            obb.recompute();

            yield obb;
        }
    }

    private checkPosition(boardPos: IPoint): CheckPosResult {
        const shape = this.entityShape;
        if (shape == undefined) return undefined;

        let i = 0;
        for (let obb of this.createObbs()) {
            if (overlapRotatedRectVsPoint(obb, boardPos)) {
                return {
                    type: 'scale',
                    vertex: i,
                }
            }
            i += 1;
        }

        const isInside = overlapRotatedRectVsPoint(shape.data, boardPos);
        if (!isInside) return { type: 'rotate' };
        return undefined;
    }

    private redraw() {
        const d = this.display;
        d.clear();
        if (!this.isActive || this.entityShape == null) return;

        //d.lineStyle({ width: 2 / this.boardTrans.scaleX, color: 0xFFFF00 });
        //d.drawPolygon(this.entityShape.data.rotVertex);

        d.lineStyle({ width: 2 / this.boardTrans.scaleX, color: 0xFFFFFF });
        for (let obb of this.createObbs()) {
            d.drawPolygon(obb.rotVertex);
        }
        // Debug points
        /*
        d.lineStyle({ width: 2, color: 0x0000FF });
        d.drawCircle(this.startMousePos.x, this.startMousePos.y, 5);
        d.drawCircle(this.lastMousePos.x, this.lastMousePos.y, 5);

        d.lineStyle({ width: 2, color: 0x00FF00 });
        d.drawCircle(this.fixedVertexPos.x, this.fixedVertexPos.y, 5);

        const a = this.startPos;
        const b = this.startMousePos;
        const p = projectPointOnLine(a.x, a.y, b.x, b.y, this.lastMousePos.x, this.lastMousePos.y);
        d.drawCircle(p[0], p[1], 5);
        */
    }


    private onPointerMove(ev: PointerMoveEvent): void {
        if (this.entity != undefined) {
            const comp = this.world.getComponent(this.entity, 'interaction');
            if (comp == undefined || comp.shape.type != ShapeType.OBB) return;
            this.entityShape = comp.shape as any;
        }

        const pos = this.checkPosition(ev.boardPos);
        switch (pos?.type) {
            case 'rotate':
                ev.cursorStyle = 'url(\'' + CURSOR_ROTATE_URL + '\') 16 16, all-scroll';
                break;
            case 'scale':
                const p = this.world.getComponent(this.entity!, 'position');
                let where = (ev.boardPos.y < (p?.y ?? 0)) != (ev.boardPos.x < (p?.x ?? 0));
                ev.cursorStyle = where ? 'nesw-resize' : 'nwse-resize';
                break;
        }

        if (ev.canBecomeClick) return;

        if (this.state != 'none' && !ev.canBecomeClick) {
            this.lastMousePos.copyFrom(ev.boardPos);
            // Let's scalotate baby! (scalotate = scale + rotate)
            this.updatePos(ev.boardPos);
        }
    }

    private updatePos(mousePos: IPoint): void {
        if (this.state == 'rotate') {
            const startAngle = Math.atan2(this.startMousePos.y - this.startPos.y, this.startMousePos.x - this.startPos.x);
            const newAngle = Math.atan2(mousePos.y - this.startPos.y, mousePos.x - this.startPos.x);
            const diff = newAngle - startAngle;

            let realAngle = this.startRot + diff;

            if (this.keyboard.shift) {
                // Step angles
                const COMPRESISON_VALUE = 16;
                const TANG = Math.PI * 2;
                let compressed = Math.round(realAngle * (COMPRESISON_VALUE / TANG )) * (TANG / COMPRESISON_VALUE);
                realAngle = compressed;
            }

            let cmd = {
                kind: 'cedit',
                edit: [{
                    type: TRANSFORM_TYPE,
                    entity: this.entity!,
                    changes: {
                        rotation: realAngle,
                    },
                }],
            } as ComponentEditCommand;
            executeAndLogCommand(this.world, cmd);
        } else if (this.state == 'scale') {
            let a = this.startPos;
            if (!this.keyboard.shift) a = this.fixedVertexPos;
            const b = this.startMousePos;
            const p = projectPointOnLine(a.x, a.y, b.x, b.y, mousePos.x, mousePos.y);

            const origDist = distSquared2d(a.x, a.y, b.x, b.y);
            const newDist = distSquared2d(a.x, a.y, p[0], p[1]);

            const diff = Math.sqrt(newDist / origDist);

            const newScale =  Math.max(this.startScale * diff, 0.001);
            let newX = this.startPos.x;
            let newY = this.startPos.y;

            if (this.keyboard.shift) {
                // Maintain center the same.
            } else {
                // Fix opposite vertex.
                // (this means moving the center to a new center.)
                const c1x = this.startPos.x - this.fixedVertexPos.x;
                const c1y = this.startPos.y - this.fixedVertexPos.y;
                newX = this.fixedVertexPos.x + c1x * diff;
                newY = this.fixedVertexPos.y + c1y * diff;
            }

            const edits: EditType[] = [
                {
                    entity: this.entity!,
                    type: TRANSFORM_TYPE,
                    changes: {
                        scale: newScale
                    }
                },
                {
                    entity: this.entity!,
                    type: POSITION_TYPE,
                    changes: {
                        x: newX,
                        y: newY,
                    }
                }
            ];
            const cmd = componentEditCommand(undefined, edits);
            executeAndLogCommand(this.world, cmd);
        }
    }

    private updateShape() {
        const comp = this.world.getComponent(this.entity ?? 0, 'interaction');
        if (comp == undefined || comp.shape.type != ShapeType.OBB) return;
        this.entityShape = comp.shape as ObbShape;
    }

    private end() {
        if (this.entity == null) return;

        this.entity = undefined;
        this.entityShape = undefined;

        const clock = this.world.getResource(GAME_CLOCK_TYPE)!;
        clock.ticker.remove(this.redraw, this);
        this.redraw();// clear
    }

    private begin(entity: number) {
        this.entity = entity;
        this.updateShape();

        const clock = this.world.getResource(GAME_CLOCK_TYPE)!;
        clock.ticker.add(this.redraw, this, UPDATE_PRIORITY.HIGH);
    }

    private onPointerDown(ev: PointerDownEvent): void {
        if (ev.consumed) return;

        const pos = this.checkPosition(ev.boardPos);
        if (pos == undefined) return;
        ev.consumed = true;
        this.state = pos.type;
        this.startMousePos.copyFrom(ev.boardPos);

        const p = this.world.getComponent(this.entity!, 'position');
        const t = this.world.getComponent(this.entity!, 'transform');

        if (p != undefined) this.startPos.copyFrom(p);
        this.startRot = t?.rotation ?? 0;
        this.startScale = t?.scale ?? 1;
        if (pos.type === 'scale') {
            const i1 = pos.vertex;
            const i2 = (pos.vertex + 2) % 4;
            const v = this.entityShape!.data.rotVertex;
            this.fixedVertexPos.set(v[i2*2], v[i2*2+1])


            this.startMousePos.set(v[i1*2], v[i1*2+1]);
        }
    }

    private onPointerUp(ev: PointerUpEvent): void {
        this.state = 'none';
    }

    private updateSelection(): void {
        this.end();
        if (!this.isActive) return;

        if (this.selectionSys.selectedEntities.size != 1) {
            return;
        }
        const iterable = this.selectionSys.getSelectedByType('transform');
        for (let e of iterable) {
            const comp = this.world.getComponent(e.entity, 'interaction');
            if (comp == undefined || comp.shape.type != ShapeType.OBB) break;
            this.begin(e.entity);
        }
    }


    onEnable(): void {
        this.isActive = true;
        this.updateSelection();
    }

    onDisable(): void {
        this.isActive = false;
        this.updateSelection();
    }

    initialize(events: SafeEventEmitter): void {
        events.on(PointerEvents.POINTER_MOVE, this.onPointerMove, this);
        events.on(PointerEvents.POINTER_DOWN, this.onPointerDown, this);
        events.on(PointerEvents.POINTER_UP, this.onPointerUp, this);
        events.on('selection_begin', this.updateSelection, this);
        events.on('selection_end', this.updateSelection, this);
    }

    destroy(): void {
    }
}
