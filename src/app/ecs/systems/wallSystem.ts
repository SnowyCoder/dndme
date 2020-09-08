import PIXI from "../../PIXI";
import {System} from "../system";
import {EcsTracker} from "../ecs";
import {EditMapPhase, Tool} from "../../phase/editMap/editMapPhase";
import {DESTROY_ALL} from "../../util/pixi";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {SingleEcsStorage} from "../storage";
import {Component, PositionComponent} from "../component";
import {distSquared2d} from "../../util/geometry";
import {DynamicTree} from "../../geometry/dynamicTree";
import {Aabb} from "../../geometry/aabb";
import {Line} from "../../geometry/line";
import {intersectSegmentVsSegment, SegmentVsSegmentRes} from "../../geometry/collision";
import {EPSILON} from "../../geometry/visibilityPolygon";
import {app} from "../../index";

export interface WallComponent extends Component {
    type: 'wall';
    lineStrip: number[];
    _worldStrip: number[];
    _worldStripIds: number[];
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
    createStrip?: number[];
    createStripIds?: number[];
    createDisplay: PIXI.Graphics;
    createLastLineDisplay: PIXI.Graphics;

    layer: PIXI.display.Layer;

    wallAabbTree = new DynamicTree<[Line, number]>(0, 1);// Static tree

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

    findWallAt(point: PIXI.IPointData): number | undefined {
        let r = 20;
        let points = this.wallAabbTree.query(new Aabb(
            point.x - r, point.y - r,
            point.x + r, point.y + r
        ));
        let r2 = r*r;
        let bestWall = undefined;
        let bestDist = Number.POSITIVE_INFINITY;

        let tmpPoint = new PIXI.Point();
        for (let node of points) {
            let line = node.tag[0];
            if (!line.projectPoint(point, tmpPoint, true)) {
                continue;
            }
            let dist = distSquared2d(tmpPoint.x, tmpPoint.y, point.x, point.y);

            if (dist < bestDist && dist < r2) {
                bestWall = node.tag[1];
                bestDist = dist;
            }
        }

        return bestWall;
    }

    private addStripToLocator(wallId: number, strip: number[], stripIds: number[], start: number = 0, end?: number) {
        end = end !== undefined ? end : strip.length;
        //console.log("Adding from: " + start + " to " + end);
        for (let i = start; i < end; i += 2) {
            this.phase.pointDb.insert([strip[i], strip[i + 1]])
        }
        for (let i = Math.max(start, 2); i < end; i += 2) {
            stripIds[i / 2 - 1] = this.wallAabbTree.createProxy(new Aabb(
                strip[i - 2],
                strip[i - 1],
                strip[i],
                strip[i + 1]
            ), [new Line(
                strip[i - 2],
                strip[i - 1],
                strip[i],
                strip[i + 1]
            ), wallId]);
        }
    }

    private removeStripFromLocator(strip: number[], stripIds: number[], start: number = 0, end?: number) {
        end = end !== undefined ? end : strip.length;
        //console.log("Removing from: " + start + " to " + end);
        for (let i = start; i < end; i += 2) {
            this.phase.pointDb.remove([strip[i], strip[i + 1]])
        }

        let from = Math.max(start / 2 - 1, 0);
        let to = end / 2 - 1;
        for (let i = from; i < to; i++) {
            this.wallAabbTree.destroyProxy(stripIds[i]);
        }
        stripIds.length = from + 1;
    }

    onComponentAdd(component: Component): void {
        if (component.type !== 'wall') return;
        let wall = component as WallComponent;
        let pos = this.ecs.getComponent(wall.entity, "position") as PositionComponent;
        if (pos === undefined) {
            console.warn("Found wall without position, please add first the position, then the wall");
            return;
        }

        if (wall._worldStrip === undefined) {
            this.recomputeWorldCoords(pos, wall);
            wall._worldStripIds = [];
            this.addStripToLocator(wall.entity, wall._worldStrip, wall._worldStripIds);
        }

        this.addWall(pos, wall);
    }

