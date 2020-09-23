import PIXI from "../../PIXI";
import {System} from "../system";
import {EcsTracker} from "../ecs";
import {EditMapPhase, Tool} from "../../phase/editMap/editMapPhase";
import {DESTROY_ALL} from "../../util/pixi";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {SingleEcsStorage} from "../storage";
import {Component, PositionComponent} from "../component";
import {distSquared2d, Point} from "../../util/geometry";
import {Aabb} from "../../geometry/aabb";
import {Line} from "../../geometry/line";
import {intersectSegmentVsSegment, SegmentVsSegmentRes} from "../../geometry/collision";
import {app} from "../../index";
import {InteractionComponent, LineShape, shapeAabb, shapeLine} from "./interactionSystem";
import {VisibilityBlocker} from "./visibilitySystem";

export interface WallComponent extends Component {
    type: 'wall';
    vec: Point;
    _display: PIXI.Graphics;
    _selected?: boolean;
}

const SELECTION_COLOR = 0x7986CB;

export class WallSystem implements System {
    readonly ecs: EcsTracker;
    readonly phase: EditMapPhase;

    readonly storage = new SingleEcsStorage<WallComponent>('wall');

    displayWalls: PIXI.Container;

    // Sprite of the pin to be created
    createdIds: number[] = [];
    createdLastPos?: Point;
    createLastLineDisplay: PIXI.Graphics;

    layer: PIXI.display.Layer;

    isTranslating: boolean = false;


    constructor(tracker: EcsTracker, phase: EditMapPhase) {
        this.ecs = tracker;
        this.phase = phase;

        tracker.addStorage(this.storage);
        tracker.events.on('component_add', this.onComponentAdd, this);
        tracker.events.on('component_edited', this.onComponentEdited, this);
        tracker.events.on('component_remove', this.onComponentRemove, this);
        tracker.events.on('selection_begin', this.onSelectionBegin, this);
        tracker.events.on('selection_end', this.onSelectionEnd, this);
        tracker.events.on('tool_move_begin', this.onToolMoveBegin, this);
        tracker.events.on('tool_move_end', this.onToolMoveEnd, this);
    }

    onComponentAdd(component: Component): void {
        if (component.type !== 'wall') return;
        let wall = component as WallComponent;
        let pos = this.ecs.getComponent(wall.entity, "position") as PositionComponent;
        if (pos === undefined) {
            console.warn("Found wall without position, please add first the position, then the wall");
            return;
        }

        this.ecs.addComponent(component.entity, {
            type: "interaction",
            entity: -1,
            shape: shapeLine(new Line(pos.x, pos.y, pos.x + wall.vec[0], pos.y + wall.vec[1])),
            snapEnabled: true,
            selectPriority: EditMapDisplayPrecedence.WALL,
        } as InteractionComponent);
        this.ecs.addComponent(component.entity, {
            type: "visibility_blocker",
            entity: -1
        } as VisibilityBlocker);

        this.addWall(pos, wall);
    }

    fixWallPreTranslation(walls: WallComponent[]) {
        // what changes here? a little bittle thing:
        // we need to unfix the wall (remove the intersection breaks).
        // TODO: we need to remove the intersection breaks from the selected walls and also to
        // remove them from the unselected walls (?).
    }

    fixWallPostTranslation(walls: WallComponent[]) {
        // Recompute intersections with other walls.
        // Why not all everything directly? we want to compute also the self-intersections
        // TODO
    }

    onComponentEdited(comp: Component, changed: any): void {
        if (comp.type !== 'wall' && comp.type !== 'position') return;

        let wall, position;
        if (comp.type === 'wall') {
            wall = comp as WallComponent;
            position = this.ecs.getComponent(comp.entity, 'position') as PositionComponent;
        } else {
            wall = this.storage.getComponent(comp.entity);
            position = comp as PositionComponent;
        }

        if (wall === undefined || position === undefined) return;

        /*if (!this.isTranslating) {
            this.fixWallPreTranslation(wall);
            this.fixWallPostTranslation(wall);
        }*/

        if (comp.type === 'position') {
            wall._display.position.set(position.x, position.y);
        } else {
            this.redrawWall(position, wall);
        }
    }

