import PIXI from "../../PIXI";
import {System} from "../system";
import {FrozenEntity, World} from "../world";
import {DisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {SingleEcsStorage} from "../storage";
import {
    Component,
    FOLLOW_MOUSE_TYPE,
    FollowMouseComponent,
    HOST_HIDDEN_TYPE,
    HostHiddenComponent,
    POSITION_TYPE,
    PositionComponent,
    TRANSFORM_TYPE,
    TransformComponent
} from "../component";
import {INTERACTION_TYPE, InteractionComponent, InteractionSystem, shapePoint} from "./back/interactionSystem";
import {Texture} from "pixi.js";
import {PinComponent} from "./pinSystem";
import {
    ElementType,
    GRAPHIC_TYPE,
    GraphicComponent,
    ImageElement,
    ImageScaleMode,
    VisibilityType
} from "../../graphics";
import {TOOL_TYPE, ToolDriver, ToolSystem} from "./back/toolSystem";
import {PointerClickEvent} from "./back/pixiBoardSystem";
import {getMapPointFromMouseInteraction} from "../tools/utils";
import {SELECTION_TYPE, SelectionSystem} from "./back/selectionSystem";
import {Tool} from "../tools/toolType";
import {SpawnCommand} from "./command/spawnCommand";
import {executeAndLogCommand} from "./command/command";
import {componentEditCommand, EditType} from "./command/componentEdit";
import {findForeground, LAYER_TYPE, LayerSystem} from "./back/layerSystem";


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
            const toolSys = world.systems.get(TOOL_TYPE) as ToolSystem;
            toolSys.addTool(new CreatePropToolDriver(this));
            toolSys.addTool(new PropTeleportLinkToolDriver(this));
        }

        this.interactionSys = world.systems.get(INTERACTION_TYPE) as InteractionSystem;
        this.selectionSys = world.systems.get(SELECTION_TYPE) as SelectionSystem;
        this.layerSys = world.systems.get(LAYER_TYPE) as LayerSystem;

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
        const atlas = PIXI.Loader.shared.resources["props"].spritesheet!;
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
                throw "Default prop type is invalid!";
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
                texture: propType.texture,
                sharedTexture: true,// DONT DELETE MY TEXTURE
                anchor: { x: 0.5, y: 0.5 },
                tint: 0xFFFFFF,
            } as ImageElement,
        } as GraphicComponent);
    }

    private onComponentEdited(c: Component, changed: any): void {
        if (c.type === PROP_TYPE) {
            let prop = c as PropComponent;

            let pType = this.getPropType(prop);
            let display = (this.world.getComponent(c.entity, GRAPHIC_TYPE) as GraphicComponent).display as ImageElement;
            display.texture = pType.texture;
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

        let positions = this.world.storages.get(POSITION_TYPE) as SingleEcsStorage<PositionComponent>;
        let posFrom = positions.getComponent(entity)!;
        let posTo = positions.getComponent(teleport.targetProp)!;
        let diffX = posTo.x - posFrom.x;
        let diffY = posTo.y - posFrom.y;

        let shape = (this.world.getComponent(entity, INTERACTION_TYPE) as InteractionComponent).shape;
        let pinStorage = this.world.storages.get('pin') as SingleEcsStorage<PinComponent>;

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


export class CreatePropToolDriver implements ToolDriver {
    readonly name = Tool.CREATE_PROP;
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
        if (propType === undefined) throw 'Illegal prop type: ' + this.createPropType;

        this.createProp = this.sys.world.spawnEntity(
            {
                type: HOST_HIDDEN_TYPE,
            } as HostHiddenComponent,
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
                    texture: propType.texture,
                    sharedTexture: true,// DONT DELETE MY TEXTURE
                    anchor: {x: 0.5, y: 0.5},
                    tint: 0xFFFFFF,
                } as ImageElement,
            } as GraphicComponent,
            {
                type: FOLLOW_MOUSE_TYPE,
            } as FollowMouseComponent,
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
        let loc = world.getComponent(id, POSITION_TYPE) as PositionComponent;
        let tran = world.getComponent(id, TRANSFORM_TYPE) as TransformComponent;
        world.despawnEntity(id);
        this.createProp = -1;

        let frozenEntity = {
            id: world.allocateId(),
            components: [
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
            ]
        } as FrozenEntity;
        let cmd = {
            kind: 'spawn',
            entities: [frozenEntity]
        } as SpawnCommand;

        this.sys.world.editResource(TOOL_TYPE, {
            tool: Tool.INSPECT,
        });
        executeAndLogCommand(world, cmd);
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

export class PropTeleportLinkToolDriver implements ToolDriver {
    readonly name = Tool.PROP_TELEPORT_LINK;
    private readonly sys: PropSystem;

    currentTarget: number = -1;

    constructor(sys: PropSystem) {
        this.sys = sys;
    }

    initialize(): void {
        this.sys.world.events.on('prop_teleport_link', this.onPropTeleportLink, this);
    }

    destroy() {
        this.sys.world.events.off('prop_teleport_link', this.onPropTeleportLink, this);
    }

    private onPropTeleportLink(entity: number): void {
        let tp = this.sys.teleportStorage.getComponent(entity);
        if (tp === undefined) {
            console.warn("Called teleport link on a non-teleport prop, ignoring");
            return;
        }
        this.currentTarget = entity;

        this.sys.world.editResource(TOOL_TYPE, {
            tool: Tool.PROP_TELEPORT_LINK,
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

    onStart(): void {
        document.body.style.cursor = 'crosshair';
    }

    onEnd(): void {
        this.linkCancel();
        document.body.style.cursor = 'auto';
    }

    onPointerClick(event: PointerClickEvent) {
        let point = getMapPointFromMouseInteraction(this.sys.world, event);

        let interactionSystem = this.sys.world.systems.get(INTERACTION_TYPE) as InteractionSystem;
        let query = interactionSystem.query(shapePoint(point), x => {
            return this.sys.world.getComponent(x.entity, 'prop') !== undefined;
        });
        for (let found of query) {
            let oldTper = this.currentTarget;
            this.linkTo(found.entity);
            this.sys.selectionSys.setOnlyEntity(oldTper);
            this.sys.world.editResource(TOOL_TYPE, {
                tool: Tool.INSPECT,
            })
            return;
        }
    }
}
