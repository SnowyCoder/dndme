import {System} from "../system";
import {World} from "../ecs";
import {EditMapPhase, Tool} from "../../phase/editMap/editMapPhase";
import {SingleEcsStorage} from "../storage";
import {
    Component,
    FOLLOW_MOUSE_TYPE,
    FollowMouseComponent,
    HOST_HIDDEN_TYPE, HostHiddenComponent,
    POSITION_TYPE,
    PositionComponent
} from "../component";
import {
    ElementType,
    GRAPHIC_TYPE,
    GraphicComponent,
    PointElement,
    TextElement,
    VisibilityType
} from "../../graphics";
import {POINT_RADIUS} from "./pixiSystem";
import {DisplayPrecedence} from "../../phase/editMap/displayPrecedence";

export const PIN_TYPE = 'pin';
export type PIN_TYPE = 'pin';

export interface PinComponent extends Component {
    type: PIN_TYPE;
    color: number;
    label?: string;
}


export class PinSystem implements System {
    readonly world: World;
    readonly phase: EditMapPhase;

    readonly storage = new SingleEcsStorage<PinComponent>(PIN_TYPE, true, true);

    // Entity of the pin to be created (or -1)
    createPin: number = -1;


    constructor(world: World, phase: EditMapPhase) {
        this.world = world;
        this.phase = phase;

        world.addStorage(this.storage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
    }

    private onComponentAdd(c: Component): void {
        if (c.type !== PIN_TYPE) return;
        let pin = c as PinComponent;
        let pos = this.world.getComponent(c.entity, POSITION_TYPE) as PositionComponent;
        if (pos === undefined) return;

        let display = this.world.getComponent(c.entity, GRAPHIC_TYPE) as GraphicComponent;
        if (display === undefined) {
            display = {
                type: GRAPHIC_TYPE,
                entity: -1,
                interactive: true,
                display: this.createElement()
            } as GraphicComponent;
            this.world.addComponent(c.entity, display);
        }
        this.redrawComponent(pin, display.display as PointElement);
    }

    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === PIN_TYPE) {
            let pin = comp as PinComponent;

            let grapc = this.world.getComponent(comp.entity, GRAPHIC_TYPE) as GraphicComponent;
            let pinDisplay = grapc.display as PointElement;
            this.redrawComponent(pin, pinDisplay);
        }
    }

    private createElement(): PointElement {
        return {
            type: ElementType.POINT,
            priority: DisplayPrecedence.PINS,
            visib: VisibilityType.NORMAL,
            ignore: false,
            interactive: true,
            color: 0xFFFFFF,
            children: [],
        } as PointElement;
    }

    private redrawComponent(pin: PinComponent, display: PointElement): void {
        display.color = pin.color;

        if (pin.label !== undefined) {
            if (display.children.length === 0) {
                display._childrenAdd = [{
                    type: ElementType.TEXT,
                    ignore: false,
                    interactive: false,
                    priority: 0,
                    visib: VisibilityType.NORMAL,
                    anchor: {x: 0.5, y: 1.0},
                    offset: {x: 0, y: -POINT_RADIUS},
                    color: 0,
                    text: pin.label,
                } as TextElement];
            } else {
                (display.children[0] as TextElement).text = pin.label;
            }
        } else {
            display._childrenReplace = [];
        }

        this.world.editComponent(pin.entity, GRAPHIC_TYPE, { display }, undefined, false);
    }

    initCreation() {
        this.cancelCreation();
        let color = Math.floor(Math.random() * 0xFFFFFF);

        let display = this.createElement();
        display.color = color;
        display.visib = VisibilityType.ALWAYS_VISIBLE;

        this.createPin = this.world.spawnEntity(
            {
                type: HOST_HIDDEN_TYPE,
            } as HostHiddenComponent,
            {
                type: POSITION_TYPE,
                entity: -1,
                x: Number.NEGATIVE_INFINITY,
                y: Number.NEGATIVE_INFINITY,
            } as PositionComponent,
            {
                type: GRAPHIC_TYPE,
                entity: -1,
                interactive: false,
                display,
            } as GraphicComponent,
            {
                type: FOLLOW_MOUSE_TYPE,
            } as FollowMouseComponent,
        );
    }

    cancelCreation() {
        if (this.createPin !== -1) {
            this.world.despawnEntity(this.createPin);
            this.createPin = -1;
        }
    }

    confirmCreation() {
        if (this.createPin === -1) return;

        let id = this.createPin;
        this.world.removeComponentType(id, FOLLOW_MOUSE_TYPE);
        let g = this.world.getComponent(id, GRAPHIC_TYPE) as GraphicComponent;
        this.world.removeComponent(g);
        this.world.addComponent(id, {
            type: PIN_TYPE,
            entity: id,
            color: (g.display as PointElement).color,
        } as PinComponent);
        this.world.removeComponentType(id, HOST_HIDDEN_TYPE);

        this.createPin = -1;
        this.phase.changeTool(Tool.INSPECT);
        this.phase.selection.setOnlyEntity(id);
    }

    enable() {
    }

    destroy(): void {
    }
}