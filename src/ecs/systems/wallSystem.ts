import {System} from "../System";
import {World} from "../World";
import {DESTROY_ALL} from "../../util/pixi";
import {DisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {SingleEcsStorage} from "../Storage";
import {Component, POSITION_TYPE, PositionComponent, SerializedFlag, SERIALIZED_TYPE, SHARED_TYPE, SharedFlag} from "../component";
import {distSquared2d, RPoint} from "../../util/geometry";
import {Aabb} from "../../geometry/aabb";
import {Line} from "../../geometry/line";
import {intersectSegmentVsSegment, lineSameSlope, SegmentVsSegmentRes} from "../../geometry/collision";
import {INTERACTION_TYPE, InteractionSystem, LineShape, shapeAabb, shapeLine} from "./back/InteractionSystem";
import {BlockDirection, VISIBILITY_BLOCKER_TYPE, VisibilityBlocker} from "./back/VisibilitySystem";
import {ElementType, GRAPHIC_TYPE, GraphicComponent, LineElement, VisibilityType} from "../../graphics";
import {TOOL_TYPE, ToolPart} from "./back/ToolSystem";
import {
    PIXI_BOARD_TYPE,
    PixiBoardSystem,
    PointerClickEvent,
    PointerMoveEvent,
    PointerRightDownEvent,
    PointerEvents
} from "./back/pixi/pixiBoardSystem";
import {SELECTION_TYPE, SelectionSystem} from "./back/SelectionSystem";
import {ToolType} from "../tools/toolType";
import {executeAndLogCommand} from "./command/command";
import {SpawnCommand, SpawnCommandKind} from "./command/spawnCommand";
import {arrayRemoveElem} from "../../util/array";
import {DeSpawnCommand} from "./command/despawnCommand";
import SafeEventEmitter from "../../util/safeEventEmitter";
import { snapPoint } from "../tools/utils";
import { IPoint } from "@/geometry/point";
import { StandardToolbarOrder } from "@/phase/editMap/standardToolbarOrder";
import { ComponentInfoPanel, COMPONENT_INFO_PANEL_TYPE } from "./back/SelectionUiSystem";

import WallIcon from "@/ui/icons/WallIcon.vue";
import EcsWall from "@/ui/ecs/EcsWall.vue";
import WallCreationOptions from "@/ui/edit/creation/WallCreationOptions.vue";

import { Graphics, Point } from "pixi.js";
import { RegisteredComponent } from "../TypeRegistry";
import { Resource } from "../resource";

export const WALL_TYPE = 'wall';
export type WALL_TYPE = typeof WALL_TYPE;
export interface WallComponent extends Component {
    type: WALL_TYPE;
    vec: RPoint;
    thickness?: number;
    blockLight?: BlockDirection,
    blockPlayer?: BlockDirection,
    _dontMerge: number;
}

export interface WallCreationResource extends Resource {
    type: 'wall_creation';
    thickness: number;
    blockLight: BlockDirection,
    blockPlayer: BlockDirection,

    _save: true,
    _sync: false,
}

const SELECTION_COLOR = 0x7986CB;
const DEFAULT_THICKNESS = 5;

export class WallSystem implements System {
    readonly name = WALL_TYPE;
    readonly dependencies = [INTERACTION_TYPE, GRAPHIC_TYPE, TOOL_TYPE, SELECTION_TYPE];

    readonly world: World;
    readonly interactionSys: InteractionSystem;
    readonly selectionSys: SelectionSystem;
    readonly components?: [WallComponent];
    readonly resources?: [WallCreationResource];

    readonly storage = new SingleEcsStorage<WallComponent>(WALL_TYPE);

    isTranslating: boolean = false;

    constructor(world: World) {
        this.world = world;

        // Only masters can create walls
        if (this.world.isMaster) {
            let toolSys = world.requireSystem(TOOL_TYPE);
            toolSys.addToolPart(new CreateWallToolPart(this));
            toolSys.addCreationTool({
                name: ToolType.CREATE_WALL,
                parts: ['space_pan', ToolType.CREATE_WALL],
                additionalOptions: WallCreationOptions,
                toolbarEntry: {
                    icon: WallIcon,
                    title: 'Add wall',
                    priority: StandardToolbarOrder.CREATE_WALL,
                }
            });
            world.addResource({
                type: 'wall_creation',
                thickness: DEFAULT_THICKNESS,
                blockLight: BlockDirection.BOTH,
                blockPlayer: BlockDirection.BOTH,
            } as WallCreationResource);
        }
        world.events.on('populate', () => {
            this.world.spawnEntity({
                type: COMPONENT_INFO_PANEL_TYPE,
                entity: -1,
                component: WALL_TYPE,
                name: 'Wall',
                panel: EcsWall,
                panelPriority: 100,
            } as ComponentInfoPanel);
        });

        this.interactionSys = world.requireSystem(INTERACTION_TYPE);
        this.selectionSys = world.requireSystem(SELECTION_TYPE);

        world.addStorage(this.storage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('tool_move_begin', this.onToolMoveBegin, this);
        world.events.on('tool_move_end', this.onToolMoveEnd, this);
    }

    private onComponentAdd(component: RegisteredComponent): void {
        if (component.type !== WALL_TYPE) return;
        let wall = component;
        let pos = this.world.getComponent(wall.entity, POSITION_TYPE);
        if (pos === undefined) {
            console.warn("Found wall without position, please add first the position, then the wall");
            return;
        }
        wall._dontMerge = 0;

        this.world.addComponent(component.entity, {
            type: GRAPHIC_TYPE,
            entity: -1,
            display: {
                type: ElementType.LINE,
                ignore: false,
                visib: VisibilityType.REMEMBER,
                priority: DisplayPrecedence.WALL,
                thickness: wall.thickness,
                vec: { x: wall.vec[0], y: wall.vec[1] },
            } as LineElement,
            interactive: true,
            isWall: true,
        } satisfies GraphicComponent as GraphicComponent);

        const comp = {
            type: VISIBILITY_BLOCKER_TYPE,
            entity: -1,
            light: wall.blockLight ?? BlockDirection.BOTH,
            player: wall.blockPlayer ?? BlockDirection.BOTH,
        } satisfies VisibilityBlocker;
        this.world.addComponent(component.entity, comp);
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
                    if (wall.thickness == owall.thickness && lineSameSlope(wall.vec[0], wall.vec[1], owall.vec[0], owall.vec[1])) {
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

            const plen = points.length;
            const cIds = [];
            for (let i = 4; i < plen; i += 2) {
                let cmd = this.createWall(
                    points[i - 2], points[i - 1],
                    points[i], points[i + 1],
                    wall.thickness
                );
                cIds.push(cmd.data.entities[0]);
                this.world.deserialize(cmd.data, { remap: false });
            }
            if (cIds.length > 0) {
                this.selectionSys.addEntities(cIds);
                // TODO: optimization, update the selection only once!
            }
        }
        for (let wall of walls) {
            this.world.addComponent(wall.entity, {
                type: "visibility_blocker",
                entity: -1,
                light: wall.blockLight,
                player: wall.blockPlayer,
            } as VisibilityBlocker);
        }
    }


    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type !== WALL_TYPE && comp.type !== POSITION_TYPE) return;

        let wall, position;
        if (comp.type === WALL_TYPE) {
            wall = comp as WallComponent;
            position = this.world.getComponent(comp.entity, POSITION_TYPE);
        } else {
            wall = this.storage.getComponent(comp.entity);
            position = comp as PositionComponent;
        }

        if (wall === undefined || position === undefined) return;

        if (!this.isTranslating) {
            this.fixWallPreTranslation([wall]);
            this.fixWallPostTranslation([wall]);
        }

        if (comp.type === WALL_TYPE && ('vec' in changed || 'thickness' in changed)) {
            this.redrawWall(wall);
        }
        if (comp.type === WALL_TYPE && ('blockPlayer' in changed || 'blockLight' in changed)) {
            this.world.editComponent(comp.entity, 'visibility_blocker', {
                light: wall.blockLight ?? BlockDirection.BOTH,
                player: wall.blockPlayer ?? BlockDirection.BOTH,
            });
        }
    }

    private redrawWall(wall: WallComponent): void {
        let display = this.world.getComponent(wall.entity, GRAPHIC_TYPE)!.display as LineElement;
        display.vec = { x: wall.vec[0], y: wall.vec[1] };
        display.thickness = wall.thickness;
        this.world.editComponent(wall.entity, GRAPHIC_TYPE, {display}, undefined, false);
    }

    findLocationOnWall(point: Point, radius: number): Point | undefined {
        let points = this.interactionSys.query(shapeAabb(new Aabb(
            point.x - radius, point.y - radius,
            point.x + radius, point.y + radius
        )), c => {
            return this.storage.getComponent(c.entity) !== undefined;
        });
        let bestPoint = new Point();
        let bestDist = Number.POSITIVE_INFINITY;

        let tmpPoint = new Point();
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

    public queryIntersections(posX: number, posY: number, vecX: number, vecY: number): number[] {
        let strip = [posX, posY, posX + vecX, posY + vecY];
        let ids = new Array<number>();
        this.fixIntersections(strip, 0, undefined, ids);
        return ids;
    }

    fixIntersections(strip: number[], start: number, end?: number, wallIds?: number[]): number {
        let aabb = new Aabb(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

        end = end === undefined ? strip.length : end;

        for (let i = start; i < end; i += 2) {
            aabb.minX = Math.min(aabb.minX, strip[i]);
            aabb.minY = Math.min(aabb.minY, strip[i + 1]);
            aabb.maxX = Math.max(aabb.maxX, strip[i]);
            aabb.maxY = Math.max(aabb.maxY, strip[i + 1]);
        }

        let tmpLine = new Line(0, 0, 0, 0);
        let tmpPoint = new Point();
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
                wallIds?.push(wall.entity);
            }
        }
        return end;
    }

    createWall(minX: number, minY: number, maxX: number, maxY: number, thickness?: number, blockLight?: BlockDirection, blockPlayer?: BlockDirection): SpawnCommand {
        let components = [
            {
                type: SHARED_TYPE,
            } as SharedFlag,
            {
                type: SERIALIZED_TYPE,
            } as SerializedFlag,
            {
                entity: -1,
                x: minX,
                y: minY,
                type: POSITION_TYPE,
            } as PositionComponent,
            {
                type: WALL_TYPE,
                vec: [maxX - minX, maxY - minY],
                thickness,
                blockLight,
                blockPlayer,
            } as WallComponent,
        ];
        return SpawnCommandKind.from(this.world, components);
    }

    enable(): void {
    }

    destroy(): void {
    }
}