    fixWallPreTranslation(wall: WallComponent) {
        this.removeStripFromLocator(wall._worldStrip, wall._worldStripIds);
        // what changes here? a little bittle thing:
        // we need to unfix the wall (remove the intersection breaks).

        let s = wall.lineStrip;
        for (let i = 4; i < s.length; i += 2) {
            let prevX = s[i - 4];
            let prevY = s[i - 3];
            let currX = s[i - 2];
            let currY = s[i - 1];
            let nextX = s[i    ];
            let nextY = s[i + 1];

            let dPrev = (currY - prevY) * (nextX - currX);
            let dNext = (nextY - currY) * (currX - prevX);

            if (Math.abs(dPrev - dNext) < EPSILON) {
                s.splice(i - 2, 2);// Remove middle point
                i -= 2;// Fix iterator;
            }
        }
    }

    fixWallPostTranslation(wall: WallComponent) {
        let pos = this.ecs.getComponent(wall.entity, 'position') as PositionComponent;
        this.recomputeWorldCoords(pos, wall);

        let s = wall.lineStrip;
        let ws = wall._worldStrip;
        wall._worldStripIds

        // Recompute intersections with other walls.
        // Why not all everything directly? we want to compute also the self-intersections
        let localDirty = false;
        for (let i = 0; i < ws.length; i += 2) {
            let start = i;
            if (i !== 0) {
                i = this.fixIntersections(ws, start - 2, i + 2) - 2;
            }
            localDirty ||= start !== i;
            this.addStripToLocator(wall.entity, ws, wall._worldStripIds, start, i + 2);
        }

        if (localDirty) {
            //console.log("Recomputing local");
            for (let i = 0; i < ws.length; i += 2) {
                s[i] = ws[i] - pos.x;
                s[i + 1] = ws[i + 1] - pos.y;
            }
        }
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

        if (!this.isTranslating) {
            this.fixWallPreTranslation(wall);
            this.fixWallPostTranslation(wall);
        }

        if (comp.type === 'position') {
            wall._display.position.set(position.x, position.y);
        } else {
            this.redrawWall(position, wall);
        }
    }

