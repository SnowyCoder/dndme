import {System} from "../system";
import {World} from "../world";
import {SingleEcsStorage} from "../storage";
import {Component, HideableComponent, POSITION_TYPE, PositionComponent} from "../component";
import {DESTROY_ALL} from "../../util/pixi";
import PIXI from "../../PIXI";
import {Line} from "../../geometry/line";
import {WALL_TYPE, WallComponent, WallSystem} from "./wallSystem";
import {rotatePointByOrig} from "../../geometry/collision";
import {REMEMBER_TYPE} from "./back/pixi/pixiGraphicSystem";
import {LOCAL_LIGHT_SETTINGS_TYPE, LocalLightSettings} from "./lightSystem";
import {PIXI_BOARD_TYPE, PixiBoardSystem} from "./back/pixi/pixiBoardSystem";
import {Resource} from "../resource";
import {ComponentEditCommand, singleEditCommand} from "./command/componentEdit";
import {emitCommand, executeAndLogCommand} from "./command/command";
import {LayerOrder} from "../../phase/editMap/layerOrder";
import { Group, Layer } from "@pixi/layers";
import { ComponentInfoPanel, COMPONENT_INFO_PANEL_TYPE } from "./back/selectionUiSystem";

import EcsDoor from "@/ui/ecs/EcsDoor.vue";
import { EVENT_INTERACTION_COLLIDER_UPDATE, InteractionComponent, InteractionSystem, INTERACTION_TYPE, QueryMetadata, QUERY_META_COLLIDING_ENTITY, Shape, shapeLine, shapeToAabb, ShapeType } from "./back/interactionSystem";
import { GraphicComponent, GRAPHIC_TYPE, LineElement } from "@/graphics";


export enum DoorType {
    NORMAL_LEFT = "normall",
    NORMAL_RIGHT = "normalr",
    ROTATE = "rotate",
}

export const EVENT_DOOR_DUAL_UPDATE = 'door_dual_update';

export const DOOR_TYPE = 'door';
export type DOOR_TYPE = typeof DOOR_TYPE;

export interface DoorComponent extends Component, HideableComponent {
    type: DOOR_TYPE;
    doorType: DoorType;
    locked: boolean;
    open: boolean;
    clientVisible: boolean;
    _display?: PIXI.Graphics;

    _primal?: number[];
    _dual?: number[];// x, y, vx, vy
}


export class DoorSystem implements System {
    readonly world: World;
    readonly name = DOOR_TYPE;
    readonly dependencies = [PIXI_BOARD_TYPE, WALL_TYPE];

    storage = new SingleEcsStorage<DoorComponent>(DOOR_TYPE, true, true);

    pixiBoardSys: PixiBoardSystem;
    wallSys: WallSystem;
    isMasterView: boolean = false;

    layer: Layer;
    displayContainer: PIXI.Container;

    constructor(world: World) {
        this.world = world;

        this.layer = new Layer(new Group(LayerOrder.DETAILS, false));
        this.displayContainer = new PIXI.Container();

        this.pixiBoardSys = world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
        this.wallSys = world.systems.get(WALL_TYPE) as WallSystem;

        this.world.addStorage(this.storage);
        this.world.events.on('component_add', this.onComponentAdd, this);
        this.world.events.on('component_edited', this.onComponentEdited, this);
        this.world.events.on('component_remove', this.onComponentRemove, this);
        this.world.events.on('resource_edited', this.onResourceEdited, this);
        if (world.isMaster) {
            this.world.events.on('interact', this.onInteract, this);
            this.world.events.on('populate', () => {
                this.world.spawnEntity({
                    type: COMPONENT_INFO_PANEL_TYPE,
                    entity: -1,
                    component: DOOR_TYPE,
                    name: 'Door',
                    panel: EcsDoor,
                    panelPriority: 50,
                    addEntry: {
                        whitelist: [WALL_TYPE],
                        blacklist: [DOOR_TYPE],
                        component(entity: number) {
                            return [{
                                type: DOOR_TYPE,
                                entity,
                                doorType: DoorType.NORMAL_LEFT,
                                locked: false,
                                open: false,
                                clientVisible: true,
                            } as DoorComponent]
                        },
                    }
                } as ComponentInfoPanel);
            });
        }
    }

