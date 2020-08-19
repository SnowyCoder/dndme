import * as PIXI from "pixi.js";
import {System} from "../system";
import {EcsTracker} from "../ecs";
import {EditMapPhase, Tool} from "../../phase/editMap/editMapPhase";
import {DESTROY_ALL} from "../../util/pixi";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {SingleEcsStorage} from "../storage";
import {Component, PositionComponent} from "../component";
import {app} from "../../index";
import {Point} from "../../util/geometry";

export interface PinComponent extends Component {
    type: 'pin';
    color: number;
    label?: string;
    _display: PIXI.Sprite;
    _selected?: boolean;
}


function lerpColor(a: number, b: number, t: number): number {
    let tr = ((a >> 16) & 0xFF) * (1 - t) + ((b >> 16) & 0xFF) * t;
    let tg = ((a >> 8) & 0xFF) * (1 - t) + ((b >> 8) & 0xFF) * t;
    let tb = (a & 0xFF) * (1 - t) + (b & 0xFF) * t;
    return tr << 16 | tg << 8 | tb;
}

const RADIUS = 12;

export class PinSystem implements System {
    readonly ecs: EcsTracker;
    readonly phase: EditMapPhase;

    readonly storage = new SingleEcsStorage<PinComponent>('pin');

    displayPins: PIXI.ParticleContainer;
    circleTex: PIXI.Texture;

    // Sprite of the pin to be created
    createPin?: PIXI.Sprite;

    pointToPin = new Map<string, number[]>();

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

    findPinAt(point: PIXI.Point): number | undefined {
        let closest = -1;
        let closestDist = Number.POSITIVE_INFINITY;
        for (let pin of this.storage.allComponents()) {
            let pos = this.ecs.getComponent(pin.entity, 'position') as PositionComponent;
            let dx = pos.x - point.x;
            let dy = pos.y - point.y;
            let d = dx * dx + dy * dy;
            if (d < closestDist) {
                closest = pin.entity;
                closestDist = d;
            }
        }
        if (closestDist <= RADIUS*RADIUS) {
            return closest;
        }
        return undefined;
    }

    addPinPoint(p: Point, pin: number) {
        let q = p[0] + '|' + p[1];
        let arr = this.pointToPin.get(q);
        if (arr === undefined) {
            arr = new Array<number>();
            this.pointToPin.set(q, arr);
        }
        arr.push(pin);
        this.phase.pointDb.insert(p);
    }

    removePinPoint(p: Point, pin: number) {
        this.phase.pointDb.remove(p);
        let q = p[0] + '|' + p[1];
        let arr = this.pointToPin.get(q);
        arr.splice(arr.indexOf(pin), 1);
        if (arr.length === 0) this.pointToPin.delete(q);
    }

    onEntitySpawned(entity: number): void {
        let pin = this.storage.getComponent(entity);
        if (pin === undefined) return;
        let pos = this.ecs.getComponent(entity, "position") as PositionComponent;
        if (pos === undefined) return;

        this.addPinPoint([pos.x, pos.y], entity);
        this.addPin(pos, pin);
    }

    onComponentEdited(comp: Component, changed: any): void {
        if (comp.type !== 'pin' && comp.type !== 'position') return;

        let pin, position;
        if (comp.type === 'pin') {
            pin = comp as PinComponent;
            position = this.ecs.getComponent(comp.entity, 'position') as PositionComponent;
        } else {
            pin = this.storage.getComponent(comp.entity);
            position = comp as PositionComponent;
        }

        if (pin === undefined || position === undefined) return;

        if (comp.type === 'position' && !(this.isTranslating && pin._selected === true)) {
            let oldX = changed.x === undefined ? position.x : changed.x;
            let oldY = changed.y === undefined ? position.y : changed.y;
            this.removePinPoint([oldX, oldY], comp.entity);
            this.addPinPoint([position.x, position.y], comp.entity);
        }

        this.redrawComponent(position, pin);
    }

