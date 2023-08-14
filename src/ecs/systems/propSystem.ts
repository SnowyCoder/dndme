import {System} from "../System";
import {World} from "../World";
import {DisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {SingleEcsStorage} from "../Storage";
import {
    Component,
    FOLLOW_MOUSE_TYPE,
    POSITION_TYPE,
    PositionComponent,
    TRANSFORM_TYPE,
    TransformComponent,
    FollowMouseFlag,
    SharedFlag,
    SHARED_TYPE,
    SERIALIZED_TYPE,
    SerializedFlag
} from "../component";
import {INTERACTION_TYPE, InteractionComponent, InteractionSystem, shapePoint} from "./back/InteractionSystem";
import {Assets, Spritesheet, Texture} from "pixi.js";
import {PIN_TYPE, PinComponent} from "./pinSystem";
import {
    ElementType,
    GRAPHIC_TYPE,
    GraphicComponent,
    ImageElement,
    ImageScaleMode,
    VisibilityType
} from "../../graphics";
import {TOOL_TYPE, ToolPart, ToolSystem} from "./back/ToolSystem";
import {PointerClickEvent, PointerEvents, PointerUpEvent} from "./back/pixi/pixiBoardSystem";
import {SELECTION_TYPE, SelectionSystem} from "./back/SelectionSystem";
import {ToolType} from "../tools/toolType";
import {SpawnCommandKind} from "./command/spawnCommand";
import {executeAndLogCommand} from "./command/command";
import {componentEditCommand, EditType} from "./command/componentEdit";
import {findForeground, LAYER_TYPE, LayerSystem} from "./back/LayerSystem";
import {LinkRelocationSystem, LINK_RELOCATION_TYPE} from "./back/linkRelocationSystem";
import SafeEventEmitter from "../../util/safeEventEmitter";
import { CreationInfoResource, CREATION_INFO_TYPE } from "../resource";
import { StandardToolbarOrder } from "@/phase/editMap/standardToolbarOrder";
import { ComponentInfoPanel, COMPONENT_INFO_PANEL_TYPE } from "./back/SelectionUiSystem";

import EcsProp from "@/ui/ecs/EcsProp.vue";
import EcsPropTeleport from "@/ui/ecs/EcsPropTeleport.vue";


export const PROP_TYPE = 'prop';
export type PROP_TYPE = typeof PROP_TYPE;
export interface PropComponent extends Component {
    type: PROP_TYPE;
    propType: string;
}

export interface PropType {
    id: string,
    name: string,
    texture: Texture,
}

export const PROP_TELEPORT_TYPE = 'prop_teleport';
export type PROP_TELEPORT_TYPE = typeof PROP_TELEPORT_TYPE;
export interface PropTeleport extends Component {
    type: PROP_TELEPORT_TYPE;
    targetProp: number;
}

export class PropSystem implements System {
    readonly name = PROP_TYPE;
    readonly dependencies = [GRAPHIC_TYPE, INTERACTION_TYPE, SELECTION_TYPE, LAYER_TYPE];
    readonly optionalDependencies = [LINK_RELOCATION_TYPE];
    readonly components?: [PropComponent, PropTeleport];

    readonly world: World;
    readonly interactionSys: InteractionSystem;
    readonly selectionSys: SelectionSystem;
    readonly layerSys: LayerSystem;

    readonly storage = new SingleEcsStorage<PropComponent>(PROP_TYPE, true, true);
    readonly teleportStorage = new SingleEcsStorage<PropTeleport>(PROP_TELEPORT_TYPE, true, true);

    propTypes: Map<string, PropType>;
    defaultPropType: string = "ladder_down";


    constructor(world: World) {
        this.world = world;

        if (world.isMaster) {
            const toolSys = world.requireSystem(TOOL_TYPE);
            toolSys.addToolPart(new CreatePropToolPart(this));
            toolSys.addCreationTool({
                name: ToolType.CREATE_PROP,
                parts: ['space_pan', ToolType.CREATE_PROP],
                toolbarEntry: {
                    icon: 'fas fa-couch',
                    title: 'Add prop',
                    priority: StandardToolbarOrder.CREATE_PROP,
                },
            });
            toolSys.addToolPart(new PropTeleportLinkToolPart(this));
            toolSys.addTool(ToolType.PROP_TELEPORT_LINK, {
                parts: ['space_pan', ToolType.PROP_TELEPORT_LINK],
            });
        }
        world.events.on('populate', () => {
            this.world.spawnEntity({
                type: COMPONENT_INFO_PANEL_TYPE,
                entity: -1,
                component: PROP_TYPE,
                name: 'Prop',
                panel: EcsProp,
                panelPriority: 100,
            } as ComponentInfoPanel);
            this.world.spawnEntity({
                type: COMPONENT_INFO_PANEL_TYPE,
                entity: -1,
                component: PROP_TELEPORT_TYPE,
                name: 'Teleporter',
                panel: EcsPropTeleport,
                panelPriority: 50,
                addEntry: {
                    whitelist: [PROP_TYPE],
                    blacklist: [PROP_TELEPORT_TYPE],
                    component(entity: number) {
                        return [{
                            type: PROP_TELEPORT_TYPE,
                            entity,
                            targetProp: -1,
                        } as PropTeleport]
                    },
                }
            } as ComponentInfoPanel);
        });

        let linkReloc = this.world.getSystem(LINK_RELOCATION_TYPE);
        if (linkReloc !== undefined) {
            linkReloc.addLink(PROP_TELEPORT_TYPE, 'targetProp');
        }

        this.interactionSys = world.requireSystem(INTERACTION_TYPE);
        this.selectionSys = world.requireSystem(SELECTION_TYPE);
        this.layerSys = world.requireSystem(LAYER_TYPE);

        this.propTypes = new Map<string, PropType>();

        this.loadPropTypes();

        world.addStorage(this.storage);
        world.addStorage(this.teleportStorage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('prop_use', this.onPropUse, this);
    }

    registerPropType(propType: PropType): void {
        this.propTypes.set(propType.id, propType);
    }

    loadPropTypes(): void {
        const atlas = Assets.get<Spritesheet>('props') as Spritesheet;
        const props = [
            {
                id: 'ladder_up',
                name: 'Ladder Up',
                texture: atlas.textures['ladder_up.png'],
            } as PropType,
            {
                id: 'ladder_down',
                name: 'Ladder Down',
                texture: atlas.textures['ladder_down.png'],
            } as PropType,
        ];
        for (let prop of props) this.registerPropType(prop);
    }

    private getPropType(p: PropComponent): PropType {
        let pType = this.propTypes.get(p.propType);
        if (pType === undefined) {
            console.warn(`Cannot find prop type: ${p.propType}`);
            pType = this.propTypes.get(this.defaultPropType);

            if (pType === undefined) {
                throw new Error("Default prop type is invalid!");
            }
        }
        return pType;
    }

    private onComponentAdd(c: Component): void {
        if (c.type !== 'prop') return;
        let prop = c as PropComponent;
        let propType = this.getPropType(prop);

        this.world.addComponent(c.entity, {
            type: GRAPHIC_TYPE,
            entity: -1,
            interactive: true,
            display: {
                type: ElementType.IMAGE,
                ignore: false,
                priority: DisplayPrecedence.PROP,
                scale: ImageScaleMode.GRID,
                visib: VisibilityType.REMEMBER,
                texture: {
                    type: 'raw',
                    value: propType.texture,
                },
                anchor: { x: 0.5, y: 0.5 },
                tint: 0xFFFFFF,
            } as ImageElement,
        } as GraphicComponent);
    }

    private onComponentEdited(c: Component, changed: any): void {
        if (c.type === PROP_TYPE) {
            let prop = c as PropComponent;

            let pType = this.getPropType(prop);
            let display = (this.world.getComponent(c.entity, GRAPHIC_TYPE)!).display as ImageElement;
            (display.texture as any).value = pType.texture;
            this.world.editComponent(c.entity, GRAPHIC_TYPE, { display }, undefined, false);
        }
    }

    private onComponentRemove(c: Component): void {
        if (c.type === 'prop') {
            let tp = this.teleportStorage.getComponent(c.entity);
            if (tp !== undefined) this.world.removeComponent(tp);
        }
    }

    private onPropUse(entity: number): void {
        let prop = this.storage.getComponent(entity);
        let teleport = this.teleportStorage.getComponent(entity);
        if (prop === undefined || teleport === undefined) return;
        let target = this.storage.getComponent(teleport.entity);
        if (target === undefined) {
            console.warn("Unlinked teleporter!");
            return;
        }

        let positions = this.world.getStorage(POSITION_TYPE);
        let posFrom = positions.getComponent(entity)!;
        let posTo = positions.getComponent(teleport.targetProp)!;
        let diffX = posTo.x - posFrom.x;
        let diffY = posTo.y - posFrom.y;

        let shape = (this.world.getComponent(entity, INTERACTION_TYPE)!).shape;
        let pinStorage = this.world.getStorage(PIN_TYPE);

        let foreground = findForeground(this.world);
        let query = this.interactionSys.query(shape, x => {
            return pinStorage.getComponent(x.entity) !== undefined &&
                this.layerSys.getEntityLayer(x.entity).entity == foreground;
        });


        let edit = [] as EditType[];
        for (let q of query) {
            let pos = positions.getComponent(q.entity)!;
            edit.push({
                entity: q.entity,
                type: pos.type,
                changes: {
                    x: pos.x + diffX,
                    y: pos.y + diffY,
                }
            });
        }
        let cmd = componentEditCommand(undefined, edit);
        executeAndLogCommand(this.world, cmd);
    }

    enable() {
    }

    destroy(): void {
    }
}


export class CreatePropToolPart implements ToolPart {
    readonly name = ToolType.CREATE_PROP;
    private readonly sys: PropSystem;

    // Entity of the prop to be created
    createProp: number = -1;
    createPropType?: string;

    constructor(sys: PropSystem) {
        this.sys = sys;
    }

    initCreation() {
        this.cancelCreation();

        this.createPropType = this.sys.defaultPropType;
        let propType = this.sys.propTypes.get(this.createPropType);
        if (propType === undefined) throw new Error('Illegal prop type: ' + this.createPropType);

        this.createProp = this.sys.world.spawnEntity(
            {
                type: POSITION_TYPE,
                x: Number.NEGATIVE_INFINITY,
                y: Number.NEGATIVE_INFINITY,
            } as PositionComponent,
            {
                type: TRANSFORM_TYPE,
                rotation: 0,
                scale: 1,
            } as TransformComponent,
            {
                type: GRAPHIC_TYPE,
                entity: -1,
                interactive: false,
                display: {
                    type: ElementType.IMAGE,
                    ignore: false,
                    priority: DisplayPrecedence.PROP,
                    scale: ImageScaleMode.GRID,
                    visib: VisibilityType.ALWAYS_VISIBLE,
                    texture: {
                        type: 'raw',
                        value: propType.texture,
                    },
                    anchor: {x: 0.5, y: 0.5},
                    tint: 0xFFFFFF,
                } as ImageElement,
            } as GraphicComponent,
            {
                type: FOLLOW_MOUSE_TYPE,
            } as FollowMouseFlag,
        );
    }

    cancelCreation() {
        if (this.createProp !== -1) {
            this.sys.world.despawnEntity(this.createProp);
            this.createProp = -1;
        }
    }

    confirmCreation() {
        if (this.createProp === undefined) return;

        const id = this.createProp;
        const world = this.sys.world;
        let loc = world.getComponent(id, POSITION_TYPE)!;
        let tran = world.getComponent(id, TRANSFORM_TYPE)!;
        world.despawnEntity(id);
        this.createProp = -1;

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
                type: TRANSFORM_TYPE,
                scale: tran.scale,
                rotation: tran.rotation,
            } as TransformComponent,
            {
                type: PROP_TYPE,
                propType: this.createPropType,
            } as PropComponent,
        ]);

        const creationInfo = this.sys.world.getResource(CREATION_INFO_TYPE);

        if (creationInfo?.exitAfterCreation ?? true) {
            this.sys.world.editResource(TOOL_TYPE, {
                tool: ToolType.INSPECT,
            });
        } else {
            this.initCreation();
        }
        executeAndLogCommand(world, cmd);
    }

    onPointerUp(event: PointerUpEvent) {
        if (this.createProp === -1) return;
        if (event.isInside) {
            this.confirmCreation();
        }
    }


    onEnable(): void {
        this.initCreation();
    }

    onDisable(): void {
        this.cancelCreation();
    }

    initialize(events: SafeEventEmitter): void {
        events.on(PointerEvents.POINTER_UP, this.onPointerUp, this)
    }

    destroy(): void {
    }
}