    redrawComponent(door: DoorComponent): void {
        let wall = this.world.getComponent(door.entity, WALL_TYPE) as WallComponent;
        let pos = this.world.getComponent(door.entity, POSITION_TYPE) as PositionComponent;

        let visible = this.isMasterView ||
            (this.world.getComponent(door.entity, REMEMBER_TYPE) !== undefined && door.clientVisible !== false);
        if (!visible) {
            door._display?.clear();
            return;
        }

        // TODO: use interaction shape? (might bug out on translations)
        let line = new Line(
            pos.x, pos.y,
            pos.x + wall.vec[0], pos.y + wall.vec[1]
        );
        this.drawLines(door, line);
    }

    private drawLines(door: DoorComponent, line: Line): void {
        let g = door._display;
        if (g === undefined) return;
        g.clear();
        g.lineStyle(2, 0xFFFFFF, 0.5);
        switch (door.doorType) {
            case DoorType.NORMAL_LEFT: {
                let r = line.distance();
                let startAngle = Math.atan2(line.toY - line.fromY, line.toX - line.fromX);
                if (door.open) startAngle -= Math.PI / 2;
                g.arc(line.fromX, line.fromY, r, startAngle, startAngle + Math.PI / 2);
                break;
            }
            case DoorType.NORMAL_RIGHT: {
                let r = line.distance();
                let startAngle = Math.atan2(line.fromY - line.toY, line.fromX - line.toX);
                if (!door.open) startAngle -= Math.PI / 2;
                g.arc(line.toX, line.toY, r, startAngle, startAngle + Math.PI / 2);
                break;
            }
            case DoorType.ROTATE: {
                let r = line.distance() / 2;
                let cx = (line.fromX + line.toX) / 2;
                let cy = (line.fromY + line.toY) / 2;
                g.drawCircle(cx, cy, r);
                break;
            }
            default:
                console.warn("Unknown door type: " + door.doorType);
        }
    }

    private updatePrimal(door: DoorComponent, checkPos: boolean = true, checkVec: boolean = true): boolean {
        const pos = this.world.getComponent(door.entity, POSITION_TYPE) as PositionComponent;
        const wall = this.world.getComponent(door.entity, WALL_TYPE) as WallComponent;

        const p = door._primal;
        const q = [pos.x, pos.y, wall.vec[0], wall.vec[1]];
        if (p !== undefined &&
                (!checkPos || (p[0] == q[0] && p[1] == q[1])) &&
                (!checkVec || (p[2] == q[2] && p[3] == q[3]))) {
            return false;// Nothing to update;
        }
        door._primal = q;
        return true;
    }

    private recomputeDual(door: DoorComponent, forceOpen?: boolean): number[] {
        const primal = door._primal!;
        const pos = [primal[0], primal[1]];
        const wall = [primal[2], primal[3]];

        let newPos = undefined;
        let newVec = undefined;
        const open = forceOpen !== undefined ? forceOpen : !door.open;

        switch (door.doorType) {
            case DoorType.NORMAL_LEFT: {
                newVec = rotatePointByOrig(
                    { x: 0, y: 0 },
                    Math.PI / 2 * (open ? -1 : 1),
                    { x: wall[0], y: wall[1] }
                );

                break;
            }
            case DoorType.NORMAL_RIGHT: {
                let angle = Math.PI / 2 * (open ? 1 : -1);
                newPos = rotatePointByOrig(
                    { x: pos[0] + wall[0], y: pos[1] + wall[1] },
                    angle,
                    { x: pos[0], y: pos[1] }
                );

                newVec = rotatePointByOrig(
                    { x: 0, y: 0 },
                    angle,
                    { x: wall[0], y: wall[1] }
                )

                break;
            }
            case DoorType.ROTATE: {
                let hvx = wall[0] / 2;
                let hvy = wall[1] / 2;
                let origin = { x: pos[0] + hvx, y: pos[1] + hvy };
                let angle = Math.PI / 2 * (open ? 1 : -1);
                newPos = rotatePointByOrig(
                    origin, angle,
                    { x: pos[0], y: pos[1] },
                );
                newVec = rotatePointByOrig(
                    origin, angle,
                    { x: pos[0] + wall[0], y: pos[1] + wall[1] }
                );
                newVec.x -= newPos.x;
                newVec.y -= newPos.y;

                break;
            }
            default:
                console.warn("Unknown door type: " + door.doorType);
        }
        const px = newPos?.x ?? pos[0];
        const py = newPos?.y ?? pos[1];
        const vx = newVec?.x ?? wall[0];
        const vy = newVec?.y ?? wall[1];
        return [px, py, vx, vy];
    }

