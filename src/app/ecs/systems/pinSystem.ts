import {System} from "../system";
import {World} from "../world";
import {SingleEcsStorage} from "../storage";
import {
    Component,
    FOLLOW_MOUSE_TYPE,
    FollowMouseComponent,
    HOST_HIDDEN_TYPE,
    HostHiddenComponent,
    POSITION_TYPE,
    PositionComponent
} from "../component";
import {ElementType, GRAPHIC_TYPE, GraphicComponent, PointElement, TextElement, VisibilityType} from "../../graphics";
import {POINT_RADIUS} from "./back/pixiGraphicSystem";
import {DisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {TOOL_TYPE, ToolDriver, ToolSystem} from "./back/toolSystem";
import {PointerClickEvent} from "./back/pixiBoardSystem";
import {SELECTION_TYPE, SelectionSystem} from "./back/selectionSystem";
import {Tool} from "../tools/toolType";
import {SpawnCommand} from "./command/spawnCommand";
import {executeAndLogCommand} from "./command/command";
import {findForeground, PARENT_LAYER_TYPE, ParentLayerComponent} from "./back/layerSystem";

export const PIN_TYPE = 'pin';
export type PIN_TYPE = typeof PIN_TYPE;

export interface PinComponent extends Component {
    type: PIN_TYPE;
    color: number;
    label?: string;
}


export class PinSystem implements System {
    readonly name = PIN_TYPE;
    readonly dependencies = [TOOL_TYPE, GRAPHIC_TYPE, SELECTION_TYPE];

    readonly world: World;
    readonly selectionSys: SelectionSystem;

    readonly storage = new SingleEcsStorage<PinComponent>(PIN_TYPE, true, true);

    constructor(world: World) {
        this.world = world;

        this.selectionSys = this.world.systems.get(SELECTION_TYPE) as SelectionSystem;

        if (world.isMaster) {
            let toolSys = world.systems.get(TOOL_TYPE) as ToolSystem;
            toolSys.addTool(new CreatePinToolDriver(this));
        }

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

    createElement(): PointElement {
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
            if (display.children!.length === 0) {
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
                (display.children![0] as TextElement).text = pin.label;
            }
        } else {
            display._childrenReplace = [];
        }

        this.world.editComponent(pin.entity, GRAPHIC_TYPE, { display }, undefined, false);
    }

    enable() {
    }

    destroy(): void {
    }
}

export class CreatePinToolDriver implements ToolDriver {
    readonly name = Tool.CREATE_PIN;
    private readonly sys: PinSystem;

    // Entity of the pin to be created (or -1)
    createPin: number = -1;

    constructor(sys: PinSystem) {
        this.sys = sys;
    }

    initCreation() {
        this.cancelCreation();
        let color = Math.floor(Math.random() * 0xFFFFFF);

        let display = this.sys.createElement();
        display.color = color;
        display.visib = VisibilityType.ALWAYS_VISIBLE;

        this.createPin = this.sys.world.spawnEntity(
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
            this.sys.world.despawnEntity(this.createPin);
            this.createPin = -1;
        }
    }

    confirmCreation() {
        if (this.createPin === -1) return;

        const world = this.sys.world;
        let id = this.createPin;
        let g = world.getComponent(id, GRAPHIC_TYPE) as GraphicComponent;
        let loc = world.getComponent(id, POSITION_TYPE) as PositionComponent;
        world.despawnEntity(id);

        let cmd = {
            kind: 'spawn',
            entities: [{
                id: world.allocateId(),
                components: [
                    {
                        type: POSITION_TYPE,
                        x: loc.x,
                        y: loc.y,
                    } as PositionComponent,
                    {
                        type: PIN_TYPE,
                        color: (g.display as PointElement).color,
                    } as PinComponent,
                    {
                        type: PARENT_LAYER_TYPE,
                        layer: findForeground(this.sys.world),
                    } as ParentLayerComponent,
                ]
            }]
        } as SpawnCommand;

        this.createPin = -1;
        this.sys.world.editResource(TOOL_TYPE, {
            tool: Tool.INSPECT,
        });
        executeAndLogCommand(world, cmd);
        //this.sys.selectionSys.setOnlyEntity(id);
    }


    onStart(): void {
        this.initCreation();
    }

    onEnd(): void {
        this.cancelCreation();
    }

    onPointerClick(event: PointerClickEvent) {
        this.confirmCreation();
    }
}