import PIXI from "../../PIXI";
import {System} from "../system";
import {World} from "../ecs";
import {EditMapPhase, Tool} from "../../phase/editMap/editMapPhase";
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
import {INTERACTION_TYPE, InteractionComponent} from "./interactionSystem";
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


export const PROP_TYPE = 'prop';
export type PROP_TYPE = 'prop';
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
export type PROP_TELEPORT_TYPE = 'prop_teleport';
export interface PropTeleport extends Component {
    type: PROP_TELEPORT_TYPE;
    targetProp: number;
}

export class PropSystem implements System {
    readonly world: World;
    readonly phase: EditMapPhase;

    readonly storage = new SingleEcsStorage<PropComponent>(PROP_TYPE, true, true);
    readonly teleportStorage = new SingleEcsStorage<PropTeleport>(PROP_TELEPORT_TYPE, true, true);

    // Sprite of the pin to be created
    createProp: number = -1;
    createPropType?: string;

    currentLinkTarget?: number;

    propTypes: Map<string, PropType>;
    defaultPropType: string = "ladder_down";


    constructor(world: World, phase: EditMapPhase) {
        this.world = world;
        this.phase = phase;

        this.propTypes = new Map<string, PropType>();

        this.loadPropTypes();

        world.addStorage(this.storage);
        world.addStorage(this.teleportStorage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('prop_use', this.onPropUse, this);
        world.events.on('prop_teleport_link', this.onPropTeleportLink, this);
    }

    registerPropType(propType: PropType): void {
        this.propTypes.set(propType.id, propType);
    }

    loadPropTypes(): void {
        const atlas = PIXI.Loader.shared.resources["props"].spritesheet;
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

    private onComponentAdd(c: Component): void {
        if (c.type !== 'prop') return;
        let prop = c as PropComponent;
        let propType = this.propTypes.get(prop.propType);

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

            let pType = this.propTypes.get(prop.propType);
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
        let posFrom = positions.getComponent(entity);
        let posTo = positions.getComponent(teleport.targetProp);
        let diffX = posTo.x - posFrom.x;
        let diffY = posTo.y - posFrom.y;

        let shape = (this.world.getComponent(entity, INTERACTION_TYPE) as InteractionComponent).shape;
        let pinStorage = this.world.storages.get('pin') as SingleEcsStorage<PinComponent>;
        let query = this.phase.interactionSystem.query(shape, x => {
            return pinStorage.getComponent(x.entity) !== undefined;
        });


        for (let q of query) {
            let pos = positions.getComponent(q.entity);
            this.world.editComponent(
                q.entity, pos.type, {
                    x: pos.x + diffX,
                    y: pos.y + diffY,
                }
            );
        }
    }

    private onPropTeleportLink(entity: number): void {
        let tp = this.teleportStorage.getComponent(entity);
        if (tp === undefined) {
            console.warn("Called teleport link on a non-teleport prop, ignoring");
            return;
        }
        this.currentLinkTarget = entity;

        this.phase.changeTool(Tool.PROP_TELEPORT_LINK);
    }

    teleportLinkTo(target: number): void {
        if (this.storage.getComponent(target) === undefined) {
            console.warn("Trying to link teleport to a non-prop, ignoring");
            return;
        }
        let tper = this.teleportStorage.getComponent(this.currentLinkTarget);
        if (tper === undefined) {
            console.warn("Teleporter has been destroyed");
            return;
        }
        tper.targetProp = target;
        this.currentLinkTarget = undefined;
    }

    teleportLinkCancel(): void {
        this.currentLinkTarget = undefined;
    }

    initCreation() {
        this.cancelCreation();

        this.createPropType = this.defaultPropType;
        let propType = this.propTypes.get(this.createPropType);
        if (propType === undefined) throw 'Illegal prop type: ' + this.createPropType;

        this.createProp = this.world.spawnEntity(
            {
                type: HOST_HIDDEN_TYPE
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
                    anchor: { x: 0.5, y: 0.5 },
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
            this.world.despawnEntity(this.createProp);
            this.createProp = -1;
        }
    }

    confirmCreation() {
        if (this.createProp === undefined) return;

        let id = this.createProp;
        this.world.removeComponentType(id, FOLLOW_MOUSE_TYPE);
        this.world.removeComponentType(id, GRAPHIC_TYPE);
        this.world.addComponent(id, {
            type: PROP_TYPE,
            propType: this.createPropType,
        } as PropComponent);
        this.world.removeComponentType(id, HOST_HIDDEN_TYPE);

        this.createProp = -1;
        this.phase.changeTool(Tool.INSPECT);
        this.phase.selection.setOnlyEntity(id);
    }

    enable() {
    }

    destroy(): void {
    }
}