    private openDoor(door: DoorComponent, updateWorld: boolean = true): boolean {
        const orig = door._primal!;
        let dual = door._dual;
        if (dual === undefined) return false;

        const intersectWith = this.wallSys.queryIntersections(dual[0], dual[1], dual[2], dual[3]);
        if (!(intersectWith.length === 0 || (intersectWith.length === 1 && intersectWith[0] === door.entity))) {
            console.log("Door stuck");
            // Collision, don't split the door pls.
            return false;
        }
        door._dual = orig;
        door._primal = dual;
        if (!updateWorld) return true;

        const changes = [
            {
                entity: door.entity,
                type: POSITION_TYPE,
                changes: {
                    x: dual[0],
                    y: dual[1],
                },
            },
            {
                entity: door.entity,
                type: WALL_TYPE,
                changes: {
                    vec: [dual[2], dual[3]],
                },
            },
        ];

        // Commit the edits at the same time to prevent the wall from being split (multi = true)
        // (if we commit position before rotation it might create an overlap situation that should
        // not be there).
        const cmd = {
            kind: 'cedit',
            edit: changes,
            multi: true,
        } as ComponentEditCommand;
        // Why are we using share?
        // We're editing another synced component, but this (the door) might be hidden.
        // If the master opens a hidden door the "open" message will not be shared but the door should still open for
        // the roleplayers.
        // Addendum: what if the entity is hidden? Then the command will edit a hidden entity so it will be stripped away.
        emitCommand(this.world, cmd, !door.clientVisible);
        this.world.events.emit(EVENT_DOOR_DUAL_UPDATE, door);
        return true;
    }


