import {Component, MultiComponent, PositionComponent} from "../component";
import {
    overlapAabbVsAabb,
    overlapAabbVsPoint,
    overlapCircleVsAabb,
    overlapCircleVsCircle,
    overlapCircleVsPolygon, overlapLineVsCircle,
    overlapPointVsCircle,
    overlapRotatedRectVsAabb,
    overlapRotatedRectVsCircle,
    overlapRotatedRectVsPoint
} from "../../geometry/collision";
import {Aabb} from "../../geometry/aabb";
import {Point, polygonPointIntersect} from "../../util/geometry";
import {Obb} from "../../geometry/obb";
import {EcsTracker} from "../ecs";
import {DynamicTree} from "../../geometry/dynamicTree";
import {MultiEcsStorage, SingleEcsStorage} from "../storage";
import {System} from "../system";
import {Line} from "../../geometry/line";
import {GeomertyQueryType, QueryHitEvent} from "../interaction";
import {PlayerVisibleComponent} from "./playerSystem";
import {PointDB} from "../../game/pointDB";
import {GridSystem} from "./gridSystem";
import {WallComponent} from "./wallSystem";
import {EditMapPhase} from "../../phase/editMap/editMapPhase";

export enum ShapeType {
    POINT, AABB, CIRCLE, LINE, POLYGON, OBB,
}

export interface Shape {
    type: ShapeType;
}

export interface PointShape extends Shape {
    type: ShapeType.POINT;
    pos: PIXI.IPointData;
}

export interface AabbShape extends Shape {
    type: ShapeType.AABB;
    data: Aabb;
}

export interface CircleShape extends Shape {
    type: ShapeType.CIRCLE;
    pos: PIXI.IPointData;
    radius: number;
}

export interface LineShape extends Shape {
    type: ShapeType.LINE;
    data: Line;
}

export interface PolygonShape extends Shape {
    type: ShapeType.POLYGON;
    polygon: number[];
}

export interface ObbShape extends Shape {
    type: ShapeType.OBB;
    data: Obb;
}

export function shapePoint(pos: PIXI.IPointData): PointShape {
    return {
        type: ShapeType.POINT,
        pos,
    };
}

export function shapeAabb(aabb: Aabb): AabbShape {
    return {
        type: ShapeType.AABB,
        data: aabb,
    };
}

export function shapeCircle(center: PIXI.IPointData, radius: number): CircleShape {
    return {
        type: ShapeType.CIRCLE,
        pos: center,
        radius: radius,
    };
}

export function shapeLine(line: Line): LineShape {
    return {
        type: ShapeType.LINE,
        data: line,
    };
}

export function shapePolygon(polygon: number[]): PolygonShape {
    return {
        type: ShapeType.POLYGON,
        polygon,
    };
}

export function shapeObb(obb: Obb): ObbShape {
    return {
        type: ShapeType.OBB,
        data: obb,
    };
}

export function shapeIntersect(shape1: Shape, shape2: Shape): boolean {
    if (shape2.type < shape1.type) [shape2, shape1] = [shape1, shape2];
    let s1t = shape1.type;
    let s2t = shape2.type;

    // TODO: aabb vs polygon, polygon vs polygon, and a fuckton of OBB (needs a lot of SAT algorithms I think)
    if (s1t === ShapeType.POINT) {
        let s1 = shape1 as PointShape;
        switch (s2t) {
            case ShapeType.POINT: return false;
            case ShapeType.AABB: return overlapAabbVsPoint((shape2 as AabbShape).data, s1.pos);
            case ShapeType.CIRCLE: return overlapPointVsCircle(s1.pos, (shape2 as CircleShape).pos, (shape2 as CircleShape).radius);
            case ShapeType.LINE: return false;
            case ShapeType.POLYGON: return polygonPointIntersect(s1.pos, (shape2 as PolygonShape).polygon);
            case ShapeType.OBB: return overlapRotatedRectVsPoint((shape2 as ObbShape).data, s1.pos);
        }
    } else if (s1t === ShapeType.AABB) {
        let s1 = shape1 as AabbShape;
        switch (s2t) {
            case ShapeType.AABB: return overlapAabbVsAabb((shape2 as AabbShape).data, s1.data);
            case ShapeType.CIRCLE: return overlapCircleVsAabb((shape2 as CircleShape).pos, (shape2 as CircleShape).radius, s1.data);
            case ShapeType.LINE: return true;
            case ShapeType.POLYGON: break;
            case ShapeType.OBB: return overlapRotatedRectVsAabb((shape2 as ObbShape).data, s1.data);
        }
    } else if (s1t === ShapeType.CIRCLE) {
        let s1 = shape1 as CircleShape;
        switch (s2t) {
            case ShapeType.CIRCLE: return overlapCircleVsCircle((shape2 as CircleShape).pos, (shape2 as CircleShape).radius, s1.pos, s1.radius);
            case ShapeType.LINE: return overlapLineVsCircle((shape2 as LineShape).data, s1.pos, s1.radius);
            case ShapeType.POLYGON: return overlapCircleVsPolygon(s1.pos, s1.radius, (shape2 as PolygonShape).polygon);
            case ShapeType.OBB: return overlapRotatedRectVsCircle((shape2 as ObbShape).data, s1.pos, s1.radius);
        }
    }
    // Polygon vs RotatedRect & co.
    throw 'Query not implemented: ' + s1t + ' vs ' + s2t;
}