    findLocationOnWall(point: PIXI.Point, radius: number): PIXI.Point | undefined {
        let interactionSystem = this.phase.interactionSystem;

        let points = interactionSystem.query(shapeAabb(new Aabb(
            point.x - radius, point.y - radius,
            point.x + radius, point.y + radius
        )), c => {
            return this.storage.getComponent(c.entity) !== undefined;
        });
        let bestPoint = new PIXI.Point();
        let bestDist = Number.POSITIVE_INFINITY;

        let tmpPoint = new PIXI.Point();
        for (let node of points) {
            let line = (node.shape as LineShape).data;
            if (!line.projectPoint(point, tmpPoint)) {
                continue;
            }
            let dist = distSquared2d(tmpPoint.x, tmpPoint.y, point.x, point.y);

            if (dist < bestDist && dist < radius) {
                bestPoint.copyFrom(tmpPoint);
                bestDist = dist;
            }
        }

        if (bestDist !== Number.POSITIVE_INFINITY) {
            return bestPoint;
        } else {
            return undefined;
        }
    }

    onComponentRemove(component: Component): void {
        if (component.type !== 'wall') return;
        let wall = component as WallComponent;

        wall._display.destroy(DESTROY_ALL);
    }

    onSelectionBegin(entity: number): void {
        let wall = this.storage.getComponent(entity);
        if (wall === undefined) return;
        wall._selected = true;
        let pos = this.ecs.getComponent(wall.entity, 'position') as PositionComponent;
        this.redrawWall(pos, wall);
    }

    onSelectionEnd(entity: number): void {
        let wall = this.storage.getComponent(entity);
        if (wall === undefined) return;
        wall._selected = undefined;
        let pos = this.ecs.getComponent(wall.entity, 'position') as PositionComponent;
        this.redrawWall(pos, wall);
    }

    onToolMoveBegin(): void {
        this.isTranslating = true;
        let walls = [...this.phase.selection.getSelectedByType("wall")] as WallComponent[];
        this.fixWallPreTranslation(walls);
    }

    onToolMoveEnd(): void {
        this.isTranslating = false;
        let walls = [...this.phase.selection.getSelectedByType("wall")] as WallComponent[];
        this.fixWallPostTranslation(walls);
    }