export class CreateWallToolPart implements ToolPart {
    readonly name = ToolType.CREATE_WALL;

    private readonly sys: WallSystem;
    private readonly pixiBoardSys: PixiBoardSystem;

    // Sprite of the pin to be created
    createdIds: number[] = [];
    createdLastPos?: RPoint;
    createLastLineDisplay: Graphics;

    thickness: number = DEFAULT_THICKNESS;

    isActive = false;
    mouseLastPos: IPoint = new Point();

    constructor(sys: WallSystem) {
        this.sys = sys;
        this.createLastLineDisplay = new Graphics();
        this.pixiBoardSys = sys.world.requireSystem(PIXI_BOARD_TYPE);

        const decl = sys.world.requireSystem('declarative_listener');

        decl.onResource('wall_creation', 'thickness', (oldv, newv) => {
            this.thickness = newv ?? DEFAULT_THICKNESS;
            if (this.isActive) this.redrawCreationLastLine(this.mouseLastPos);
        })

        decl.onComponent('wall', '', (oldc, newc) => {
            if (!this.isActive) return;
            if (oldc == null) {// added
                this.createdIds.push(newc!.entity);
            } else if (newc == null) {// removed
                if (arrayRemoveElem(this.createdIds, oldc.entity)) {
                    this.recomputeCreatedLastPos();
                }
            }
        });
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
        this.createdLastPos = undefined;

        if (this.sys.world.getResource('creation_info')?.exitAfterCreation) {
            this.sys.world.editResource(TOOL_TYPE, {
                tool: ToolType.INSPECT,
            });
        }
    }