export class PropTeleportLinkToolPart implements ToolPart {
    readonly name = ToolType.PROP_TELEPORT_LINK;
    private readonly sys: PropSystem;

    currentTarget: number = -1;

    constructor(sys: PropSystem) {
        this.sys = sys;
    }

    private onPropTeleportLink(entity: number): void {
        let tp = this.sys.teleportStorage.getComponent(entity);
        if (tp === undefined) {
            console.warn("Called teleport link on a non-teleport prop, ignoring");
            return;
        }
        this.currentTarget = entity;

        this.sys.world.editResource(TOOL_TYPE, {
            tool: ToolType.PROP_TELEPORT_LINK,
        })
    }

    linkTo(target: number): void {
        if (this.sys.storage.getComponent(target) === undefined) {
            console.warn("Trying to link teleport to a non-prop, ignoring");
            return;
        }
        let tper = this.sys.teleportStorage.getComponent(this.currentTarget);
        if (tper === undefined) {
            console.warn("Teleporter has been destroyed");
            return;
        }
        // If the target is itself then delete the link
        let edit = [];
        edit.push({
            entity: tper.entity,
            type: tper.type,
            changes: {
                targetProp: target === this.currentTarget ? -1 : target
            }
        });
        executeAndLogCommand(this.sys.world, componentEditCommand(undefined, edit));
        this.currentTarget = -1;
    }

    linkCancel(): void {
        this.currentTarget = -1;
    }

    onPointerClick(event: PointerClickEvent) {
        let point = event.boardPos;

        let interactionSystem = this.sys.world.requireSystem(INTERACTION_TYPE);
        let query = interactionSystem.query(shapePoint(point), x => {
            return this.sys.world.getComponent(x.entity, 'prop') !== undefined;
        });
        for (let found of query) {
            let oldTper = this.currentTarget;
            this.linkTo(found.entity);
            this.sys.selectionSys.setOnlyEntity(oldTper);
            this.sys.world.editResource(TOOL_TYPE, {
                tool: ToolType.INSPECT,
            })
            return;
        }
    }

    onEnable(): void {
        document.body.style.cursor = 'crosshair';
    }

    onDisable(): void {
        this.linkCancel();
        document.body.style.cursor = 'auto';
    }

    initialize(events: SafeEventEmitter): void {
        this.sys.world.events.on('prop_teleport_link', this.onPropTeleportLink, this);
        events.on(PointerEvents.POINTER_CLICK, this.onPointerClick, this);
    }

    destroy() {
    }
}
