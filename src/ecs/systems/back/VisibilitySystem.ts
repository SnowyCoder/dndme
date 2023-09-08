import {Component, POSITION_TYPE, PositionComponent, MultiComponent, SHARED_TYPE} from "../../component";
import {Aabb} from "../../../geometry/aabb";
import {MultiEcsStorage, SingleEcsStorage} from "../../Storage";
import {DynamicTree} from "../../../geometry/dynamicTree";
import {World} from "../../World";
import {Line} from "../../../geometry/line";
import {computeViewport} from "../../../geometry/visibilityPolygon";
import {System} from "../../System";
import {
    INTERACTION_TYPE,
    InteractionComponent,
    InteractionSystem,
    LineShape,
    shapeAabb,
    shapeToAabb,
    ShapeType
} from "./InteractionSystem";
import {STANDARD_GRID_OPTIONS} from "../../../game/grid";
import {GRID_TYPE} from "../gridSystem";
import {GridResource, Resource} from "../../resource";
import { GameClockResource, GAME_CLOCK_TYPE, PIXI_BOARD_TYPE } from "./pixi/pixiBoardSystem";
import { Graphics } from "@/pixi";
import { overlapAabbVsLine, overlapLineVsPolygon } from "@/geometry/collision";

// This system uses a reuqest-response pattern
// Where there are multiple "requests" for visibility but a single answer, let's make an example.
// If a player has a light with range 5 but the player can see 10 then it would be really inefficient to
//   compute two different visibility polygons, what we do instead is to compute only one polygon for the
//   bigger range, then check the range to see if they're visible for both the player or the light
//   or the player only


const DEBUG_PRINT_POLYGON = false;

export enum VisibilityRequester {
    LIGHT = 1,
    PLAYER = 2,
}

export const VISIBILITY_TYPE = 'visibility';
export type VISIBILITY_TYPE = typeof VISIBILITY_TYPE;
export interface VisibilityComponent extends MultiComponent {
    type: VISIBILITY_TYPE;
    requester: VisibilityRequester;
    range: number;// In grids (by default 1 grid = 128 pixels)
    trackWalls: boolean;
}

export const VISIBILITY_DETAILS_TYPE = 'visibility_details';
export type VISIBILITY_DETAILS_TYPE = typeof VISIBILITY_DETAILS_TYPE;
export interface VisibilityDetailsComponent extends Component {
    type: VISIBILITY_DETAILS_TYPE;
    range: number;
    requester: number,
    trackWalls: boolean;
    // polygon is only computed on an Axis-Aligned Square where the length of the
    // side is at least as much as the diameter
    polygon?: number[];
    aabb?: Aabb;
    _debugPrint?: Graphics;
    _aabbTreeId?: number;
    _blockersUsed: number[];
    _canSee: {[id: number]: Array<number>};// Visibility aware components _canSee[whoIsSeen] = Array<whocanseeit (multiid)>
    _canSeeWalls?: {[id: number]: Array<number>};
}

export enum BlockDirection {
    BOTH,
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
    NONE
}

export const VISIBILITY_BLOCKER_TYPE = 'visibility_blocker';
export type VISIBILITY_BLOCKER_TYPE = typeof VISIBILITY_BLOCKER_TYPE;
export interface VisibilityBlocker extends Component {
    type: VISIBILITY_BLOCKER_TYPE;
    player: BlockDirection,
    light: BlockDirection,
}


/**
 * Please don't stick a visibility component to an entity with a wall component (or vice-versa),
 * they don't go along together too much, for a lot of reasons.
 *
 * This system queries every entity with a VisibilityComponent and keeps it updated, by that I mean:
 * - Recompute the visibility polygon when the range changes
 * - Recompute the visibility polygon when the walls change
 *
 * Little note on visibility polygon algorithms:
 * General polygons are a mess to deal with, but the visibility polygon is a bit easier than most.
 * Since there are no portals nor mirrors in the game (yet!) each point in the polygon is visible from the center.
 * How can this property help in any way? Let me make an example:
 * We can easily compute if a point is inside of this polygon by doing a binary search on the angles, so the algorithm
 * becomes of complexity O(log(n)) where n are the polygon points.
 * Another property that I'm using is that a visibility polygon is much easier to triangulate!
 * Cut off all those ear cutting algorithms, just make triangles starting from the center!
 */