    redrawCreationLastLine(pos: IPoint): void {
        this.mouseLastPos = pos;
        let g = this.createLastLineDisplay;
        g.clear();

        if (this.createdLastPos !== undefined) {
            g.moveTo(this.createdLastPos[0], this.createdLastPos[1]);
            g.lineStyle(this.thickness, SELECTION_COLOR);
            g.lineTo(pos.x, pos.y);
        }
        g.lineStyle(0);
        if (this.createdLastPos !== undefined) {
            g.beginFill(0xe51010);
            g.drawCircle(this.createdLastPos[0], this.createdLastPos[1], this.thickness + 5);
        }
        g.beginFill(0x405FFE);
        g.drawCircle(pos.x, pos.y, this.thickness + 5);
    }

    addVertex(point: IPoint): void {
        let lp = this.createdLastPos;

        if (lp === undefined) {
            this.createdLastPos = [point.x, point.y];
        } else if (point.x == lp[0] && point.y == lp[1]) {
            this.endCreation();
        } else {
            const opts = this.sys.world.getResource('wall_creation');

            let points = [lp[0], lp[1], point.x, point.y];
            this.sys.fixIntersections(points, 0);
            let plen = points.length;

            for (let i = 2; i < plen; i += 2) {
                let cmd = this.sys.createWall(
                    points[i - 2], points[i - 1],
                    points[i    ], points[i + 1],
                    opts?.thickness ?? DEFAULT_THICKNESS,
                    opts?.blockLight ?? BlockDirection.BOTH,
                    opts?.blockPlayer ?? BlockDirection.BOTH,
                );
                executeAndLogCommand(this.sys.world, cmd);
                this.sys.selectionSys.clear();
            }
            this.createdLastPos = [point.x, point.y];
        }
    }