export function shapeToAabb(shape: Shape): Aabb {
    switch (shape.type) {
        case ShapeType.POINT: return Aabb.fromPoint((shape as PointShape).pos);
        case ShapeType.AABB: return (shape as AabbShape).data;
        case ShapeType.CIRCLE: {
            let s = shape as CircleShape;
            return new Aabb(
                s.pos.x - s.radius, s.pos.y - s.radius,
                s.pos.x + s.radius, s.pos.y + s.radius
            );
        }
        case ShapeType.LINE: {
            let s = (shape as LineShape).data;
            return new Aabb(s.fromX, s.fromY, s.toX, s.toY);
        }
        case ShapeType.POLYGON: {
            let aabb = Aabb.zero();
            aabb.wrapPolygon((shape as PolygonShape).polygon);
            return aabb;
        }
        case ShapeType.OBB: {
            let aabb = Aabb.zero();
            aabb.wrapPolygon((shape as ObbShape).data.rotVertex);
            return aabb;
        }
        default: throw 'Unknown shape type: ' + shape.type;
    }
}

function shapeToSnaps(shape: Shape): number[] {
    switch (shape.type) {
        case ShapeType.POINT:
        case ShapeType.CIRCLE: {
            let p = shape as PointShape;
            return [p.pos.x, p.pos.y];
        }
        case ShapeType.AABB: {
            let aabb = (shape as AabbShape).data;
            return [
                aabb.minX, aabb.minY,
                aabb.minX, aabb.maxY,
                aabb.maxX, aabb.minY,
                aabb.maxX, aabb.maxY,
            ]
        }
        case ShapeType.LINE: {
            let s = (shape as LineShape).data;
            return [
                s.fromX, s.fromY,
                s.toX, s.toY,
            ];
        }
        case ShapeType.POLYGON: {
            let pol = (shape as PolygonShape).polygon;
            let data = new Array<number>();
            for (let i = 0; i < pol.length; i += 2) {
                data.push(pol[i], pol[i + 1]);
            }
            return data;
        }
        case ShapeType.OBB: {
            let pol = (shape as ObbShape).data.rotVertex;
            let data = new Array<number>(8);
            for (let i = 0; i < 8; i++) {
                data[i] = pol[i];
            }
            return data;
        }
        default: throw 'Unknown shape type: ' + shape.type;
    }
}

function shapeTranslate(shape: Shape, x: number, y: number): void {
    switch (shape.type) {
        case ShapeType.CIRCLE:
        case ShapeType.POINT: {
            let s = shape as PointShape;
            s.pos.x += x;
            s.pos.y += y;
            break;
        }
        case ShapeType.AABB: {
            let s = (shape as AabbShape).data;
            s.translate(x, y, s);
            break;
        }
        case ShapeType.LINE: {
            let s = (shape as LineShape).data;
            s.fromX += x;
            s.fromY += y;
            s.toX += x;
            s.toY += y;
            break;
        }
        case ShapeType.POLYGON: {
            let s = shape as PolygonShape;
            let slen = s.polygon.length;
            for (let i = 0; i < slen; i += 2) {
                s.polygon[i] += x;
                s.polygon[i + 1] += y;
            }
            break;
        }
        case ShapeType.OBB: {
            let s = (shape as ObbShape).data;
            s.unrotated.translate(x, y, s.unrotated);
            let pol = s.rotVertex;
            for (let i = 0; i < 8; i += 2) {
                pol[i    ] += x;
                pol[i + 1] += y;
            }
            break;
        }
        default: throw 'Unknown shape type: ' + shape.type;
    }
}