    onComponentRemove(component: Component): void {
        if (component.type !== 'pin') return;
        (component as PinComponent)._display.destroy({
           children: true,
           texture: false,
           baseTexture: false,
        });

        let pos = this.ecs.getComponent(component.entity, 'position') as PositionComponent;
        this.removePinPoint([pos.x, pos.y], component.entity);
    }

    onSelectionBegin(entity: number): void {
        let pin = this.storage.getComponent(entity);
        if (pin === undefined) return;
        pin._selected = true;
        let pos = this.ecs.getComponent(pin.entity, 'position') as PositionComponent;
        this.redrawComponent(pos, pin);
    }

    onSelectionEnd(entity: number): void {
        let pin = this.storage.getComponent(entity);
        if (pin === undefined) return;
        pin._selected = undefined;
        let pos = this.ecs.getComponent(pin.entity, 'position') as PositionComponent;
        this.redrawComponent(pos, pin);
    }

    onToolMoveBegin(): void {
        this.isTranslating = true;
        for (let component of this.phase.selection.getSelectedByType("pin")) {
            let pin = component as PinComponent;
            let pos = this.ecs.getComponent(pin.entity, 'position') as PositionComponent;
            this.removePinPoint([pos.x, pos.y], pin.entity);
        }
    }

    onToolMoveEnd(): void {
        this.isTranslating = false;
        for (let component of this.phase.selection.getSelectedByType("pin")) {
            let pin = component as PinComponent;
            let pos = this.ecs.getComponent(pin.entity, 'position') as PositionComponent;
            this.addPinPoint([pos.x, pos.y], pin.entity);
        }
    }


    addPin(pos: PositionComponent, p: PinComponent) {
        if (p._display === undefined) {
            let g = new PIXI.Sprite(this.circleTex);

            this.displayPins.addChild(g);
            p._display = g;
        }
        this.redrawComponent(pos, p);
    }

    redrawComponent(pos: PositionComponent, pin: PinComponent) {
        let d = pin._display;

        let color = pin.color;

        if (pin._selected) {
            color = lerpColor(color, 0x7986CB, 0.3);
        }

        d.tint = color;
        d.position.set(pos.x, pos.y);
    }

    initCreation() {
        this.cancelCreation();
        let color = Math.floor(Math.random() * 0xFFFFFF);

        this.createPin = new PIXI.Sprite(this.circleTex);
        this.createPin.tint = color;
        this.createPin.position.set(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
        this.displayPins.addChild(this.createPin);
    }

    cancelCreation() {
        if (this.createPin !== undefined) {
            this.createPin.destroy({
                children: true,
                texture: false,
                baseTexture: false,
            });
            this.createPin = undefined;
        }
    }

    redrawCreation(pos: PIXI.Point) {
        if (this.createPin !== undefined) {
            this.createPin.position.set(pos.x, pos.y);
        }
    }

    confirmCreation(pos: PIXI.Point) {
        if (this.createPin === undefined) return;

        let id = this.ecs.spawnEntity(
            {
                type: 'position',
                x: pos.x,
                y: pos.y,
            } as PositionComponent,
            {
                type: 'pin',
                color: this.createPin.tint,
                _display: this.createPin,
            } as PinComponent,
        );
        this.createPin = undefined;
        this.phase.changeTool(Tool.INSPECT);
        this.phase.selection.setOnlyEntity(id);
    }

    enable() {
        this.displayPins = new PIXI.ParticleContainer(10000, {
            vertices: false,
            position: true,
            rotation: false,
            uvs: false,
            tint: true,
        });
        this.displayPins.zIndex = EditMapDisplayPrecedence.PINS;

        this.phase.board.addChild(this.displayPins);

        let g = new PIXI.Graphics();
        g.beginFill(0xFFFFFF);
        g.lineStyle(0);
        g.drawCircle(RADIUS, RADIUS, RADIUS);
        this.circleTex = app.renderer.generateTexture(g, PIXI.SCALE_MODES.LINEAR, 1);
        this.circleTex.defaultAnchor.set(0.5, 0.5);
    }

    destroy(): void {
        this.displayPins.destroy(DESTROY_ALL);
        this.circleTex.destroy(true);
    }
}