    undoVertex(point: IPoint): void {
        if (this.createdLastPos === undefined) return;
        this.mouseLastPos = point;
        let recomputeLast = true;

        if (this.createdIds.length === 0) {
            this.createdLastPos = undefined;
            return;
        } else if (this.createdIds.length === 1) {
            const wall = this.sys.world.getComponent(this.createdIds[0], POSITION_TYPE)!! as PositionComponent;
            this.createdLastPos = [wall.x, wall.y];
            recomputeLast = false;
        }

        let cmd = {
            kind: 'despawn',
            entities: [this.createdIds.pop()],
        } as DeSpawnCommand;
        executeAndLogCommand(this.sys.world, cmd);

        if (recomputeLast) {
            this.recomputeCreatedLastPos();
        } else {
            this.redrawCreationLastLine(this.mouseLastPos);
        }
    }

    recomputeCreatedLastPos() {
        if (this.createdIds.length === 0) {
            this.createdLastPos = undefined;
        } else {
            let id = this.createdIds[this.createdIds.length - 1];
            let wallPos = this.sys.world.getComponent(id, POSITION_TYPE)! as PositionComponent;
            let wall = this.sys.storage.getComponent(id)!;

            this.createdLastPos = [
                wallPos.x + wall.vec[0],
                wallPos.y + wall.vec[1],
            ];
        }

        this.redrawCreationLastLine(this.mouseLastPos);
    }

    onPointerMove(event: PointerMoveEvent) {
        this.redrawCreationLastLine(snapPoint(this.sys.world, event.boardPos));
    }

    onPointerDown(event: PointerClickEvent) {
        if (event.consumed) return;
        event.consumed = true;
        this.addVertex(snapPoint(this.sys.world, event.boardPos));
    }

    onPointerRightDown(event: PointerRightDownEvent) {
        if (event.consumed) return;
        event.consumed = true;
        this.undoVertex(snapPoint(this.sys.world, event.boardPos));
    }

    onEnable(): void {
        this.isActive = true;
        this.initCreation();
    }

    onDisable(): void {
        this.endCreation();
        this.isActive = false;
    }

    initialize(events: SafeEventEmitter): void {
        this.createLastLineDisplay.interactive = false;
        this.createLastLineDisplay.interactiveChildren = false;
        this.createLastLineDisplay.parentGroup = this.pixiBoardSys.toolForegroundGroup;
        this.pixiBoardSys.board.addChild(this.createLastLineDisplay);
        this.pixiBoardSys.board.sortChildren();

        events.on(PointerEvents.POINTER_MOVE, this.onPointerMove, this);
        events.on(PointerEvents.POINTER_DOWN, this.onPointerDown, this);
        events.on(PointerEvents.POINTER_RIGHT_DOWN, this.onPointerRightDown, this);
    }

    destroy(): void {
        this.createLastLineDisplay.destroy(DESTROY_ALL)
    }
}
