import {System} from "../system";
import {World} from "../ecs";
import {SingleEcsStorage} from "../storage";
import {EditMapPhase} from "../../phase/editMap/editMapPhase";
import {Component, HideableComponent, PositionComponent} from "../component";
import {VisibilityComponent} from "./visibilitySystem";
import * as PointLightRender from "../../game/pointLightRenderer";
import {DESTROY_ALL} from "../../util/pixi";
import {newVisibilityAwareComponent, VisibilityAwareComponent} from "./visibilityAwareSystem";
import {LightComponent, LightSettings} from "./lightSystem";
import {Aabb} from "../../geometry/aabb";
import PIXI from "../../PIXI";
import {Resource} from "../resource";
import {Line} from "../../geometry/line";
import {WallComponent} from "./wallSystem";
import {rotatePointByOrig} from "../../geometry/collision";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {app} from "../../index";


export enum DoorType {
    NORMAL_LEFT = "normall",
    NORMAL_RIGHT = "normalr",
    ROTATE = "rotate",
}

export interface DoorComponent extends Component, HideableComponent {
    type: "door";
    doorType: DoorType;
    locked: boolean;
    open: boolean;
    clientVisible: boolean;
    _display?: PIXI.Graphics;
}


export class DoorSystem implements System {
    readonly ecs: World;

    storage = new SingleEcsStorage<DoorComponent>('door', true, true);
    phase: EditMapPhase;

    layer: PIXI.display.Layer;
    displayContainer: PIXI.Container;

    constructor(ecs: World, phase: EditMapPhase) {
        this.ecs = ecs;
        this.phase = phase;

        this.ecs.addStorage(this.storage);
        this.ecs.events.on('component_add', this.onComponentAdd, this);
        this.ecs.events.on('component_edited', this.onComponentEdited, this);
        this.ecs.events.on('component_remove', this.onComponentRemove, this);
    }

    redrawComponent(door: DoorComponent): void {
        let wall = this.ecs.getComponent(door.entity, 'wall') as WallComponent;
        let pos = this.ecs.getComponent(door.entity, 'position') as PositionComponent;

        let visible = wall.visible || this.phase.lightSystem.localLightSettings.visionType === 'dm';
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
        if (!this.ecs.isMaster) return;// This operation should only be done once!
        let wall = this.ecs.getComponent(door.entity, 'wall') as WallComponent;
        let pos = this.ecs.getComponent(door.entity, 'position') as PositionComponent;

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
            this.ecs.editComponent(door.entity, 'position', {
                x: newPos.x,
                y: newPos.y,
            });
        }
        if (newVec !== undefined) {
            this.ecs.editComponent(door.entity, 'wall', {
                vec: [newVec.x, newVec.y],
            });
        }
    }


    private onComponentAdd(comp: Component): void {
        if (comp.type === 'door') {
            let d = comp as DoorComponent;
            d._display = new PIXI.Graphics();
            this.displayContainer.addChild(d._display);
            if (d.open) {
                this.openDoor(d, d.doorType, true);
            }
            this.redrawComponent(d);

            let wall = this.ecs.getComponent(comp.entity, 'wall') as WallComponent;
            wall._dontMerge++;
        }
    }


    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === 'door') {
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
        if (comp.type === 'door') {
            let d = comp as DoorComponent;

            if (d.open) {
                this.openDoor(d, d.doorType, false);
            }

            d._display.destroy(DESTROY_ALL);

            let wall = this.ecs.getComponent(comp.entity, 'wall') as WallComponent;
            wall._dontMerge--;
        }
    }


    enable(): void {
        this.layer = new PIXI.display.Layer();
        this.layer.zIndex = EditMapDisplayPrecedence.WALL + 1;
        this.layer.interactive = false;
        app.stage.addChild(this.layer);

        this.displayContainer = new PIXI.Container();
        this.displayContainer.parentLayer = this.layer;
        this.displayContainer.interactive = false;
        this.displayContainer.interactiveChildren = false;
        this.phase.board.addChild(this.displayContainer);
    }

    destroy(): void {
        this.displayContainer.destroy(DESTROY_ALL);
        this.layer.destroy(DESTROY_ALL);
    }
}