    findLocationOnWall(point: PIXI.Point, radius: number): PIXI.Point | undefined {
        let points = this.wallAabbTree.query(new Aabb(
            point.x - radius, point.y - radius,
            point.x + radius, point.y + radius
        ));
        let bestPoint = new PIXI.Point();
        let bestDist = Number.POSITIVE_INFINITY;

        let tmpPoint = new PIXI.Point();
        for (let node of points) {
            let line = node.tag[0];
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
        this.removeStripFromLocator(wall._worldStrip, wall._worldStripIds);

        (component as WallComponent)._display.destroy(DESTROY_ALL);
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
        for (let component of this.phase.selection.getSelectedByType("wall")) {
            let wall = component as WallComponent;
            this.fixWallPreTranslation(wall);
        }
    }

    onToolMoveEnd(): void {
        this.isTranslating = false;
        for (let component of this.phase.selection.getSelectedByType("wall")) {
            let wall = component as WallComponent;
            this.fixWallPostTranslation(wall);
        }
    }

    recomputeWorldCoords(pos: PositionComponent, wall: WallComponent) {
        if (wall._worldStrip === undefined || wall._worldStrip.length !== wall.lineStrip.length) {
            wall._worldStrip = new Array<number>(wall.lineStrip.length);
        }
        let pol = wall._worldStrip;
        for (let i = 0; i < pol.length; i += 2) {
            pol[i] = wall.lineStrip[i] + pos.x;
            pol[i + 1] = wall.lineStrip[i + 1] + pos.y;
        }
    }

    fixIntersections(strip: number[], start: number, end?: number): number {
        let aabb = new Aabb(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

        end = end === undefined ? strip.length : end;

        for (let i = 0; i < strip.length; i += 2) {
            aabb.minX = Math.min(aabb.minX, strip[i]);
            aabb.minY = Math.min(aabb.minY, strip[i + 1]);
            aabb.maxX = Math.max(aabb.maxX, strip[i]);
            aabb.maxY = Math.max(aabb.maxY, strip[i + 1]);
        }

        let tmpLine = new Line(0, 0, 0, 0);
        let tmpPoint = new PIXI.Point();
        for (let wall of this.wallAabbTree.query(aabb)) {
            //console.log("Checking wall: ", wall.tag);
            for (let i = start + 2; i < end; i += 2) {
                tmpLine.fromX = strip[i - 2];
                tmpLine.fromY = strip[i - 1];
                tmpLine.toX = strip[i];
                tmpLine.toY = strip[i + 1];
                let res = intersectSegmentVsSegment(tmpLine, wall.tag[0], tmpPoint);
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

    addVertex(point: PIXI.Point): void {
        let strip = this.createStrip;
        if (strip === undefined) return;

        if (strip.length > 0 && point.x == strip[strip.length - 2] && point.y == strip[strip.length - 1]) {
            this.endCreation(true);
        } else {
            let prevLen = strip.length;
            strip.push(point.x, point.y);
            if (strip.length > 2) {
                this.fixIntersections(strip, strip.length - 4);
            }
            this.addStripToLocator(-1, strip, this.createStripIds, prevLen);
            this.redrawWall0(this.createDisplay, strip, true, SELECTION_COLOR);
        }
    }

    undoVertex(point: PIXI.Point): void {
        let strip = this.createStrip;
        if (strip === undefined) return;

        if (strip.length !== 0) {
            this.removeStripFromLocator(strip, this.createStripIds, strip.length - 2);
            this.createStripIds.length = this.createStripIds.length - 1;
            strip.length = strip.length - 2;

            this.redrawWall0(this.createDisplay, strip, true, SELECTION_COLOR);
            this.redrawCreationLastLine(point);
        }
    }

    initCreation(): void {
        this.endCreation(false);
        this.createStrip = [];
        this.createStripIds = [];
    }

    endCreation(save: boolean): void {
        this.createDisplay.clear();
        this.createLastLineDisplay.clear();
        if (this.createStrip === undefined) return;

        let strip = this.createStrip;
        let stripIds = this.createStripIds;
        this.createStrip = undefined;
        this.createStripIds = undefined;

        if (!save) return;
        if (strip.length < 4) {
            this.removeStripFromLocator(strip, stripIds);
            return;// 2 points = 1 line (2 points = 4 coords)
        }

        let minX = Number.POSITIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        for (let i = 0; i < strip.length; i += 2) {
            minX = Math.min(minX, strip[i]);
            minY = Math.min(minY, strip[i + 1]);
        }

        let newStrip = new Array<number>(strip.length);
        for (let i = 0; i < strip.length; i += 2) {
            newStrip[i] = strip[i] - minX;
            newStrip[i + 1] = strip[i + 1] - minY;
        }

        let id = this.ecs.spawnEntity(
            {
                type: 'position',
                entity: -1,
                x: minX,
                y: minY,
            } as PositionComponent,
            {
                type: 'wall',
                entity: -1,
                lineStrip: newStrip,
                _worldStrip: strip,
                _worldStripIds: stripIds,
            } as WallComponent,
        );

        for (let i = 0; i < stripIds.length; i++) {
            this.wallAabbTree.getTag(stripIds[i])[1] = id;
        }

        this.phase.selection.setOnlyEntity(id);
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

        this.redrawWall0(wall._display, wall.lineStrip, wall._selected, color);
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
        let strip = this.createStrip;
        if (strip === undefined) return;

        let g = this.createLastLineDisplay;
        g.clear();

        if (this.createStrip.length !== 0) {
            g.moveTo(strip[strip.length - 2], strip[strip.length - 1]);
            g.lineStyle(5, SELECTION_COLOR);
            g.lineTo(pos.x, pos.y);
        }
        g.lineStyle(0);
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
        this.createDisplay = new PIXI.Graphics();
        this.createDisplay.interactive = false;
        this.createDisplay.parentLayer = this.layer;
        this.createDisplay.zOrder = 1;
        this.createLastLineDisplay = new PIXI.Graphics();
        this.createLastLineDisplay.parentLayer = this.layer
        this.createLastLineDisplay.zOrder = 2;

        this.phase.board.addChild(this.displayWalls, this.createDisplay, this.createLastLineDisplay);
    }

    destroy(): void {
        this.layer.destroy(DESTROY_ALL);
        this.displayWalls.destroy(DESTROY_ALL);
        this.createDisplay.destroy(DESTROY_ALL);
        this.createLastLineDisplay.destroy(DESTROY_ALL)
    }
}