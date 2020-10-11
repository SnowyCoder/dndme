import PIXI from "../../PIXI";
import {System} from "../system";
import {World} from "../ecs";
import {EditMapPhase, Tool} from "../../phase/editMap/editMapPhase";
import {DESTROY_ALL} from "../../util/pixi";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {SingleEcsStorage} from "../storage";
import {Component, PositionComponent} from "../component";
import {distSquared2d, Point} from "../../util/geometry";
import {Aabb} from "../../geometry/aabb";
import {Line} from "../../geometry/line";
import {intersectSegmentVsSegment, lineSameSlope, SegmentVsSegmentRes} from "../../geometry/collision";
import {app} from "../../index";
import {InteractionComponent, LineShape, shapeAabb, shapeLine} from "./interactionSystem";
import {VisibilityBlocker} from "./visibilitySystem";
import {PlayerVisibleComponent} from "./playerSystem";
import {Resource} from "../resource";
import {LocalLightSettings} from "./lightSystem";

export interface WallComponent extends Component {
    type: 'wall';
    vec: Point;
    visible: boolean,
    _display: PIXI.Graphics;
    _selected?: boolean;
}

const SELECTION_COLOR = 0x7986CB;

export class WallSystem implements System {
    readonly ecs: World;
    readonly phase: EditMapPhase;

    readonly storage = new SingleEcsStorage<WallComponent>('wall');

    displayWalls: PIXI.Container;

    // Sprite of the pin to be created
    createdIds: number[] = [];
    createdLastPos?: Point;
    createLastLineDisplay: PIXI.Graphics;

    layer: PIXI.display.Layer;

    isTranslating: boolean = false;


