import {Component, PositionComponent, TransformComponent} from "../../component";
import {
    intersectSegmentVsSegment,
    overlapAabbVsAabb,
    overlapAabbVsLine,
    overlapAabbVsPoint,
    overlapCircleVsAabb,
    overlapCircleVsCircle,
    overlapCircleVsPolygon,
    overlapLineVsCircle,
    overlapLineVsPolygon,
    overlapObbVsPolygon,
    overlapPointVsCircle,
    overlapRotatedRectVsAabb,
    overlapRotatedRectVsCircle,
    overlapRotatedRectVsLine,
    overlapRotatedRectVsPoint,
    overlapRotatedRectVsRotatedRect,
    SegmentVsSegmentRes
} from "../../../geometry/collision";
import {Aabb} from "../../../geometry/aabb";
import {polygonPointIntersect} from "../../../util/geometry";
import {Obb} from "../../../geometry/obb";
import {World} from "../../World";
import {DynamicTree} from "../../../geometry/dynamicTree";
import {SingleEcsStorage} from "../../Storage";
import {System} from "../../System";
import {Line} from "../../../geometry/line";
import {GeomertyQueryType, QueryHitEvent} from "../../interaction";
import {PlayerVisibleComponent} from "../playerSystem";
import {PointDB} from "../../../game/pointDB";
import {GRID_TYPE, GridSystem} from "../gridSystem";
import {SELECTION_TYPE, SelectionSystem} from "./SelectionSystem";
import { IPoint } from "@/geometry/point";
import { Point } from "pixi.js";
import { arrayRemoveElem } from "@/util/array";

export enum ShapeType {
    POINT, AABB, CIRCLE, LINE, POLYGON, OBB,
}

export interface Shape {
    type: ShapeType;
}

export interface PointShape extends Shape {
    type: ShapeType.POINT;
    pos: IPoint;
}

export interface AabbShape extends Shape {
    type: ShapeType.AABB;
    data: Aabb;
}

export interface CircleShape extends Shape {
    type: ShapeType.CIRCLE;
    pos: IPoint;
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

export function shapePoint(pos: IPoint): PointShape {
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

export function shapeCircle(center: IPoint, radius: number): CircleShape {
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

    // TODO: polygon vs polygon
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
            case ShapeType.LINE: return overlapAabbVsLine(s1.data, (shape2 as LineShape).data);
            case ShapeType.POLYGON: return overlapObbVsPolygon(Obb.fromAabb(s1.data), (shape2 as PolygonShape).polygon);
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
    } else if (s1t === ShapeType.LINE) {
        let s1 = shape1 as LineShape;
        switch (s2t) {
            case ShapeType.LINE: return intersectSegmentVsSegment(s1.data, (shape2 as LineShape).data) == SegmentVsSegmentRes.INTERN;
            case ShapeType.POLYGON: return overlapLineVsPolygon(s1.data, (shape2 as PolygonShape).polygon);
            case ShapeType.OBB: return overlapRotatedRectVsLine((shape2 as ObbShape).data, s1.data);
        }
    } else if (s1t === ShapeType.POLYGON) {
        let s1 = shape1 as PolygonShape;
        switch (s2t) {
            case ShapeType.POLYGON: break;
            case ShapeType.OBB: return overlapObbVsPolygon((shape2 as ObbShape).data, s1.polygon);
        }
    } else if (s1t === ShapeType.OBB) {
        return overlapRotatedRectVsRotatedRect((shape1 as ObbShape).data, (shape2 as ObbShape).data);
    }
    // Polygon vs Polygon
    throw new Error('Query not implemented: ' + s1t + ' vs ' + s2t);
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
        default: throw new Error('Unknown shape type: ' + shape.type);
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
        default: throw new Error('Unknown shape type: ' + shape.type);
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
        default: throw new Error('Unknown shape type: ' + shape.type);
    }
}

function shapeClone(shape: Shape): Shape {
    switch (shape.type) {
        case ShapeType.CIRCLE:
        case ShapeType.POINT: {
            let s = shape as PointShape;
            return {
                type: ShapeType.POINT,
                pos: new Point(s.pos.x, s.pos.y),
            } as PointShape;
        }
        case ShapeType.AABB: return shapeAabb((shape as AabbShape).data.copy());
        case ShapeType.LINE: return shapeLine((shape as LineShape).data.copy());
        case ShapeType.POLYGON: return shapePolygon([...(shape as PolygonShape).polygon]);
        case ShapeType.OBB: return shapeObb((shape as ObbShape).data.copy())
        default: throw new Error('Unknown shape type: ' + shape.type);
    }
}

