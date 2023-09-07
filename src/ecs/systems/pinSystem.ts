import {System} from "../System";
import {World} from "../World";
import {MultiEcsStorage, SingleEcsStorage} from "../Storage";
import {
    Component,
    FOLLOW_MOUSE_TYPE,
    POSITION_TYPE,
    PositionComponent,
    NAME_TYPE,
    NameComponent,
    FollowMouseFlag,
    SharedFlag,
    SHARED_TYPE,
    SERIALIZED_TYPE,
    SerializedFlag,
TRANSFORM_TYPE
} from "../component";
import {ElementType, GRAPHIC_TYPE, GraphicComponent, PointElement, VisibilityType, ImageElement, ContainerElement, ImageScaleMode, ImageWhileLoading} from "../../graphics";
import {POINT_RADIUS} from "./back/pixi/pixiGraphicSystem";
import {DisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {TOOL_TYPE, ToolPart} from "./back/ToolSystem";
import {PointerEvents, PointerUpEvent} from "./back/pixi/pixiBoardSystem";
import {ToolType} from "../tools/toolType";
import {SpawnCommandKind} from "./command/spawnCommand";
import {executeAndLogCommand} from "./command/command";
import {findForeground, PARENT_LAYER_TYPE, ParentLayerComponent} from "./back/LayerSystem";
import { NameAsLabelComponent, NAME_AS_LABEL_TYPE } from "./back/NameAsLabelSystem";
import SafeEventEmitter from "../../util/safeEventEmitter";
import { CREATION_INFO_TYPE, Resource } from "../resource";

import { StandardToolbarOrder } from "@/phase/editMap/standardToolbarOrder";
import { ComponentInfoPanel, COMPONENT_INFO_PANEL_TYPE, SELECTION_UI_TYPE } from "./back/SelectionUiSystem";


import PinCreationOptions from "@/ui/edit/creation/PinCreationOptions.vue";
import EcsPin from "@/ui/ecs/EcsPin.vue";
import { FileIndex } from "@/map/FileDb";
import { Texture } from "pixi.js";

export const PIN_TYPE = 'pin';
export type PIN_TYPE = typeof PIN_TYPE;

export interface PinComponent extends Component {
    type: PIN_TYPE;
    color: number;
    size?: number;
    imageId?: FileIndex;
    hideColor?: boolean;
}

export const DEFAULT_SIZE: number = 1;

export interface PinResource extends Resource {
    type: PIN_TYPE;
    defaultSize: number;
    _save: true;
    _sync: true;
}


export class PinSystem implements System {
    readonly name = PIN_TYPE;
    readonly dependencies = [TOOL_TYPE, GRAPHIC_TYPE, SELECTION_UI_TYPE, NAME_AS_LABEL_TYPE];
    readonly components?: [PinComponent];
    readonly resources?: [PinResource];

    readonly world: World;

    readonly storage = new SingleEcsStorage<PinComponent>(PIN_TYPE, true, true);

    res: PinResource;

    constructor(world: World) {
        this.world = world;

        if (world.isMaster) {
            let toolSys = world.requireSystem(TOOL_TYPE);
            toolSys.addToolPart(new CreatePinToolPart(this));
            toolSys.addCreationTool({
                name: ToolType.CREATE_PIN,
                parts: ['space_pan', 'create_pin'],
                additionalOptions: PinCreationOptions,
                toolbarEntry: {
                    icon: 'fas fa-thumbtack',
                    title: 'Add pin',
                    priority: StandardToolbarOrder.CREATE_PIN,
                },
            });
        }

        // EVERYONE should have this, both master and clients!
        world.addResource({
            type: PIN_TYPE,
            defaultSize: DEFAULT_SIZE,
            _save: true,
            _sync: true,
        } as PinResource, 'ignore');

        world.events.on('populate', () => {
            this.world.spawnEntity({
                type: COMPONENT_INFO_PANEL_TYPE,
                entity: -1,
                component: PIN_TYPE,
                name: 'Pin',
                panel: EcsPin,
                panelPriority: 100,
                hidePanels: [TRANSFORM_TYPE],// Controlled directly by us
            } as ComponentInfoPanel);
        });


        this.res = world.getResource(PIN_TYPE)!;

        world.addStorage(this.storage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('resource_edited', this.onResourceEdited, this);


        this.world.events.emit('register_image', PIN_TYPE, 'imageId');
    }

    private onComponentAdd(c: Component): void {
        if (c.type !== PIN_TYPE) return;
        let pin = c as PinComponent;
        let pos = this.world.getComponent(c.entity, POSITION_TYPE);
        if (pos === undefined) return;

        let display = this.world.getComponent(c.entity, GRAPHIC_TYPE);
        if (display === undefined) {
            display = {
                type: GRAPHIC_TYPE,
                entity: -1,
                interactive: true,
                display: this.createElement()
            } as GraphicComponent;
            this.world.addComponent(c.entity, display);
        }

        this.world.addComponent(c.entity, {
            type: NAME_AS_LABEL_TYPE,
            entity: -1,
            initialOffset: {x: 0, y: -POINT_RADIUS},
            scaleMode:'grid',
        } satisfies NameAsLabelComponent as NameAsLabelComponent);

        this.redrawComponent(pin);

        // In some older versions there was a label field that was printed on top of the point,
        // this has been removed in favour of the "name" components (and the 'name_as_label' system)
        // so if you find a label that is not listed in the names add it to keep compatibility
        if ((pin as any).label !== undefined) {
            const label = (pin as any).label;
            let isNameFound = false;
            for (let name of (this.world.storages.get(NAME_TYPE) as MultiEcsStorage<NameComponent>).getComponents(pin.entity)) {
                if (name === label) {
                    isNameFound = true;
                    break;
                }
            }

            if (!isNameFound) {
                this.world.addComponent(pin.entity, {
                    type: NAME_TYPE,
                    name: label,
                } as NameComponent);
            }

            delete (pin as any).label;
        }
    }

    private onComponentEdited(comp: Component, changed: any): void {
        if (comp.type === PIN_TYPE) {
            let pin = comp as PinComponent;
            this.redrawComponent(pin);
        }
    }

    private onResourceEdited(res: Resource, changed: any): void {
        if (res.type === PIN_TYPE) {
            for (let c of this.storage.getComponents()) {
                if (c.size !== undefined && c.size !== 0) continue;
                this.redrawComponent(c);
            }
        }
    }

    createElement(): ContainerElement {
        return {
            type: ElementType.CONTAINER,
            priority: DisplayPrecedence.PINS,
            visib: VisibilityType.NORMAL,
            ignore: false,
            children: [
                {
                    type: ElementType.POINT,
                    priority: DisplayPrecedence.PINS,
                    visib: VisibilityType.NORMAL,
                    ignore: false,
                    color: 0xFFFFFF,
                    scale: 1,
                } as PointElement,
                {
                    type: ElementType.IMAGE,
                    texture: {
                        type: 'raw',
                        value: Texture.WHITE,
                    },
                    whileLoading: ImageWhileLoading.HIDE,
                    priority: DisplayPrecedence.PINS,
                    visib: VisibilityType.INVISIBLE,
                    ignore: false,
                    scale: 0.8,
                    scaleMode: ImageScaleMode.CONSTRAINED,
                    anchor: { x: 0.5, y: 0.5 },
                    tint: 0xFFFFFF,
                    children: []
                } as ImageElement,
            ],
        } as ContainerElement;
    }

    private redrawComponent(pin: PinComponent): void {
        const gc = this.world.getComponent(pin.entity, GRAPHIC_TYPE)!;
        const scale = pin.size || this.res.defaultSize;

        const point = gc.display.children![0] as PointElement;
        point.color = pin.color;
        point.scale = scale;
        // If we enable this when the image will not yet be loaded the pin wil be invisible
        // TODO: optimize by hiding circle ONLY when image is loaded
        //point.visib = pin.hideColour ? VisibilityType.INVISIBLE : VisibilityType.NORMAL;

        const image = gc.display.children![1] as ImageElement;
        image.scale = scale * 0.8;
        if (pin.imageId !== undefined) {
            image.visib = VisibilityType.NORMAL;
            image.texture = {
                type: 'external',
                value: pin.imageId!,
                priority: 100,
            };
            image.scale = pin.hideColor ? 1 : 0.8;
        } else {
            image.visib = VisibilityType.INVISIBLE;
            image.texture = {
                type: 'raw',
                value: Texture.WHITE,
            };
        }

        this.world.editComponent(pin.entity, GRAPHIC_TYPE, { display: gc.display }, undefined, false);

        this.world.editComponent(pin.entity, NAME_AS_LABEL_TYPE, {
            scale: scale,
        } as NameAsLabelComponent);
    }

    enable() {
    }

    destroy(): void {
    }
}

export class CreatePinToolPart implements ToolPart {
    readonly name = ToolType.CREATE_PIN;
    private readonly sys: PinSystem;

    // Entity of the pin to be created (or -1)
    createPin: number = -1;

    constructor(sys: PinSystem) {
        this.sys = sys;
    }

    initCreation() {
        this.cancelCreation();
        const color = Math.floor(Math.random() * 0xFFFFFF);

        const display = this.sys.createElement();
        display.visib = VisibilityType.ALWAYS_VISIBLE;
        const point = display.children![0] as PointElement;
        point.color = color;
        point.visib = VisibilityType.ALWAYS_VISIBLE;
        point.scale = this.sys.res.defaultSize;

        this.createPin = this.sys.world.spawnEntity(
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
            } as FollowMouseFlag,
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
        let g = world.getComponent(id, GRAPHIC_TYPE)!;
        let loc = world.getComponent(id, POSITION_TYPE)!;
        world.despawnEntity(id);

        const cmd = SpawnCommandKind.from(world, [
            {
                type: SHARED_TYPE,
            } as SharedFlag,
            {
                type: SERIALIZED_TYPE,
            } as SerializedFlag,
            {
                type: POSITION_TYPE,
                x: loc.x,
                y: loc.y,
            } as PositionComponent,
            {
                type: PIN_TYPE,
                color: (g.display.children![0] as PointElement).color,
            } as PinComponent,
            {
                type: PARENT_LAYER_TYPE,
                layer: findForeground(this.sys.world),
            } as ParentLayerComponent,
        ]);

        this.createPin = -1;
        const creationInfo = this.sys.world.getResource(CREATION_INFO_TYPE);
        if (creationInfo?.exitAfterCreation) {
            this.sys.world.editResource(TOOL_TYPE, {
                tool: ToolType.INSPECT,
            });
        } else {
            this.initCreation();
        }
        executeAndLogCommand(world, cmd);
    }


    onEnable(): void {
        this.initCreation();
    }

    onDisable(): void {
        this.cancelCreation();
    }

    onPointerUp(event: PointerUpEvent) {
        if (event.isInside) {
            this.confirmCreation();
        }
    }

    onResourceEdited(res: Resource) {
        if (res.type == PIN_TYPE && this.createPin !== -1) {
            const comp = this.sys.world.getComponent(this.createPin, GRAPHIC_TYPE)!;
            (comp.display.children![0] as PointElement).scale = (res as PinResource).defaultSize;
            this.sys.world.editComponent(this.createPin, GRAPHIC_TYPE, { display: comp.display }, undefined, false);
        }
    }

    initialize(events: SafeEventEmitter): void {
        events.on(PointerEvents.POINTER_UP, this.onPointerUp, this);
        events.on('resource_edited', this.onResourceEdited, this);
    }

    destroy(): void {
    }
}