    fixIntersections(strip: number[], start: number, end?: number): number {
        let aabb = new Aabb(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

        end = end === undefined ? strip.length : end;

        for (let i = start; i < end; i += 2) {
            aabb.minX = Math.min(aabb.minX, strip[i]);
            aabb.minY = Math.min(aabb.minY, strip[i + 1]);
            aabb.maxX = Math.max(aabb.maxX, strip[i]);
            aabb.maxY = Math.max(aabb.maxY, strip[i + 1]);
        }

        let tmpLine = new Line(0, 0, 0, 0);
        let tmpPoint = new PIXI.Point();
        let query = this.phase.interactionSystem.query(shapeAabb(aabb), c => {
            return this.storage.getComponent(c.entity) !== undefined;
        });

        for (let wall of query) {
            //console.log("Checking wall: ", wall.tag);
            for (let i = start + 2; i < end; i += 2) {
                tmpLine.fromX = strip[i - 2];
                tmpLine.fromY = strip[i - 1];
                tmpLine.toX = strip[i];
                tmpLine.toY = strip[i + 1];
                let line = (wall.shape as LineShape).data;
                let res = intersectSegmentVsSegment(tmpLine, line, tmpPoint);
                // Only continue if the intersection is inside of both lines (not on the edge)
                if (res !== SegmentVsSegmentRes.INTERN) continue;
                // Insert the intersection point in the strip
                //console.log("FIXING AT: " + tmpPoint.x + ", " + tmpPoint.y);
                strip.splice(i, 0, tmpPoint.x, tmpPoint.y);
                i += 2;// Skip this point
                end += 2;
            }
        }
        return end;
    }

    private createWall(minX: number, minY: number, maxX: number, maxY: number): void {
        let id = this.ecs.spawnEntity(
            {
                type: 'position',
                entity: -1,
                x: minX,
                y: minY,
            } as PositionComponent,
            {
                type: 'wall',
                vec: [maxX - minX, maxY - minY],
                _selected: true,
            } as WallComponent,
        );
        this.createdIds.push(id);
    }

    addVertex(point: PIXI.Point): void {
        let lp = this.createdLastPos;

        if (lp === undefined) {
            this.createdLastPos = [point.x, point.y];
        } else if (point.x == lp[0] && point.y == lp[1]) {
            this.endCreation();
        } else {
            let points = [lp[0], lp[1], point.x, point.y];
            this.fixIntersections(points, 0);
            let plen = points.length;

            for (let i = 2; i < plen; i += 2) {
                this.createWall(
                    points[i - 2], points[i - 1],
                    points[i    ], points[i + 1]
                );
            }
            this.createdLastPos = [point.x, point.y];
        }
    }

    undoVertex(point: PIXI.Point): void {
        if (this.createdLastPos === undefined) return;

        if (this.createdIds.length === 0) {
            this.createdLastPos = undefined;
        } else {
            let lastCreated = this.createdIds.pop();

            let wallPos = this.ecs.getComponent(lastCreated, 'position') as PositionComponent;
            let wall = this.storage.getComponent(lastCreated);

            if (wallPos.x === this.createdLastPos[0] && wallPos.y == this.createdLastPos[1]) {
                this.createdLastPos = [
                    wallPos.x + wall.vec[0],
                    wallPos.y + wall.vec[1],
                ];
            } else {
                this.createdLastPos = [
                    wallPos.x,
                    wallPos.y,
                ];
            }

            this.ecs.despawnEntity(lastCreated);
        }

        this.redrawCreationLastLine(point);
    }

    initCreation(): void {
        this.endCreation();
    }

    endCreation(): void {
        this.createLastLineDisplay.clear();

        if (this.createdIds.length === 0) return;

        this.phase.selection.setOnlyEntities(this.createdIds);
        this.createdIds.length = 0;
        this.phase.changeTool(Tool.INSPECT);
    }

    addWall(pos: PositionComponent, wall: WallComponent) {
        let g = new PIXI.Graphics();

        this.displayWalls.addChild(g);
        wall._display = g;
        this.redrawWall(pos, wall);
    }

    redrawWall(pos: PositionComponent, wall: WallComponent) {
        wall._display.position.set(pos.x, pos.y);

        let color = 0;

        if (wall._selected) {
            color = SELECTION_COLOR;
        }

        let strip = [
            0, 0,
            wall.vec[0], wall.vec[1]
        ];

        this.redrawWall0(wall._display, strip, wall._selected, color);
    }

    redrawWall0(display: PIXI.Graphics, strip: number[], drawPoints: boolean, color: number) {
        display.clear();

        if (strip.length === 0) return;
        display.moveTo(strip[0], strip[1]);

        display.lineStyle(5, color);
        for (let i = 2; i < strip.length; i += 2) {
            display.lineTo(strip[i], strip[i + 1]);
        }

        if (drawPoints) {
            display.lineStyle(0);
            display.beginFill(0xe51010);
            display.drawCircle(strip[0], strip[1], 10);

            display.endFill();
            display.beginFill(color);

            for (let i = 2; i < strip.length; i += 2) {
                display.drawCircle(strip[i], strip[i + 1], 10);
            }
            display.endFill();
        }
    }

    redrawCreationLastLine(pos: PIXI.Point): void {
        let g = this.createLastLineDisplay;
        g.clear();

        if (this.createdLastPos !== undefined) {
            g.moveTo(this.createdLastPos[0], this.createdLastPos[1]);
            g.lineStyle(5, SELECTION_COLOR);
            g.lineTo(pos.x, pos.y);
        }
        g.lineStyle(0);
        if (this.createdIds.length === 0 && this.createdLastPos !== undefined) {
            g.beginFill(0xe51010);
            g.drawCircle(this.createdLastPos[0], this.createdLastPos[1], 10);
        }
        g.beginFill(0x405FFE);
        g.drawCircle(pos.x, pos.y, 10);
    }

    enable() {
        this.layer = new PIXI.display.Layer();
        this.layer.zIndex = EditMapDisplayPrecedence.WALL;
        this.layer.interactive = false;
        app.stage.addChild(this.layer);

        this.displayWalls = new PIXI.Container();
        this.displayWalls.parentLayer = this.layer;
        this.displayWalls.interactive = false;
        this.displayWalls.interactiveChildren = false;
        this.createLastLineDisplay = new PIXI.Graphics();
        this.createLastLineDisplay.parentLayer = this.layer
        this.createLastLineDisplay.zOrder = 2;

        this.phase.board.addChild(this.displayWalls, this.createLastLineDisplay);
    }

    destroy(): void {
        this.layer.destroy(DESTROY_ALL);
        this.displayWalls.destroy(DESTROY_ALL);
        this.createLastLineDisplay.destroy(DESTROY_ALL)
    }
}