export class VisibilitySystem implements System {
    readonly name = VISIBILITY_TYPE;
    readonly dependencies = [INTERACTION_TYPE];
    readonly components?: [VisibilityComponent, VisibilityDetailsComponent, VisibilityBlocker];

    readonly world: World;

    storage = new MultiEcsStorage<VisibilityComponent>(VISIBILITY_TYPE, false, false);
    detailsStorage = new SingleEcsStorage<VisibilityDetailsComponent>(VISIBILITY_DETAILS_TYPE, false, false);
    blockerStorage = new SingleEcsStorage<VisibilityBlocker>(VISIBILITY_BLOCKER_TYPE, false, false);

    interactionSystem: InteractionSystem;
    gridSize: number;
    clock: GameClockResource;
    aabbTree = new DynamicTree<VisibilityDetailsComponent>();

    constructor(world: World) {
        this.world = world;
        this.interactionSystem = this.world.requireSystem(INTERACTION_TYPE);

        this.clock = this.world.getResource(GAME_CLOCK_TYPE)!;
        this.gridSize = (this.world.getResource(GRID_TYPE) ?? STANDARD_GRID_OPTIONS).size;

        world.addStorage(this.storage);
        world.addStorage(this.detailsStorage);
        world.addStorage(this.blockerStorage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_removed', this.onComponentRemoved, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
    }

    private removeTreePolygon(c: VisibilityDetailsComponent): void {
        if (c._aabbTreeId !== undefined) {
            this.aabbTree.destroyProxy(c._aabbTreeId);
            c._aabbTreeId = undefined;
        }
    }

    updatePolygon(c: VisibilityDetailsComponent): void {
        let pos = this.world.getComponent(c.entity, POSITION_TYPE);
        if (pos === undefined) return;
        const trackWalls = c.trackWalls === true;

        // We will recreate it later (if necessary)
        this.removeTreePolygon(c);

        if (c.range <= 0) {
            this.world.editComponent(c.entity, c.type, {
                polygon: undefined,
                aabb: undefined,
            });
            return;
        }

        const range = c.range * this.gridSize;
        const requester = c.requester;

        const viewport = new Aabb(pos.x - range, pos.y - range, pos.x + range, pos.y + range);

        const lines = new Array<Line>();
        const blockerIds = new Array<number>();
        const fakeBlockers = trackWalls ? new Array<InteractionComponent>() : undefined;


        // PROBLEM:
        // When a system is BlockDirection.BOTH (or similar), it doesn't block light, but you still see it.
        // We need a system to check if the "blockers" are still visible, and if they are, report them to the user.
        // How?
        // 1. Modify the VisibilityRequester Algorithm in some way
        //    We'll need to add the walls in the sorting algorithm, and it's a mess
        // 2. Store the unused fake-blockers and check them afterwards using a collision system.
        // Let's try n.2

        const query = this.interactionSystem.query(shapeAabb(viewport), c => {
            const blocker = this.blockerStorage.getComponent(c.entity);
            if (blocker === undefined) return false;
            let leftToRight = false;

            let blockDir = BlockDirection.BOTH;
            if (requester >= VisibilityRequester.PLAYER) blockDir = blocker.player;
            else if (requester >= VisibilityRequester.LIGHT) blockDir = blocker.light;

            let block: boolean;
            switch (blockDir) {
                case BlockDirection.NONE:
                    block = false;
                    break;
                case BlockDirection.BOTH:
                    block = true;
                    break;
                case BlockDirection.LEFT_TO_RIGHT:
                    leftToRight = true;
                case BlockDirection.RIGHT_TO_LEFT:
                    const s = c.shape;
                    if (s.type !== ShapeType.LINE) return true;
                    const line = (s as LineShape).data;
                    const v1 = [line.toX - line.fromX, line.toY - line.fromY];
                    const v2 = [line.toX - pos!.x, line.toY - pos!.y];
                    const xp = v1[0]*v2[1] - v1[1]*v2[0];
                    if (Math.abs(xp) < 0.001) return false;// On the same line
                    const isLeft = xp < 0;
                    block = isLeft == leftToRight;
                    break;
            }
            if (!block) {
                fakeBlockers?.push(c);
            }
            return block;
        });

        for (let entry of query) {
            let s = entry.shape;
            if (s.type !== ShapeType.LINE) throw new Error('Only line is supported as light blocker shape')
            let lineData = (s as LineShape).data;
            // TODO: check if entity is IN wall.

            lines.push(lineData);
            blockerIds.push(entry.entity);
        }
        const usedBlockers = trackWalls ? new Array<number>() : undefined;
        const polygon = computeViewport(lines, viewport, pos, usedBlockers);

        // Recycle the unused viewport object
        viewport.wrapPolygon(polygon);

        if (usedBlockers !== undefined) {
            for (let i = 0; i < usedBlockers.length; i++) {
                usedBlockers[i] = blockerIds[usedBlockers[i]];
            }
            for (let c of (fakeBlockers ?? [])) {
                const line = (c.shape as LineShape).data;
                if (!overlapAabbVsLine(viewport, line)) continue;
                if (!overlapLineVsPolygon(line, polygon)) continue;
                usedBlockers.push(c.entity);
            }
        }

        c._aabbTreeId = this.aabbTree.createProxy(viewport, c);

        this.world.editComponent(c.entity, c.type, {
            polygon,
            aabb: viewport,
            _blockersUsed: usedBlockers,
        });

        if (DEBUG_PRINT_POLYGON) {
            let g = c._debugPrint!;
            g.clear();
            g.lineStyle({
                width: 8,
                color: 0xFF0000,
            });
            g.moveTo(polygon[0], polygon[1]);
            for (let i = 2; i < polygon.length; i += 2) {
                g.lineTo(polygon[i], polygon[i + 1]);
            }
            g.lineTo(polygon[0], polygon[1]);
        }
    }

    private recomputeArea(aabb: Aabb) {
        for (let node of [...this.aabbTree.query(aabb)]) {
            this.updatePolygon(node.tag!);
        }
    }

    private recomputeDetails(entity: number): boolean{
        let range = 0;
        let trackWalls = false;
        let requester = 0;

        const isHidden = this.world.getComponent(entity, SHARED_TYPE) === undefined;
        let needsRemoval = !isHidden;
        if (!isHidden) {
            for (let el of this.storage.getComponents(entity)) {
                needsRemoval = false;
                if (el.range > range) {
                    range = el.range;
                }
                if (el.requester > requester) {
                    requester = el.requester
                }
                trackWalls = trackWalls || el.trackWalls;
            }
        }

        let oldDetails = this.detailsStorage.getComponent(entity);
        if (!needsRemoval) {
            let details;
            if (oldDetails !== undefined) {
                details = oldDetails;
                this.world.editComponent(entity, oldDetails.type, {
                    range, trackWalls, requester,
                }, undefined, false);
            } else {
                let dbgPrint = undefined;
                if (DEBUG_PRINT_POLYGON) {
                    dbgPrint = new Graphics();
                    this.world.requireSystem(PIXI_BOARD_TYPE).board.addChild(dbgPrint);
                }
                details = {
                    entity,
                    type: VISIBILITY_DETAILS_TYPE,
                    range, trackWalls,
                    requester,
                    _debugPrint: dbgPrint,
                    _canSee: {},
                } as VisibilityDetailsComponent;
                this.world.addComponent(entity, details);
            }
            this.updatePolygon(details);
        } else {
            // Nothing to see here, there are no vis. component or the range is 0 on all.
            if (oldDetails !== undefined) {
                this.removeTreePolygon(oldDetails);
                this.world.removeComponent(oldDetails);
            }
        }
        return needsRemoval;
    }

    private onComponentAdd(c: Component): void {
        if (c.type === VISIBILITY_TYPE) {
            this.recomputeDetails(c.entity);
        } else if (c.type === VISIBILITY_BLOCKER_TYPE) {
            let cmp = this.world.getComponent(c.entity, INTERACTION_TYPE);
            if (cmp !== undefined) {
                this.recomputeArea(shapeToAabb(cmp.shape));
            }
        } else if (c.type === INTERACTION_TYPE && this.blockerStorage.getComponent(c.entity) !== undefined) {
            this.recomputeArea(shapeToAabb((c as InteractionComponent).shape));
        } else if (c.type === SHARED_TYPE) {
            // Welcome to the visible!
            let vis = this.detailsStorage.getComponent(c.entity);
            if (vis !== undefined) {
                this.recomputeDetails(vis.entity);
            }

            let blo = this.blockerStorage.getComponent(c.entity);
            if (blo !== undefined) {
                let cmp = this.world.getComponent(c.entity, INTERACTION_TYPE);
                if (cmp !== undefined) {
                    this.recomputeArea(shapeToAabb(cmp.shape));
                }
            }
        }
    }

    private onComponentEdited(c: Component, changes: any): void {
        if (!this.world.getComponent(c.entity, SHARED_TYPE)) return;
        if (c.type === VISIBILITY_TYPE) {
            if ('range' in changes) {
                let vc = c as VisibilityComponent;
                if (isNaN(vc.range) || vc.range === undefined) {
                    vc.range = 50;
                }
                this.recomputeDetails(c.entity);
            }
        } else if (c.type === POSITION_TYPE) {
            let vis = this.detailsStorage.getComponent(c.entity);
            if (vis !== undefined) {
                this.updatePolygon(vis);
            }
            let blk = this.blockerStorage.getComponent(c.entity);
            if (blk !== undefined) {
                let inter = this.world.getComponent(blk.entity,INTERACTION_TYPE)!;
                this.recomputeArea(shapeToAabb(inter.shape));
            }
        } else if (c.type === INTERACTION_TYPE && 'shape' in changes && this.blockerStorage.getComponent(c.entity) !== undefined) {
            let i = c as InteractionComponent;

            this.recomputeArea(shapeToAabb(i.shape));
        }
    }

    private onComponentRemoved(c: Component): void {
        if (c.type === VISIBILITY_TYPE) {
            if (this.recomputeDetails(c.entity)) {
                // This component is the only one.
                let details = this.detailsStorage.getComponent(c.entity);
                if (details !== undefined) {
                    if (DEBUG_PRINT_POLYGON) {
                        (c as VisibilityDetailsComponent)._debugPrint?.destroy();
                    }
                    this.world.removeComponent(details);
                }
            }
        } else if (c.type === VISIBILITY_BLOCKER_TYPE) {
            this.removeVisibilityBlocker(c as VisibilityBlocker);
        } else if (c.type === INTERACTION_TYPE && this.blockerStorage.getComponent(c.entity) !== undefined) {
            let i = c as InteractionComponent;

            this.recomputeArea(shapeToAabb(i.shape));
        } else if (c.type === SHARED_TYPE) {
            // Component hidden is like component missing, they won't be able to see a thing
            let vis = this.detailsStorage.getComponent(c.entity);
            if (vis !== undefined) {
                this.recomputeDetails(c.entity);
            }

            let blo = this.blockerStorage.getComponent(c.entity);
            if (blo !== undefined) {
                this.removeVisibilityBlocker(blo);
            }
        }
    }

    private onResourceEdited(res: Resource, changed: any) {
        if (res.type === GRID_TYPE && 'size' in changed) {
            let grid = res as GridResource;
            this.gridSize = grid.size;

            // Update everything in the next tick so that everyone sees the changes first
            this.clock.ticker.addOnce(() => {
                for (let c of this.detailsStorage.allComponents()) {
                    this.updatePolygon(c);
                }
            });
        }
    }

    private removeVisibilityBlocker(c: VisibilityBlocker) {
        let cmp = this.world.getComponent(c.entity, INTERACTION_TYPE);
        if (cmp !== undefined) {
            this.recomputeArea(shapeToAabb(cmp.shape));
        }
    }

    enable(): void {
    }

    destroy(): void {
    }
}
