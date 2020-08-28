import * as PIXI from "pixi.js";
import {System} from "../system";
import {EcsTracker} from "../ecs";
import {EditMapPhase, Tool} from "../../phase/editMap/editMapPhase";
import {DESTROY_ALL} from "../../util/pixi";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {SingleEcsStorage} from "../storage";
import {Component, PositionComponent} from "../component";
import {LineAreaDb} from "../../game/lineAreaDb";
import {distSquared2d, projectPointOnLine} from "../../util/geometry";

export interface WallComponent extends Component {
    type: 'wall';
    lineStrip: number[]
    _worldStrip: number[]
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
    createDisplay: PIXI.Graphics;
    createLastLineDisplay: PIXI.Graphics;

    lineAreaDb = new LineAreaDb();

    isTranslating: boolean = false;


    constructor(tracker: EcsTracker, phase: EditMapPhase) {
        this.ecs = tracker;
        this.phase = phase;

        tracker.addStorage(this.storage);
        tracker.events.on('entity_spawned', this.onEntitySpawned, this);
        tracker.events.on('component_edited', this.onComponentEdited, this);
        tracker.events.on('component_remove', this.onComponentRemove, this);
        tracker.events.on('selection_begin', this.onSelectionBegin, this);
        tracker.events.on('selection_end', this.onSelectionEnd, this);
        tracker.events.on('tool_move_begin', this.onToolMoveBegin, this);
        tracker.events.on('tool_move_end', this.onToolMoveEnd, this);
    }

    private addStripToLocator(strip: number[], start: number = 0) {
        for (let i = start; i < strip.length; i += 2) {
            this.phase.pointDb.insert([strip[i], strip[i + 1]])
        }
        for (let i = Math.max(start, 2); i < strip.length; i += 2) {
            this.lineAreaDb.addLine({
                minX: strip[i - 2],
                minY: strip[i - 1],
                maxX: strip[i],
                maxY: strip[i + 1]
            });
        }
    }

    private removeStripFromLocator(strip: number[], start: number = 0) {
        for (let i = start; i < strip.length; i += 2) {
            this.phase.pointDb.remove([strip[i], strip[i + 1]])
        }
        for (let i = Math.max(start, 2); i < strip.length; i += 2) {
            this.lineAreaDb.removeLine({
                minX: strip[i - 2],
                minY: strip[i - 1],
                maxX: strip[i],
                maxY: strip[i + 1]
            });
        }
    }

    onEntitySpawned(entity: number): void {
        let wall = this.storage.getComponent(entity);
        if (wall === undefined) return;
        let pos = this.ecs.getComponent(entity, "position") as PositionComponent;
        if (pos === undefined) return;

        if (wall._worldStrip === undefined) {
            this.recomputeWorldCoords(pos, wall);
            this.addStripToLocator(wall._worldStrip);
        }

        this.addWall(pos, wall);
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
            this.removeStripFromLocator(wall._worldStrip);

            this.recomputeWorldCoords(position, wall);

            this.addStripToLocator(wall._worldStrip);
        }

        if (comp.type === 'position') {
            wall._display.position.set(position.x, position.y);
        } else {
            this.redrawWall(position, wall);
        }
    }

    findLocationOnWall(point: PIXI.Point, radius: number): PIXI.Point | undefined {
        let points = this.lineAreaDb.queryAabb(
            point.x - radius, point.y - radius,
            point.x + radius, point.y + radius
        );
        let bestPoint = undefined;
        let bestDist = Number.POSITIVE_INFINITY;

        for (let line of points) {
            let p = projectPointOnLine(line.minX, line.minY, line.maxX, line.maxY, point.x, point.y);
            if (p === undefined) continue;
            let [px, py] = p;
            let dist = distSquared2d(px, py, point.x, point.y);

            if (dist < bestDist && dist < radius) {
                bestPoint = [px, py];
            }
        }

        if (bestPoint !== undefined) {
            return new PIXI.Point(bestPoint[0], bestPoint[1])
        } else {
            return undefined;
        }
    }

    onComponentRemove(component: Component): void {
        if (component.type !== 'wall') return;
        let wall = component as WallComponent;
        this.removeStripFromLocator(wall._worldStrip);

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
            this.removeStripFromLocator(wall._worldStrip);
        }
    }

    onToolMoveEnd(): void {
        this.isTranslating = false;
        for (let component of this.phase.selection.getSelectedByType("wall")) {
            let wall = component as WallComponent;
            let pos = this.ecs.getComponent(component.entity, 'position') as PositionComponent;
            this.recomputeWorldCoords(pos, wall);
            this.addStripToLocator(wall._worldStrip);
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

    addVertex(point: PIXI.Point): void {
        let strip = this.createStrip;
        if (strip === undefined) return;

        if (strip.length > 0 && point.x == strip[strip.length - 2] && point.y == strip[strip.length - 1]) {
            this.endCreation(true);
        } else {
            strip.push(point.x, point.y);
            this.addStripToLocator(strip, strip.length - 2);
            this.redrawWall0(this.createDisplay, strip, true, SELECTION_COLOR);
        }
    }

    undoVertex(point: PIXI.Point): void {
        let strip = this.createStrip;
        if (strip === undefined) return;

        if (strip.length !== 0) {
            this.removeStripFromLocator(strip, strip.length - 2);

            let lastPointY = strip.pop();
            let lastPointX = strip.pop();

            this.redrawWall0(this.createDisplay, strip, true, SELECTION_COLOR);
            this.redrawCreationLastLine(point);
        }
    }

    initCreation(): void {
        this.endCreation(false);
        this.createStrip = [];
    }

    endCreation(save: boolean): void {
        this.createDisplay.clear();
        this.createLastLineDisplay.clear();
        if (this.createStrip === undefined) return;

        let strip = this.createStrip;
        this.createStrip = undefined;

        if (!save) return;
        if (strip.length <= 2) return;

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
            } as WallComponent,
        )

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

        this.redrawWall0(wall._display, wall.lineStrip, false, color);
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
        this.displayWalls = new PIXI.Container();
        this.displayWalls.zIndex = EditMapDisplayPrecedence.WALL;

        this.createDisplay = new PIXI.Graphics();
        this.createDisplay.zIndex = EditMapDisplayPrecedence.WALL_CREATOR;

        this.createLastLineDisplay = new PIXI.Graphics();
        this.createLastLineDisplay.zIndex = EditMapDisplayPrecedence.WALL_CREATOR + 1;

        this.phase.board.addChild(this.displayWalls, this.createDisplay, this.createLastLineDisplay);
    }

    destroy(): void {
        this.displayWalls.destroy(DESTROY_ALL);
        this.createDisplay.destroy(DESTROY_ALL);
    }
}