function shapeClone(shape: Shape): Shape {
    switch (shape.type) {
        case ShapeType.CIRCLE:
        case ShapeType.POINT: {
            let s = shape as PointShape;
            return {
                type: ShapeType.POINT,
                pos: new PIXI.Point(s.pos.x, s.pos.y),
            } as PointShape;
        }
        case ShapeType.AABB: return shapeAabb((shape as AabbShape).data.copy());
        case ShapeType.LINE: return shapeLine((shape as LineShape).data.copy());
        case ShapeType.POLYGON: return shapePolygon([...(shape as PolygonShape).polygon]);
        case ShapeType.OBB: return shapeObb((shape as ObbShape).data.copy())
        default: throw 'Unknown shape type: ' + shape.type;
    }
}

export interface InteractionComponent extends Component {
    type: 'interaction';

    selectPriority?: number;// If !== undefined then the item is selectable
    snapEnabled?: boolean;// if === true then the snapDb registration is available.
    shape?: Shape;
    // Additional checks (not required)
    queryCheck?: (shape: Shape) => boolean;

    _treeId?: number;
    _snaps?: number[]
}

export class InteractionSystem implements System {
    ecs: EcsTracker;
    phase: EditMapPhase;

    storage = new SingleEcsStorage<InteractionComponent>('interaction', false, false);
    isTranslating: boolean = false;

    snapDb: PointDB;
    aabbTree = new DynamicTree<InteractionComponent>();

    constructor(ecs: EcsTracker, phase: EditMapPhase) {
        this.ecs = ecs;
        this.phase = phase;
        this.snapDb = new PointDB(phase.gridSystem);

        ecs.addStorage(this.storage);
        ecs.events.on('component_add', this.onComponentAdd, this);
        ecs.events.on('component_edited', this.onComponentEdited, this);
        ecs.events.on('component_remove', this.onComponentRemove, this);
        ecs.events.on('tool_move_begin', this.onToolMoveBegin, this);
        ecs.events.on('tool_move_end', this.onToolMoveEnd, this);
        ecs.events.on('query_hit', this.onQueryHit, this);
    }

    private registerSnapPoints(snaps: number[]): void {
        let slen = snaps.length;
        for (let i = 0; i < slen; i += 2) {
            this.snapDb.insert([snaps[i], snaps[i + 1]]);
        }
    }

    private unregisterSnapPoints(snaps: number[]): void {
        let slen = snaps.length;
        for (let i = 0; i < slen; i += 2) {
            this.snapDb.remove([snaps[i], snaps[i + 1]]);
        }
    }

    private unregisterComponent(comp: InteractionComponent): void {
        if (comp._snaps) {
            this.unregisterSnapPoints(comp._snaps);
            comp._snaps = undefined;
        }
        if (comp._treeId !== undefined) {
            this.aabbTree.destroyProxy(comp._treeId);
            comp._treeId = undefined;
        }
    }

    private updateComponent(comp: InteractionComponent): void {
        this.unregisterComponent(comp);
        if (comp.shape === undefined) return;
        comp._treeId = this.aabbTree.createProxy(shapeToAabb(comp.shape), comp);
        if (comp.snapEnabled) {
            comp._snaps = shapeToSnaps(comp.shape);
            this.registerSnapPoints(comp._snaps);
        }
    }

    private worldToLocal(comp: InteractionComponent): void {
        let pos = this.ecs.getComponent(comp.entity, 'position') as PositionComponent;
        shapeTranslate(comp.shape, -pos.x, -pos.y)
    }

    private localToWorld(comp: InteractionComponent): void {
        let pos = this.ecs.getComponent(comp.entity, 'position') as PositionComponent;
        shapeTranslate(comp.shape, pos.x, pos.y)
    }

