import {System} from "../system";
import {World} from "../world";
import {SingleEcsStorage} from "../storage";
import {Component, HideableComponent, NAME_TYPE, POSITION_TYPE, PositionComponent} from "../component";
import {DESTROY_ALL} from "../../util/pixi";
import PIXI from "../../PIXI";
import {Line} from "../../geometry/line";
import {WALL_TYPE, WallComponent} from "./wallSystem";
import {rotatePointByOrig} from "../../geometry/collision";
import {DisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {app} from "../../index";
import {REMEMBER_TYPE} from "./pixiGraphicSystem";
import {LIGHT_TYPE, LOCAL_LIGHT_SETTINGS_TYPE, LocalLightSettings} from "./lightSystem";
import {PIXI_BOARD_TYPE, PixiBoardSystem} from "./pixiBoardSystem";


export enum DoorType {
    NORMAL_LEFT = "normall",
    NORMAL_RIGHT = "normalr",
    ROTATE = "rotate",
}

export const DOOR_TYPE = 'door';
export type DOOR_TYPE = typeof DOOR_TYPE;

export interface DoorComponent extends Component, HideableComponent {
    type: DOOR_TYPE;
    doorType: DoorType;
    locked: boolean;
    open: boolean;
    clientVisible: boolean;
    _display?: PIXI.Graphics;
}


export class DoorSystem implements System {
    readonly world: World;
    readonly name = DOOR_TYPE;
    readonly dependencies = [PIXI_BOARD_TYPE, WALL_TYPE, LIGHT_TYPE];

    storage = new SingleEcsStorage<DoorComponent>(DOOR_TYPE, true, true);

    pixiBoardSys: PixiBoardSystem;
    localLightSettings: LocalLightSettings;

    layer: PIXI.display.Layer;
    displayContainer: PIXI.Container;

    constructor(ecs: World) {
        this.world = ecs;

        this.pixiBoardSys = ecs.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;
        this.localLightSettings = ecs.getResource(LOCAL_LIGHT_SETTINGS_TYPE) as LocalLightSettings;

        this.world.addStorage(this.storage);
        this.world.events.on('component_add', this.onComponentAdd, this);
        this.world.events.on('component_edited', this.onComponentEdited, this);
        this.world.events.on('component_remove', this.onComponentRemove, this);
    }

    redrawComponent(door: DoorComponent): void {
        let wall = this.world.getComponent(door.entity, WALL_TYPE) as WallComponent;
        let pos = this.world.getComponent(door.entity, POSITION_TYPE) as PositionComponent;

        let visible = this.localLightSettings.visionType === 'dm' ||
            this.world.getComponent(door.entity, REMEMBER_TYPE) !== undefined;
        if (!visible) {
            door._display.clear();
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
        g.lineStyle(2, 0, 0.5);
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

    private openDoor(door: DoorComponent, doorType: DoorType, open: boolean): void {
        if (!this.world.isMaster) return;// This operation should only be done once!
        let wall = this.world.getComponent(door.entity, WALL_TYPE) as WallComponent;
        let pos = this.world.getComponent(door.entity, POSITION_TYPE) as PositionComponent;

        let newPos = undefined;
        let newVec = undefined;

        switch (doorType) {
            case DoorType.NORMAL_LEFT: {
                newVec = rotatePointByOrig(
                    { x: 0, y: 0 },
                    Math.PI / 2 * (open ? -1 : 1),
                    { x: wall.vec[0], y: wall.vec[1] }
                );

                break;
            }
            case DoorType.NORMAL_RIGHT: {
                let angle = Math.PI / 2 * (open ? 1 : -1);
                newPos = rotatePointByOrig(
                    { x: pos.x + wall.vec[0], y: pos.y + wall.vec[1] },
                    angle,
                    { x: pos.x, y: pos.y }
                );

                newVec = rotatePointByOrig(
                    { x: 0, y: 0 },
                    angle,
                    { x: wall.vec[0], y: wall.vec[1] }
                )

                break;
            }
            case DoorType.ROTATE: {
                let hvx = wall.vec[0] / 2;
                let hvy = wall.vec[1] / 2;
                let origin = { x: pos.x + hvx, y: pos.y + hvy };
                let angle = Math.PI / 2 * (open ? 1 : -1);
                newPos = rotatePointByOrig(
                    origin, angle,
                    { x: pos.x, y: pos.y },
                );
                newVec = rotatePointByOrig(
                    origin, angle,
                    { x: pos.x + wall.vec[0], y: pos.y + wall.vec[1] }
                );
                newVec.x -= newPos.x;
                newVec.y -= newPos.y;

                break;
            }
            default:
                console.warn("Unknown door type: " + doorType);
        }

        if (newPos !== undefined) {
            this.world.editComponent(door.entity, POSITION_TYPE, {
                x: newPos.x,
                y: newPos.y,
            });
        }
        if (newVec !== undefined) {
            this.world.editComponent(door.entity, WALL_TYPE, {
                vec: [newVec.x, newVec.y],
            });
        }
    }


    private onComponentAdd(comp: Component): void {
        if (comp.type === DOOR_TYPE) {
            let d = comp as DoorComponent;
            d._display = new PIXI.Graphics();
            this.displayContainer.addChild(d._display);
            if (d.open) {
                this.openDoor(d, d.doorType, true);
            }
            this.redrawComponent(d);

            let wall = this.world.getComponent(comp.entity, WALL_TYPE) as WallComponent;
            wall._dontMerge++;
        }
    }


    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === DOOR_TYPE) {
            let d = comp as DoorComponent;
            if ('open' in changed) {
                this.openDoor(d, d.doorType, d.open);
            }
            if ('doorType' in changed) {
                if (d.open) {
                    this.openDoor(d, changed['doorType'], false);
                    this.openDoor(d, d.doorType, true);
                }
            }
            this.redrawComponent(d);
        } else if (comp.type === 'wall') {
            let d = this.storage.getComponent(comp.entity);
            if (d !== undefined) this.redrawComponent(d);
        } else if (comp.type === 'position') {
            let d = this.storage.getComponent(comp.entity);
            if (d !== undefined) this.redrawComponent(d);
        }
    }

    private onComponentRemove(comp: Component): void {
        if (comp.type === DOOR_TYPE) {
            let d = comp as DoorComponent;

            if (d.open) {
                this.openDoor(d, d.doorType, false);
            }

            d._display.destroy(DESTROY_ALL);

            let wall = this.world.getComponent(comp.entity, WALL_TYPE) as WallComponent;
            wall._dontMerge--;
        }
    }


    enable(): void {
        this.layer = new PIXI.display.Layer();
        this.layer.zIndex = DisplayPrecedence.WALL + 1;
        this.layer.interactive = false;
        app.stage.addChild(this.layer);

        this.displayContainer = new PIXI.Container();
        this.displayContainer.parentLayer = this.layer;
        this.displayContainer.interactive = false;
        this.displayContainer.interactiveChildren = false;
        this.pixiBoardSys.board.addChild(this.displayContainer);
    }

    destroy(): void {
        this.displayContainer.destroy(DESTROY_ALL);
        this.layer.destroy(DESTROY_ALL);
    }
}