// Args: entity, newColliders, added, removed
export const EVENT_INTERACTION_COLLIDER_UPDATE = 'interaction_collider_update';

export const INTERACTION_TYPE = 'interaction';
export type INTERACTION_TYPE = 'interaction';

export type QueryMetadata = {[name: string | symbol]: any};

export interface InteractionComponent extends Component {
    type: INTERACTION_TYPE;

    selectPriority: number;// If > 0 then the item is selectable
    snapEnabled: boolean;// if true then the snapDb registration is available.
    shape: Shape;
    // Additional checks (not required)
    queryCheck?: (shape: Shape, meta: QueryMetadata) => boolean;
    // If true, the InteractionSystem will keep a list of colliding elements updated (_colliding) calling EVENT_INTERACTION_COLLIDER_UPDATE
    // every time the list changes, queryCheck can be used to filter out unwanted collisions
    isCollider?: boolean;

    _treeId?: number;
    _snaps?: number[];

    _colliding?: number[];// If this component is a collider, this lists the components it's touching
    _touchingColliders?: number[];// colliders this component is touching
}

export const QUERY_META_COLLIDING_ENTITY = Symbol();

export class InteractionSystem implements System {
    readonly world: World;
    readonly name = INTERACTION_TYPE;
    readonly dependencies = [GRID_TYPE, SELECTION_TYPE];
    readonly components?: [InteractionComponent];

    private readonly selectionSys: SelectionSystem;

    storage = new SingleEcsStorage<InteractionComponent>('interaction', false, false);
    isTranslating: boolean = false;
    private translatingEntities: number[] = [];

    snapDb: PointDB;
    aabbTree = new DynamicTree<InteractionComponent>();