    private onComponentAdd(comp: Component): void {
        if (comp.type === DOOR_TYPE) {
            let d = comp as DoorComponent;
            d._display = new PIXI.Graphics();
            d._display.tint = 0x000000;
            this.displayContainer.addChild(d._display);
            // Do NOT re-open the door, if it is open it means that it has been loaded from file and the wall is
            // already in the "door open" state. Bad snowy, wtf were you thinking
            this.updatePrimal(d);
            d._dual = this.recomputeDual(d);
            this.world.events.emit(EVENT_DOOR_DUAL_UPDATE, d);
            this.redrawComponent(d);

            let wall = this.world.getComponent(comp.entity, WALL_TYPE) as WallComponent;
            if (wall !== undefined) wall._dontMerge++;
        } else if (comp.type === REMEMBER_TYPE) {
            let door = this.storage.getComponent(comp.entity);
            if (door !== undefined) {
                this.redrawComponent(door);
            }
        }
    }


    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === DOOR_TYPE) {
            let d = comp as DoorComponent;
            if ('doorType' in changed) {
                if (d.open) {
                    // Close the door using the previous doorType and reopen it with the new one
                    this.openDoor(d, false);
                    d._dual = this.recomputeDual(d, true);
                    if (!this.openDoor(d)) {
                        this.world.events.emit(EVENT_DOOR_DUAL_UPDATE, d);
                    }
                } else {
                    d._dual = this.recomputeDual(d);
                    this.world.events.emit(EVENT_DOOR_DUAL_UPDATE, d);
                }
            }
            if ('open' in changed) {
                if (!this.openDoor(d)) {
                    // TODO: well, this does not work right with the GUI
                    d.open = !d.open;
                }
            }
            this.redrawComponent(d);
        } else if (comp.type === WALL_TYPE || comp.type === POSITION_TYPE) {
            let d = this.storage.getComponent(comp.entity);
            if (d !== undefined) {
                // This is also called by openDoor, check that the changes are made by us before recomputing the dual
                if (this.updatePrimal(d, comp.type === POSITION_TYPE, comp.type === WALL_TYPE)) {
                    d._dual = this.recomputeDual(d);
                    this.world.events.emit(EVENT_DOOR_DUAL_UPDATE, d);
                }
                this.redrawComponent(d);
            }
        }
    }

    private onComponentRemove(comp: Component): void {
        if (comp.type === DOOR_TYPE) {
            let d = comp as DoorComponent;

            d._display?.destroy(DESTROY_ALL);

            let wall = this.world.getComponent(comp.entity, WALL_TYPE) as WallComponent;
            wall._dontMerge--;
        }
    }

    private onResourceEdited(res: Resource, edited: any) {
        if (res.type === LOCAL_LIGHT_SETTINGS_TYPE && 'visionType' in edited) {
            this.isMasterView = (res as LocalLightSettings).visionType !== 'rp';
            for (let c of this.storage.allComponents()) {
                this.redrawComponent(c);
            }
        }
    }

    private onInteract(entities: number[]) {
        for (let entity of entities) {
            let door = this.storage.getComponent(entity);
            if (door === undefined) continue;
            let cmd = singleEditCommand({
                entity,
                type: DOOR_TYPE,
                changes: {
                    open: !door.open,
                }
            });
            executeAndLogCommand(this.world, cmd);
        }
    }


    enable(): void {
        this.layer.interactive = false;
        this.pixiBoardSys.root.addChild(this.layer);

        this.displayContainer.parentLayer = this.layer;
        this.displayContainer.interactive = false;
        this.displayContainer.interactiveChildren = false;
        this.pixiBoardSys.board.addChild(this.displayContainer);

        this.isMasterView = (this.world.getResource(LOCAL_LIGHT_SETTINGS_TYPE) as LocalLightSettings)?.visionType !== 'rp';
    }

    destroy(): void {
        this.displayContainer.destroy(DESTROY_ALL);
        this.layer.destroy(DESTROY_ALL);
    }
}



export const DOOR_STUCK = 'door_stuck';
export type DOOR_STUCK = typeof DOOR_STUCK;
export interface DoorStuckComponent extends Component {
    type: DOOR_STUCK;
    dualEntity: number;
    isStuck: boolean;// "output" flag, written by this system when the door is stuck
}


export const DOOR_CONFLICT_DETECTOR_TYPE = 'door_conflict_detector';
export type DOOR_CONFLICT_DETECTOR_TYPE = typeof DOOR_CONFLICT_DETECTOR_TYPE;
export class DoorConflictDetector implements System {
    readonly world: World;
    readonly name = DOOR_CONFLICT_DETECTOR_TYPE;
    readonly dependencies = [DOOR_TYPE, INTERACTION_TYPE];

    readonly storage = new SingleEcsStorage<DoorStuckComponent>(DOOR_STUCK, false, false);
    readonly dualToPrimal = new Map<number, number>();


    // The idea to check what door is stuck without impacting performance is to have an optimized
    // AABB tree that tracks dual doors (dual doors = what the door would be like when it's opened/closed).
    // Whenever a wall is added/moved we check in the AABB tree if it collides with the dual doors, if it does,
    // we tag the door as stuck.
    // We can do this without becoming crazy by using the InteractionSystem collider mechanism:
    // - For each door create another InteractionComponent with its dual
    // - Make it unselectable, invisible and a collider
    // - Use a custom checker function to only collide with doors
    // - Track how many doors are colliding with our totally real dual door
    // - Profit!!!
    // Only hiccup: we can only have 1 interaction component per entity, and since our door entity already has an
    // interaction component (remember, it's a door) we need to create another entity, let's call it "dual entity".
    // Wow, this is beginning to sound like that complex Linear Integer Optimization thingy.