    private onComponentAdd(comp: Component): void {
        if (comp.type !== 'interaction') return;
        this.updateComponent(comp as InteractionComponent);
    }

    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === 'position') {
            let pos = comp as PositionComponent;
            let inter = this.storage.getComponent(pos.entity);
            if (inter === undefined || inter.shape === undefined) return;
            if (this.isTranslating && this.phase.selection.selectedEntities.has(pos.entity)) return;// Ignore
            let oldX = changed.x !== undefined ? changed.x : pos.x;
            let oldY = changed.y !== undefined ? changed.y : pos.y;
            let diffX = pos.x - oldX;
            let diffY = pos.y - oldY;

            if (diffX !== 0 && diffY !== 0) {
                // TODO: trigger component change(?)
                shapeTranslate(inter.shape, diffX, diffY);
            }

            return;
        } else if (comp.type === 'interaction') {
            let c = comp as InteractionComponent;

            if ('shape' in changed) {
                this.updateComponent(c);
            }
        }
    }

    private onComponentRemove(comp: Component): void {
        if (comp.type !== 'interaction') return;
        this.unregisterComponent(comp as InteractionComponent);
    }

    private onToolMoveBegin(): void {
        for (let comp of this.phase.selection.getSelectedByType("interaction")) {
            let c = comp as InteractionComponent;
            this.unregisterComponent(c);
            this.worldToLocal(c);
        }
        this.isTranslating = true;
    }

    private onToolMoveEnd(): void {
        this.isTranslating = false;
        for (let comp of this.phase.selection.getSelectedByType("interaction")) {
            let c = comp as InteractionComponent;
            this.localToWorld(c);
            this.updateComponent(c);
        }
    }


    private singleHitQuery(shape: Shape, event: QueryHitEvent): void {
        let bestPrior: number = Number.NEGATIVE_INFINITY;
        let best: number = -1;

        let iter = this.queryVisible(shape, (c) => c.selectPriority > bestPrior);
        for (let item of iter) {
            best = item.entity;
            bestPrior = item.selectPriority;
        }

        if (best !== -1) {
            event.addHit(best);
        }
    }

    private multiHitQuery(shape: Shape, event: QueryHitEvent): void {
        let iter = this.queryVisible(shape, (c) => c.selectPriority !== undefined);
        for (let item of iter) {
            event.addHit(item.entity);
            if (!event.shouldContinue()) return;
        }
    }

    private onQueryHit(event: QueryHitEvent): void {
        if (!event.shouldContinue()) return;

        let shape: Shape;
        switch (event.type) {
            case GeomertyQueryType.POINT: shape = shapeCircle(event.data as PIXI.IPointData, 20); break;
            case GeomertyQueryType.AABB: shape = shapeAabb(event.data as Aabb); break;
            default: throw 'Unknown query type';
        }

        if (event.multi) {
            this.multiHitQuery(shape, event);
        } else {
            this.singleHitQuery(shape, event);
        }
    }


    queryVisible(shape: Shape, preCheck?: (c: InteractionComponent) => boolean): Generator<InteractionComponent> {
        let playerVis: SingleEcsStorage<PlayerVisibleComponent> = undefined;
        if (!this.ecs.isMaster) {
            playerVis = this.ecs.storages.get('player_visible') as SingleEcsStorage<PlayerVisibleComponent>;
        }

        if (playerVis === undefined) return this.query(shape, preCheck);
        return this.query(shape, c => {
            let visC = playerVis.getComponent(c.entity);
            if (visC !== undefined && visC._visibleBy.length === 0) return false;
            return preCheck === undefined ? true : preCheck(c);
        })
    }

    *query(shape: Shape, preCheck?: (c: InteractionComponent) => boolean): Generator<InteractionComponent> {
        let aabb = shapeToAabb(shape);

        for (let c of this.aabbTree.query(aabb)) {
            if (preCheck && !preCheck(c.tag)) continue;
            if (!shapeIntersect(c.tag.shape, shape)) continue;
            let qc = c.tag.queryCheck;
            if (qc && !qc(shape)) continue;
            yield c.tag;
        }
    }

    enable(): void {
    }

    destroy(): void {
    }
}