    constructor(world: World) {
        this.world = world;
        this.selectionSys = this.world.requireSystem(SELECTION_TYPE);
        this.snapDb = new PointDB(this.world.requireSystem(GRID_TYPE));

        world.addStorage(this.storage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('tool_move_begin', this.onToolMoveBegin, this);
        world.events.on('tool_move_end', this.onToolMoveEnd, this);
        world.events.on('query_hit', this.onQueryHit, this);
    }

    private registerSnapPoints(snaps: number[]): void {
        let slen = snaps.length;
        for (let i = 0; i < slen; i += 2) {
            if (isNaN(snaps[i]) || isNaN(snaps[i+1])) {
                console.error("Trying to put NaN in the point db!");
                continue;
            }
            this.snapDb.insert([snaps[i], snaps[i + 1]]);
        }
    }

    private unregisterSnapPoints(snaps: number[]): void {
        let slen = snaps.length;
        for (let i = 0; i < slen; i += 2) {
            if (isNaN(snaps[i]) || isNaN(snaps[i+1])) {
                console.error("Trying to remove NaN from the point db!");
                continue;
            }
            this.snapDb.remove([snaps[i], snaps[i + 1]]);
        }
    }

    private unregisterTreeAndSnaps(comp: InteractionComponent): void {
        if (comp._snaps) {
            this.unregisterSnapPoints(comp._snaps);
            comp._snaps = undefined;
        }
        if (comp._treeId !== undefined) {
            this.aabbTree.destroyProxy(comp._treeId);
            comp._treeId = undefined;
        }
    }

    private unregisterColliders(comp: InteractionComponent) {
        for (let x of (comp._touchingColliders ?? [])) {
            const c = this.storage.getComponent(x)!;
            arrayRemoveElem(c._colliding!, comp.entity);
            this.world.events.emit(EVENT_INTERACTION_COLLIDER_UPDATE, c.entity, c._colliding, [], [comp.entity]);
        }
        comp._touchingColliders = [];

        if (comp.isCollider === true && comp._colliding !== undefined) {
            for (let x of comp._colliding) {
                arrayRemoveElem(this.storage.getComponent(x)!._touchingColliders!, comp.entity);
            }
            const old = comp._colliding;
            comp._colliding = [];
            this.world.events.emit(EVENT_INTERACTION_COLLIDER_UPDATE, comp.entity,  comp._colliding, [], old);
        }
    }

    private updateComponent(comp: InteractionComponent): void {
        this.unregisterTreeAndSnaps(comp);
        if (comp.shape === undefined) {
            this.unregisterColliders(comp);
            return;
        }
        comp._treeId = this.aabbTree.createProxy(shapeToAabb(comp.shape), comp);
        if (comp.snapEnabled) {
            comp._snaps = shapeToSnaps(comp.shape);
            this.registerSnapPoints(comp._snaps);
        }
        // collider - collider - collider
        // collider -    me    - collider
        //   UNLIMITED COLLIDER WORKS!!
        if (comp.isCollider) {
            const oldColls = comp._colliding ?? [];
            const newColls = [];
            const added = [];
            const removed = [];
            for (let e of this.query(comp.shape, c => comp != c)) {
                // So, the two shapes collide, e wants to collide with comp, but we forgot to check if comp.queryCheck is statisfied
                if (comp.queryCheck !== undefined) {
                    const meta = { [QUERY_META_COLLIDING_ENTITY]: e.entity };
                    if (!comp.queryCheck(e.shape, meta)) continue;
                }
                newColls.push(e.entity);
                if (!oldColls.includes(e.entity)) {
                    added.push(e.entity);
                    if (e._touchingColliders === undefined) e._touchingColliders = [];
                    e._touchingColliders.push(comp.entity);
                }
            }
            if (oldColls.length + added.length != newColls.length) {
                // Compute what was removed
                for (let i of oldColls) {
                    if (newColls.includes(i)) continue;
                    removed.push(i);
                    arrayRemoveElem(this.storage.getComponent(i)!._touchingColliders!, comp.entity);
                }
            }
            //console.log("- collider: " + added.length + ", " + removed.length);
            if (added.length + removed.length > 0) {
                comp._colliding = newColls;
                this.world.events.emit(EVENT_INTERACTION_COLLIDER_UPDATE, comp.entity,  comp._colliding, added, removed);
            }
        }

        // If we aren't colliders, we might be collided, this means that some components that we collided with previously
        // might not collide with us anymore, and some new one might.
        {
            const oldColliders = comp._touchingColliders ?? [];
            const newColliders = [];
            let added = 0;
            const meta = { [QUERY_META_COLLIDING_ENTITY]: comp.entity };
            for (let c of this.query(comp.shape, c => c.isCollider === true && c != comp, meta)) {
                //console.log("- collided + " + c.entity + " was_old: " + oldColliders.includes(c.entity));
                newColliders.push(c.entity);
                if (!oldColliders.includes(c.entity)) {
                    if (c._colliding === undefined) c._colliding = [];
                    c._colliding.push(comp.entity);
                    //console.log("non-collider " + comp.entity + " discovered that it is now in collision with " + c.entity);
                    this.world.events.emit(EVENT_INTERACTION_COLLIDER_UPDATE, c.entity,  c._colliding, [comp.entity], []);
                    added += 1;
                }
            }
            if (oldColliders.length + added != newColliders.length) {
                // Compute what was removed

                for (let i of oldColliders) {
                    if (!newColliders.includes(i)) {
                        const c = this.storage.getComponent(i)!;
                        arrayRemoveElem(c._colliding!, comp.entity);
                        //console.log("non-collider " + comp.entity + " discovered that it is not in collision with " + i);
                        this.world.events.emit(EVENT_INTERACTION_COLLIDER_UPDATE, i,  c._colliding, [], [comp.entity]);
                    }
                }
            }
            comp._touchingColliders = newColliders;
        }
    }

    private onComponentAdd(comp: Component): void {
        if (comp.type !== INTERACTION_TYPE) return;
        this.updateComponent(comp as InteractionComponent);
    }

    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === INTERACTION_TYPE) {
            let c = comp as InteractionComponent;

            if ('shape' in changed) {
                this.updateComponent(c);
            }
        } else if (comp.type === 'position') {
            let pos = comp as PositionComponent;
            let inter = this.storage.getComponent(pos.entity);
            if (inter === undefined || inter.shape === undefined) return;
            let oldX = changed.x !== undefined ? changed.x : pos.x;
            let oldY = changed.y !== undefined ? changed.y : pos.y;
            let diffX = pos.x - oldX;
            let diffY = pos.y - oldY;

            if (diffX !== 0 || diffY !== 0) {
                // TODO: trigger component change(?)
                shapeTranslate(inter.shape, diffX, diffY);
                if (!(this.isTranslating && this.selectionSys.selectedEntities.has(pos.entity))) {
                    this.updateComponent(inter);
                }
            }

            return;
        } else if (comp.type === 'transform') {
            let trans = comp as TransformComponent;
            let inter = this.storage.getComponent(trans.entity);
            if (inter === undefined || inter.shape === undefined) return;
            let shape = inter.shape;
            if (shape.type === ShapeType.POINT) return;
            if (shape.type === ShapeType.CIRCLE) {
                let s = shape as CircleShape;
                if ('scale' in changed) {
                    s.radius = s.radius * trans.scale / changed.scale;
                    this.updateComponent(inter);
                }
            } else if (shape.type === ShapeType.OBB) {
                let s = shape as ObbShape;
                if ('scale' in changed) {
                    let diffScale = trans.scale / changed.scale;
                    s.data.unrotated.scale(diffScale, diffScale, s.data.unrotated);
                }
                s.data.rotation = trans.rotation;
                s.data.recompute();
                this.updateComponent(inter);
            } else {
                console.warn("Unable to auto-rotate other shapes than OBB, watch your components!");
                return;
            }
        }
    }

    private onComponentRemove(comp: Component): void {
        if (comp.type !== INTERACTION_TYPE) return;
        const c = comp as InteractionComponent;
        this.unregisterTreeAndSnaps(c);
        this.unregisterColliders(c);
    }

    private onToolMoveBegin(): void {
        if (this.isTranslating) {
            console.warn("tool_move never ended");
            this.onToolMoveEnd();
        }
        this.translatingEntities = [];
        for (let comp of this.selectionSys.getSelectedByType(INTERACTION_TYPE)) {
            let c = comp as InteractionComponent;
            this.unregisterTreeAndSnaps(c);
            this.unregisterColliders(c);
            this.translatingEntities.push(c.entity);
        }
        this.isTranslating = true;
    }

    private onToolMoveEnd(): void {
        this.isTranslating = false;
        for (let entity of this.translatingEntities) {
            let c = this.world.getComponent(entity, INTERACTION_TYPE);
            if (c !== undefined) {
                this.updateComponent(c);
            }
        }
    }


    private singleHitQuery(shape: Shape, event: QueryHitEvent): void {
        let bestPrior: number = Number.NEGATIVE_INFINITY;
        let best: number = -1;

        let iter = this.queryVisible(shape, (c) => (c.selectPriority || 0) > bestPrior);
        for (let item of iter) {
            best = item.entity;
            bestPrior = item.selectPriority || 0;
        }

        if (best !== -1) {
            event.addHit(best, bestPrior);
        }
    }

    private multiHitQuery(shape: Shape, event: QueryHitEvent): void {
        let iter = this.queryVisible(shape, (c) => c.selectPriority !== undefined);
        for (let item of iter) {
            event.addHit(item.entity, item.selectPriority);
            if (!event.shouldContinue()) return;
        }
    }

    private onQueryHit(event: QueryHitEvent): void {
        if (!event.shouldContinue()) return;

        let shape: Shape;
        switch (event.type) {
            case GeomertyQueryType.POINT: shape = shapeCircle(event.data as IPoint, 20); break;
            //case GeomertyQueryType.POINT: shape = shapePoint(event.data as IPoint); break; // ENABLE THIS FOR POINT-PRECISION CLICKING
            case GeomertyQueryType.AABB: shape = shapeAabb(event.data as Aabb); break;
            default: throw new Error('Unknown query type');
        }

        if (event.multi) {
            this.multiHitQuery(shape, event);
        } else {
            this.singleHitQuery(shape, event);
        }
    }


    queryVisible(shape: Shape, preCheck?: (c: InteractionComponent) => boolean): Generator<InteractionComponent> {
        let playerVis: SingleEcsStorage<PlayerVisibleComponent> | undefined = undefined;
        if (!this.world.isMaster) {
            playerVis = this.world.storages.get('player_visible') as SingleEcsStorage<PlayerVisibleComponent>;
        }

        if (playerVis === undefined) return this.query(shape, preCheck);
        return this.query(shape, c => {
            let visC = playerVis!.getComponent(c.entity);
            if (visC !== undefined && !visC.visible) return false;
            return preCheck === undefined ? true : preCheck(c);
        })
    }

    *query(shape: Shape, preCheck?: (c: InteractionComponent) => boolean, queryDetails: QueryMetadata = {}): Generator<InteractionComponent> {
        let aabb = shapeToAabb(shape);

        for (let c of this.aabbTree.query(aabb)) {
            let tag = c.tag!;
            if (preCheck && !preCheck(tag)) continue;
            let qc = tag.queryCheck;
            if (qc && !qc(shape, queryDetails)) continue;
            if (!shapeIntersect(tag.shape!, shape)) continue;
            yield tag;
        }
    }

    enable(): void {
    }

    destroy(): void {
    }
}