    constructor(world: World) {
        this.world = world;

        this.world.events.on(EVENT_DOOR_DUAL_UPDATE, this.onDoorDualUpdate.bind(this));
        this.world.events.on(EVENT_INTERACTION_COLLIDER_UPDATE, this.onInteractionColliderUpdate.bind(this));

        this.world.events.on('component_remove', this.onComponentRemove.bind(this));

        this.world.addStorage(this.storage);
    }

    private createComponent(door: DoorComponent): DoorStuckComponent {
        const dual = door._dual!;
        const dualEntity = this.world.spawnEntity();

        this.world.addComponent(door.entity, {
            type: DOOR_STUCK,
            dualEntity,
        } as DoorStuckComponent);

        this.dualToPrimal.set(dualEntity, door.entity);

        this.world.addComponent(dualEntity, {
            type: INTERACTION_TYPE,
            entity: -1,
            selectPriority: -1000,
            snapEnabled: false,
            shape: shapeLine(new Line(dual[0], dual[1], dual[0] + dual[2], dual[1] + dual[3])),
            // Hey there, we only want to collide with walls!
            queryCheck: (shape: Shape, meta: QueryMetadata) => {
                if (shape.type !== ShapeType.LINE) return false;
                const entity = meta[QUERY_META_COLLIDING_ENTITY] as number | undefined;
                return entity !== undefined &&
                    entity !== door.entity &&
                    this.world.getComponent(entity, WALL_TYPE) !== undefined;
            },
            // This means that the InteractionSystem will have to update us about any new shapes that collide with ours
            isCollider: true,
        } as InteractionComponent)

        return this.storage.getComponent(door.entity)!;
    }

    private destroyComponent(entity: number, removeCmp: boolean): boolean {
        let c = this.storage.getComponent(entity);
        if (c === undefined) return false;

        this.dualToPrimal.delete(c.dualEntity);

        this.world.despawnEntity(c.dualEntity);
        if (removeCmp) this.world.removeComponent(c);
        return true;
    }

    private onDoorDualUpdate(door: DoorComponent): void {
        const dual = door._dual!;

        let c = this.storage.getComponent(door.entity);
        if (c === undefined) {
            this.createComponent(door);
            return;
        }
        const dualShape = shapeLine(new Line(dual[0], dual[1], dual[0] + dual[2], dual[1] + dual[3]));
        this.world.editComponent(c.dualEntity, INTERACTION_TYPE, {
            shape: dualShape,
        });
    }

    private onInteractionColliderUpdate(entity: number, newColliders: number[], added: number[], removed: []): void {
        //console.log("INTERACTION_COLLIDER_UPDATE", entity, newColliders, added, removed);
        const primalEntity = this.dualToPrimal.get(entity);
        if (primalEntity === undefined) return;

        const isNowStuck = newColliders.length > 0;
        const stuckComp = this.storage.getComponent(primalEntity)!;

        if (isNowStuck === stuckComp.isStuck) return;

        this.world.editComponent(primalEntity, DOOR_STUCK, {
            isStuck: isNowStuck,
        });
        const wallComp = this.world.getComponent(primalEntity, GRAPHIC_TYPE) as GraphicComponent;

        (wallComp.display as LineElement).color = isNowStuck ? 0xFF0000 : 0x000000;
        // Tell the graphics system to redraw the element
        this.world.editComponent(primalEntity, GRAPHIC_TYPE, {}, undefined, false);
    }

    private onComponentRemove(comp: Component): void {
        if (comp.type === DOOR_TYPE || comp.type === DOOR_STUCK) {
            this.destroyComponent(comp.entity, comp.type === DOOR_TYPE);
        }
    }

    enable(): void {
    }
    destroy(): void {
    }
}
