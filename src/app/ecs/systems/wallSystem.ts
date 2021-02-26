import PIXI from "../../PIXI";
import {System} from "../system";
import {World} from "../world";
import {DESTROY_ALL} from "../../util/pixi";
import {DisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {SingleEcsStorage} from "../storage";
import {Component, POSITION_TYPE, PositionComponent} from "../component";
import {distSquared2d, Point} from "../../util/geometry";
import {Aabb} from "../../geometry/aabb";
import {Line} from "../../geometry/line";
import {intersectSegmentVsSegment, lineSameSlope, SegmentVsSegmentRes} from "../../geometry/collision";
import {INTERACTION_TYPE, InteractionSystem, LineShape, shapeAabb, shapeLine} from "./interactionSystem";
import {VISIBILITY_BLOCKER_TYPE, VisibilityBlocker} from "./visibilitySystem";
import {ElementType, GRAPHIC_TYPE, GraphicComponent, LineElement, VisibilityType} from "../../graphics";
import {TOOL_TYPE, ToolDriver, ToolSystem} from "./toolSystem";
import {
    PIXI_BOARD_TYPE,
    PixiBoardSystem,
    PointerClickEvent,
    PointerMoveEvent,
    PointerRightDownEvent
} from "./pixiBoardSystem";
import { getMapPointFromMouseInteraction } from "../tools/utils";
import {SELECTION_TYPE, SelectionSystem} from "./selectionSystem";
import {Tool} from "../tools/toolType";

export const WALL_TYPE = 'wall';
export type WALL_TYPE = 'wall';
export interface WallComponent extends Component {
    type: WALL_TYPE;
    vec: Point;
    _dontMerge: number;
}

const SELECTION_COLOR = 0x7986CB;

export class WallSystem implements System {
    readonly name = WALL_TYPE;
    readonly dependencies = [INTERACTION_TYPE, GRAPHIC_TYPE, TOOL_TYPE, SELECTION_TYPE];

    readonly world: World;
    readonly interactionSys: InteractionSystem;
    readonly selectionSys: SelectionSystem;

    readonly storage = new SingleEcsStorage<WallComponent>(WALL_TYPE);

    isTranslating: boolean = false;

    constructor(world: World) {
        this.world = world;

        // Only masters can create walls
        if (this.world.isMaster) {
            let toolSys = world.systems.get(TOOL_TYPE) as ToolSystem;
            toolSys.addTool(new CreateWallToolDriver(this));
        }

        this.interactionSys = world.systems.get(INTERACTION_TYPE) as InteractionSystem;
        this.selectionSys = world.systems.get(SELECTION_TYPE) as SelectionSystem;

        world.addStorage(this.storage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('tool_move_begin', this.onToolMoveBegin, this);
        world.events.on('tool_move_end', this.onToolMoveEnd, this);
    }

    private onComponentAdd(component: Component): void {
        if (component.type !== WALL_TYPE) return;
        let wall = component as WallComponent;
        let pos = this.world.getComponent(wall.entity, POSITION_TYPE) as PositionComponent;
        if (pos === undefined) {
            console.warn("Found wall without position, please add first the position, then the wall");
            return;
        }
        wall._dontMerge = 0;

        this.world.addComponent(component.entity, {
            type: VISIBILITY_BLOCKER_TYPE,
            entity: -1
        } as VisibilityBlocker);

        this.world.addComponent(component.entity, {
            type: GRAPHIC_TYPE,
            entity: -1,
            display: {
                type: ElementType.LINE,
                ignore: false,
                visib: VisibilityType.REMEMBER,
                priority: DisplayPrecedence.WALL,
                vec: { x: wall.vec[0], y: wall.vec[1] },
            } as LineElement,
            interactive: true,
            isWall: true,
        } as GraphicComponent);
    }

    fixWallPreTranslation(walls: WallComponent[]) {
        for (let wall of walls) {
            let visBlock = this.world.getComponent(wall.entity, VISIBILITY_BLOCKER_TYPE);
            if (visBlock !== undefined) this.world.removeComponent(visBlock);
        }

        // what changes here? a little bittle thing:
        // we need to unfix the wall (remove the intersection breaks).

        let wall_index = new Map<string, WallComponent[]>();
        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        let insertInIndex = (index: string, wall: WallComponent) => {
            let list = wall_index.get(index);
            if (list === undefined) {
                list = [];
                wall_index.set(index, list);
            }
            list.push(wall);
        };

        for (let wall of walls) {
            if (wall._dontMerge !== 0) continue;
            let pos = posStorage.getComponent(wall.entity)!;

            let p1 = pos.x + "@" + pos.y;
            let p2 = (pos.x + wall.vec[0]) + "@" + (pos.y + wall.vec[1]);

            let tryMerge = (index: string): boolean => {
                let mergeWithIndex = undefined;

                let walls = wall_index.get(index);

                if (walls === undefined) return false;

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
                let mpos = posStorage.getComponent(mwall.entity)!;
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
                this.world.despawnEntity(wall.entity);
                this.redrawWall(mwall);

                return true;
            };

            if (tryMerge(p1) || tryMerge(p2)) continue;

            insertInIndex(p1, wall);
            insertInIndex(p2, wall);
        }
    }

    fixWallPostTranslation(walls: WallComponent[]) {
        // Recompute intersections with other walls.
        // Why not all everything directly? we want to compute also the self-intersections

        let posStorage = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;

        for (let wall of walls) {
            let pos = posStorage.getComponent(wall.entity)!;
            let points = [pos.x, pos.y, pos.x + wall.vec[0], pos.y + wall.vec[1]];
            this.fixIntersections(points, 0);

            this.world.editComponent(pos.entity, INTERACTION_TYPE, {
                shape: shapeLine(new Line(points[0], points[1], points[2], points[3])),
            });

            if (points.length > 4) {
                pos.x = points[0];
                pos.y = points[1];
                wall.vec[0] = points[2] - pos.x;
                wall.vec[1] = points[3] - pos.y;
            }

            this.redrawWall(wall);

            let plen = points.length;
            let cIds = [];
            for (let i = 4; i < plen; i += 2) {
                cIds.push(this.createWall(
                    points[i - 2], points[i - 1],
                    points[i], points[i + 1]
                ));
            }
            if (cIds.length > 0) {
                this.selectionSys.addEntities(cIds);
                // TODO: optimization, update the selection only once!
            }
        }
        for (let wall of walls) {
            this.world.addComponent(wall.entity, {
                type: "visibility_blocker",
                entity: -1
            } as VisibilityBlocker);
        }
    }


    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type !== WALL_TYPE && comp.type !== POSITION_TYPE) return;

        let wall, position;
        if (comp.type === WALL_TYPE) {
            wall = comp as WallComponent;
            position = this.world.getComponent(comp.entity, POSITION_TYPE) as PositionComponent;
        } else {
            wall = this.storage.getComponent(comp.entity);
            position = comp as PositionComponent;
        }

        if (wall === undefined || position === undefined) return;

        if (!this.isTranslating) {
            this.fixWallPreTranslation([wall]);
            this.fixWallPostTranslation([wall]);
        }

        if (comp.type === WALL_TYPE && 'vec' in changed) {
            this.redrawWall(wall);
        }
    }

    private redrawWall(wall: WallComponent): void {
        let display = (this.world.getComponent(wall.entity, GRAPHIC_TYPE) as GraphicComponent).display as LineElement;
        display.vec = { x: wall.vec[0], y: wall.vec[1] };
        this.world.editComponent(wall.entity, GRAPHIC_TYPE, {display}, undefined, false);
    }

    findLocationOnWall(point: PIXI.Point, radius: number): PIXI.Point | undefined {
        let points = this.interactionSys.query(shapeAabb(new Aabb(
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
        if (component.type !== WALL_TYPE) return;

        let vblocker = this.world.getComponent(component.entity, VISIBILITY_BLOCKER_TYPE);
        if (vblocker !== undefined) {
            this.world.removeComponent(vblocker);
        }
    }

    private onToolMoveBegin(): void {
        this.isTranslating = true;
        let walls = [...this.selectionSys.getSelectedByType(WALL_TYPE)] as WallComponent[];
        this.fixWallPreTranslation(walls);
    }

    private onToolMoveEnd(): void {
        this.isTranslating = false;
        let walls = [...this.selectionSys.getSelectedByType(WALL_TYPE)] as WallComponent[];
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
        let query = this.interactionSys.query(shapeAabb(aabb), c => {
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

    createWall(minX: number, minY: number, maxX: number, maxY: number): number {
        return this.world.spawnEntity(
            {
                type: POSITION_TYPE,
                entity: -1,
                x: minX,
                y: minY,
            } as PositionComponent,
            {
                type: WALL_TYPE,
                vec: [maxX - minX, maxY - minY],
            } as WallComponent,
        );
    }

    enable(): void {
    }

    destroy(): void {
    }
}

export class CreateWallToolDriver implements ToolDriver {
    readonly name = Tool.CREATE_WALL;

    private readonly sys: WallSystem;
    private readonly pixiBoardSys: PixiBoardSystem;

    // Sprite of the pin to be created
    createdIds: number[] = [];
    createdLastPos?: Point;
    createLastLineDisplay: PIXI.Graphics;

    constructor(sys: WallSystem) {
        this.sys = sys;
        this.createLastLineDisplay = new PIXI.Graphics();
        this.pixiBoardSys = sys.world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
    }

    initCreation(): void {
        this.endCreation();
    }

    endCreation(): void {
        this.createLastLineDisplay.clear();
        this.createdLastPos = undefined;

        if (this.createdIds.length === 0) return;

        this.sys.selectionSys.setOnlyEntities(this.createdIds);
        this.createdIds.length = 0;
        this.sys.world.editResource(TOOL_TYPE, {
            tool: Tool.INSPECT,
        })
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

    addVertex(point: PIXI.Point): void {
        let lp = this.createdLastPos;

        if (lp === undefined) {
            this.createdLastPos = [point.x, point.y];
        } else if (point.x == lp[0] && point.y == lp[1]) {
            this.endCreation();
        } else {
            let points = [lp[0], lp[1], point.x, point.y];
            this.sys.fixIntersections(points, 0);
            let plen = points.length;

            for (let i = 2; i < plen; i += 2) {
                this.createdIds.push(this.sys.createWall(
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
            let lastCreated = this.createdIds.pop()!;

            let wallPos = this.sys.world.getComponent(lastCreated, POSITION_TYPE)! as PositionComponent;
            let wall = this.sys.storage.getComponent(lastCreated)!;

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

            this.sys.world.despawnEntity(lastCreated);
        }

        this.redrawCreationLastLine(point);
    }

    onStart(): void {
        this.initCreation();
    }

    onPointerMove(event: PointerMoveEvent) {
        let point = getMapPointFromMouseInteraction(this.sys.world, event);
        this.redrawCreationLastLine(point);
    }

    onPointerClick(event: PointerClickEvent) {
        let point = getMapPointFromMouseInteraction(this.sys.world, event);
        this.addVertex(point);
    }

    onPointerRightDown(event: PointerRightDownEvent) {
        let point = getMapPointFromMouseInteraction(this.sys.world, event);
        this.undoVertex(point);
    }

    onEnd(): void {
        this.endCreation();
    }

    initialize(): void {
        this.createLastLineDisplay.zIndex = DisplayPrecedence.WALL + 1;
        this.createLastLineDisplay.interactive = false;
        this.createLastLineDisplay.interactiveChildren = false;
        this.pixiBoardSys.board.addChild(this.createLastLineDisplay);
        this.pixiBoardSys.board.sortChildren();
    }

    destroy(): void {
        this.createLastLineDisplay.destroy(DESTROY_ALL)
    }
}