    constructor(world: World, phase: EditMapPhase) {
        this.ecs = world;
        this.phase = phase;

        world.addStorage(this.storage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
        world.events.on('selection_begin', this.onSelectionBegin, this);
        world.events.on('selection_end', this.onSelectionEnd, this);
        world.events.on('tool_move_begin', this.onToolMoveBegin, this);
        world.events.on('tool_move_end', this.onToolMoveEnd, this);
    }

    private onComponentAdd(component: Component): void {
        if (component.type !== 'wall') return;
        let wall = component as WallComponent;
        let pos = this.ecs.getComponent(wall.entity, "position") as PositionComponent;
        if (pos === undefined) {
            console.warn("Found wall without position, please add first the position, then the wall");
            return;
        }

        if (wall.visible === undefined) wall.visible = false;
        this.addWallDisplay(pos, wall);

        this.ecs.addComponent(component.entity, {
            type: "interaction",
            entity: -1,
            shape: shapeLine(new Line(pos.x, pos.y, pos.x + wall.vec[0], pos.y + wall.vec[1])),
            snapEnabled: true,
            selectPriority: EditMapDisplayPrecedence.WALL,
        } as InteractionComponent);

        if (!wall.visible) {
            this.ecs.addComponent(component.entity, {
                type: "player_visible",
                entity: -1,
                visible: false,
                isWall: true,
            } as PlayerVisibleComponent);
        }

        this.ecs.addComponent(component.entity, {
            type: "visibility_blocker",
            entity: -1
        } as VisibilityBlocker);
    }

    fixWallPreTranslation(walls: WallComponent[]) {
        for (let wall of walls) {
            let visBlock = this.ecs.getComponent(wall.entity, 'visibility_blocker');
            if (visBlock !== undefined) this.ecs.removeComponent(visBlock);
        }


        // what changes here? a little bittle thing:
        // we need to unfix the wall (remove the intersection breaks).

        let wall_index = new Map<string, WallComponent[]>();
        let posStorage = this.ecs.storages.get('position') as SingleEcsStorage<PositionComponent>;

        let insertInIndex = (index: string, wall: WallComponent) => {
            let list = wall_index.get(index);
            if (list === undefined) {
                list = [];
                wall_index.set(index, list);
            }
            list.push(wall);
        };

        for (let wall of walls) {
            let pos = posStorage.getComponent(wall.entity);

            let p1 = pos.x + "@" + pos.y;
            let p2 = (pos.x + wall.vec[0]) + "@" + (pos.y + wall.vec[1]);

            let tryMerge = (index: string): boolean => {
                let mergeWithIndex = undefined;

                let walls = wall_index.get(index);

                if (walls === undefined) return;

                let wlen = walls.length;
                for (let i = 0; i < wlen; i++) {
                    let owall = walls[i];
                    if (lineSameSlope(wall.vec[0], wall.vec[1], owall.vec[0], owall.vec[1])) {
                        mergeWithIndex = i;
                        break;
                    }
                }

                if (mergeWithIndex === undefined) return false;

                let mwall = walls[mergeWithIndex];
                let mpos = posStorage.getComponent(mwall.entity);
                let minChanged = false;
                let x = pos.x;
                let y = pos.y;
                let dx = wall.vec[0];
                let dy = wall.vec[1];

                if (p2 === index) {
                    x += dx;
                    y += dy;
                    dx = -dx;
                    dy = -dy;
                }

                if (mpos.x === x && mpos.y === y) {
                    mpos.x += dx;
                    mpos.y += dy;
                    minChanged = true;
                } else {
                    mwall.vec[0] += wall.vec[0];
                    mwall.vec[1] += wall.vec[1];
                }

                walls.splice(mergeWithIndex, 1);
                let p;
                if (minChanged) {
                    p = mpos.x + "@" + mpos.y;
                } else {
                    p = (mpos.x + mwall.vec[0]) + "@" + (mpos.y + mwall.vec[1]);
                }
                insertInIndex(p, mwall);
                this.ecs.despawnEntity(wall.entity);
                this.redrawWall(mpos, mwall);

                return true;
            };

            if (tryMerge(p1) || tryMerge(p2)) continue;

            insertInIndex(p1, wall);
            insertInIndex(p2, wall);
        }


        // TODO: we need to remove the intersection breaks from the selected walls and also to
        // remove them from the unselected walls (?).
    }

    fixWallPostTranslation(walls: WallComponent[]) {
        // Recompute intersections with other walls.
        // Why not all everything directly? we want to compute also the self-intersections

        let posStorage = this.ecs.storages.get('position') as SingleEcsStorage<PositionComponent>;

        for (let wall of walls) {
            let pos = posStorage.getComponent(wall.entity);
            let points = [pos.x, pos.y, pos.x + wall.vec[0], pos.y + wall.vec[1]];
            this.fixIntersections(points, 0);

            this.ecs.editComponent(pos.entity, "interaction", {
                shape: shapeLine(new Line(points[0], points[1], points[2], points[3])),
            });

            if (points.length > 4) {
                pos.x = points[0];
                pos.y = points[1];
                wall.vec[0] = points[2] - pos.x;
                wall.vec[1] = points[3] - pos.y;
            }

            this.redrawWall(pos, wall);

            let plen = points.length;
            let cIds = [];
            for (let i = 4; i < plen; i += 2) {
                cIds.push(this.createWall(
                    points[i - 2], points[i - 1],
                    points[i], points[i + 1]
                ));
            }
            if (cIds.length > 0) {
                this.phase.selection.addEntities(cIds);
                // TODO: optimization, update the selection only once!
            }
        }
        for (let wall of walls) {
            this.ecs.addComponent(wall.entity, {
                type: "visibility_blocker",
                entity: -1
            } as VisibilityBlocker);
        }
    }


    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === 'player_visible') {
            let  c = comp as PlayerVisibleComponent;
            let wall = this.storage.getComponent(comp.entity);
            if (wall === undefined || !c.visible) return;

            this.ecs.editComponent(comp.entity, 'wall', { visible: true });
            wall._display.visible = true;
            this.ecs.removeComponent(comp);

            return;
        }

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
            this.fixWallPreTranslation([wall]);
            this.fixWallPostTranslation([wall]);
        }

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

    private onComponentRemove(component: Component): void {
        if (component.type !== 'wall') return;
        let wall = component as WallComponent;

        wall._display.destroy(DESTROY_ALL);
    }

    private onResourceEdited(res: Resource, changes: any): void {
        if (res.type === 'local_light_settings' && 'visionType' in changes) {
            let lls = res as LocalLightSettings;
            let visAll = lls.visionType === 'dm';
            for (let c of this.storage.allComponents()) {
                c._display.visible = visAll || c.visible;
            }
        }
    }

    private onSelectionBegin(entity: number): void {
        let wall = this.storage.getComponent(entity);
        if (wall === undefined) return;
        wall._selected = true;
        let pos = this.ecs.getComponent(wall.entity, 'position') as PositionComponent;
        this.redrawWall(pos, wall);
    }

    private onSelectionEnd(entity: number): void {
        let wall = this.storage.getComponent(entity);
        if (wall === undefined) return;
        wall._selected = undefined;
        let pos = this.ecs.getComponent(wall.entity, 'position') as PositionComponent;
        this.redrawWall(pos, wall);
    }

    private onToolMoveBegin(): void {
        this.isTranslating = true;
        let walls = [...this.phase.selection.getSelectedByType("wall")] as WallComponent[];
        this.fixWallPreTranslation(walls);
    }

    private onToolMoveEnd(): void {
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

    private createWall(minX: number, minY: number, maxX: number, maxY: number): number {
        return this.ecs.spawnEntity(
            {
                type: 'position',
                entity: -1,
                x: minX,
                y: minY,
            } as PositionComponent,
            {
                type: 'wall',
                vec: [maxX - minX, maxY - minY],
                visible: false,
                _selected: true,
            } as WallComponent,
        );
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
                this.createdIds.push(this.createWall(
                    points[i - 2], points[i - 1],
                    points[i    ], points[i + 1]
                ));
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
        this.createdLastPos = undefined;

        if (this.createdIds.length === 0) return;

        this.phase.selection.setOnlyEntities(this.createdIds);
        this.createdIds.length = 0;
        this.phase.changeTool(Tool.INSPECT);
    }

    addWallDisplay(pos: PositionComponent, wall: WallComponent) {
        let g = new PIXI.Graphics();

        this.displayWalls.addChild(g);
        wall._display = g;
        this.redrawWall(pos, wall);
    }

    redrawWall(pos: PositionComponent, wall: WallComponent) {
        wall._display.visible = wall.visible || this.phase.lightSystem.localLightSettings.visionType === 'dm';
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