import PIXI from "../../PIXI";
import {System} from "../system";
import {World} from "../ecs";
import {EditMapPhase, Tool} from "../../phase/editMap/editMapPhase";
import {DESTROY_ALL, DESTROY_MIN} from "../../util/pixi";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {SingleEcsStorage} from "../storage";
import {Component, PositionComponent, TransformComponent} from "../component";
import {app} from "../../index";
import {TextSystem} from "./textSystem";
import {InteractionComponent, ObbShape, Shape, shapeAabb, shapeObb, shapePoint} from "./interactionSystem";
import {PlayerVisibleComponent} from "./playerSystem";
import {GridResource, Resource} from "../resource";
import {LocalLightSettings} from "./lightSystem";
import {Sprite, Texture, Transform} from "pixi.js";
import {Aabb} from "../../geometry/aabb";
import {Obb} from "../../geometry/obb";
import {PinComponent} from "./pinSystem";
import {GridOptions, STANDARD_GRID_OPTIONS} from "../../game/grid";

export interface PropComponent extends Component {
    type: 'prop';
    propType: string;
    known: boolean;
    _display: PIXI.Sprite;
    _selected?: boolean;
}

export interface PropType {
    id: string,
    name: string,
    texture: Texture,
    gridSize: PIXI.IPointData,
}

export interface PropTeleport extends Component {
    type: 'prop_teleport';
    targetProp: number;
}

export class PropSystem implements System {
    readonly ecs: World;
    readonly phase: EditMapPhase;

    readonly storage = new SingleEcsStorage<PropComponent>('prop', true, true);
    readonly teleportStorage = new SingleEcsStorage<PropTeleport>('prop_teleport', true, true);

    display: PIXI.Container;
    displayLayer: PIXI.display.Layer;

    // Sprite of the pin to be created
    createProp?: PIXI.Sprite;
    createPropType?: string;
    useVisibility: boolean;

    currentLinkTarget?: number;

    propTypes: Map<string, PropType>;
    defaultPropType: string = "ladder_down";


    constructor(world: World, phase: EditMapPhase) {
        this.ecs = world;
        this.phase = phase;

        this.useVisibility = !this.ecs.isMaster;
        this.propTypes = new Map<string, PropType>();

        this.loadPropTypes();

        this.useVisibility = !this.ecs.isMaster;

        world.addStorage(this.storage);
        world.addStorage(this.teleportStorage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('selection_begin', this.onSelectionBegin, this);
        world.events.on('selection_end', this.onSelectionEnd, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
        world.events.on('prop_use', this.onPropUse, this);
        world.events.on('prop_teleport_link', this.onPropTeleportLink, this);
    }

    private getGridDimensions(len: number): number {
        return Math.ceil(len / STANDARD_GRID_OPTIONS.size);
    }

    registerPropType(propType: PropType): void {
        let x = this.getGridDimensions(propType.texture.width);
        let y = this.getGridDimensions(propType.texture.height);

        propType.gridSize = { x, y };

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

    private computeShape(type: PropType, pos: PositionComponent, tran: TransformComponent): ObbShape {
        let grid = this.ecs.getResource('grid') as GridResource;
        let hw = type.gridSize.x * grid.size / 2;
        let hh = type.gridSize.y * grid.size / 2;
        let aabb = new Aabb(
            pos.x - hw, pos.y - hh,
            pos.x + hw, pos.y + hh,
        );
        return shapeObb(Obb.rotateAabb(aabb, tran.rotation));
    }

    private createSprite(): PIXI.Sprite {
        let sprite = new Sprite();
        sprite.anchor.set(0.5);
        sprite.interactive = false;
        sprite.interactiveChildren = false;
        this.display.addChild(sprite);
        return sprite;
    }

    private onComponentAdd(c: Component): void {
        if (c.type !== 'prop') return;
        let prop = c as PropComponent;

        if (prop._display === undefined) {
            prop._display = this.createSprite();
            this.redrawComponent(prop, undefined, undefined);
        }

        let pos = this.ecs.getComponent(c.entity, 'position') as PositionComponent;
        let trans = this.ecs.getComponent(c.entity, 'transform') as TransformComponent;
        let propType = this.propTypes.get(prop.propType);

        this.ecs.addComponent(c.entity, {
            type: 'interaction',
            entity: -1,
            selectPriority: EditMapDisplayPrecedence.PROP,
            shape: this.computeShape(propType, pos, trans)
        } as InteractionComponent);
        if (!prop.known) {
            this.ecs.addComponent(c.entity, {
                type: 'player_visible',
                entity: -1,
                visible: false,
            } as PlayerVisibleComponent);
        }
    }

    private onComponentEdited(c: Component, changed: any): void {
        if (c.type === 'prop') {
            let prop = c as PropComponent;
            this.redrawComponent(prop, undefined, undefined);

            if ('propType' in changed) {
                let pos = this.ecs.getComponent(c.entity, 'position') as PositionComponent;
                let tex = this.propTypes.get(prop.propType).texture;

                this.ecs.editComponent(c.entity, 'interaction', {
                    shape: shapeAabb(new Aabb(
                        pos.x, pos.y,
                        pos.x + tex.width, pos.y + tex.height
                    ))
                })
            }
        } else if (c.type === 'position') {
            let pos = c as PositionComponent;
            let prop = this.storage.getComponent(c.entity);
            if (prop !== undefined) {
                this.redrawComponent(prop, pos, undefined);
            }
        } else if (c.type === 'transform') {
            let tran = c as TransformComponent;
            let prop = this.storage.getComponent(c.entity);
            if (prop !== undefined) {
                this.redrawComponent(prop, undefined, tran);
            }
        } else if (c.type === 'player_visible') {
            let vis = c as PlayerVisibleComponent;
            if (!vis.visible) return;
            let prop = this.storage.getComponent(c.entity);
            if (prop === undefined) return;
            this.ecs.editComponent(c.entity, 'prop', { known: true });
            this.ecs.removeComponent(c);
        }
    }

    private onComponentRemove(c: Component): void {
        if (c.type === 'prop') {
            let prop = c as PropComponent;
            prop._display.destroy({
                children: true,
                texture: false,
                baseTexture: false,
            });
            let tp = this.teleportStorage.getComponent(c.entity);
            if (tp !== undefined) this.ecs.removeComponent(tp);
        }
    }

    private onSelectionBegin(c: number): void {
        let prop = this.storage.getComponent(c);
        if (prop !== undefined) {
            prop._selected = true;
            prop._display.tint = 0x7986CB;
        }
    }

    private onSelectionEnd(c: number): void {
        let prop = this.storage.getComponent(c);
        if (prop !== undefined) {
            prop._selected = false;
            prop._display.tint = 0xFFFFFF;
        }
    }

    private onResourceEdited(res: Resource, changes: any): void {
        if (res.type === 'local_light_settings') {
            let set = res as LocalLightSettings;
            if (!('visionType' in changes)) return;

            if (set.visionType === 'dm') {
                this.useVisibility = false;
                for (let c of this.storage.allComponents()) {
                    c._display.visible = true;
                }
            } else if (set.visionType === 'rp') {
                this.useVisibility = true;
                for (let c of this.storage.allComponents()) {
                    if (c.known) continue;
                    let pv = this.ecs.getComponent(c.entity, 'player_visible') as PlayerVisibleComponent;
                    c._display.visible = pv.visible;
                }
            } else {
                throw 'Unknown vision type';
            }
        } else if (res.type === 'grid') {
            if (!('width' in changes)) return;
            // You are literally satan, I hate you.

            let posSto = this.ecs.storages.get('position') as SingleEcsStorage<PositionComponent>;
            let tranSto = this.ecs.storages.get('transform') as SingleEcsStorage<TransformComponent>;

            for (let c of this.storage.allComponents()) {
                let pos = posSto.getComponent(c.entity);
                let tran = tranSto.getComponent(c.entity);
                this.ecs.editComponent(c.entity, 'interaction', {
                    shape: this.computeShape(this.propTypes.get(c.propType), pos, tran),
                });
                this.redrawComponent(c, pos, tran);
            }
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

        let positions = this.ecs.storages.get('position') as SingleEcsStorage<PositionComponent>;
        let posFrom = positions.getComponent(entity);
        let posTo = positions.getComponent(teleport.targetProp);
        let diffX = posTo.x - posFrom.x;
        let diffY = posTo.y - posFrom.y;

        let shape = (this.ecs.getComponent(entity, 'interaction') as InteractionComponent).shape;
        let pinStorage = this.ecs.storages.get('pin') as SingleEcsStorage<PinComponent>;
        let query = this.phase.interactionSystem.query(shape, x => {
            return pinStorage.getComponent(x.entity) !== undefined;
        });


        for (let q of query) {
            let pos = positions.getComponent(q.entity);
            this.ecs.editComponent(
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

    redrawComponent(prop: PropComponent, pos: PositionComponent | undefined, trans: TransformComponent | undefined) {
        if (pos === undefined) {
            pos = this.ecs.getComponent(prop.entity, 'position') as PositionComponent;
        }
        if (trans === undefined) {
            trans = this.ecs.getComponent(prop.entity, 'transform') as TransformComponent;
        }

        let d = prop._display;
        let propType = this.propTypes.get(prop.propType);
        if (propType === undefined) throw 'Illegal prop type: ' + prop.propType;

        this.redrawComponent0(d, propType, prop.known, pos, trans);
    }

    redrawComponent0(d: PIXI.Sprite, ptype: PropType, known: boolean, pos: PositionComponent, tran: TransformComponent) {
        d.visible = !this.useVisibility || known;

        d.texture = ptype.texture;
        d.position.set(pos.x, pos.y);
        d.rotation = tran.rotation;

        let grid = this.ecs.getResource('grid') as GridResource;
        d.scale.set(
            ptype.gridSize.x * grid.size * tran.scale / d.texture.width,
            ptype.gridSize.y * grid.size * tran.scale / d.texture.height
        );
    }

    initCreation() {
        this.cancelCreation();

        this.createPropType = this.defaultPropType;
        let propType = this.propTypes.get(this.createPropType);
        if (propType === undefined) throw 'Illegal prop type: ' + this.createPropType;

        this.createProp = this.createSprite();
        // TODO: find a better preview strategy (RenderSystem?)
        this.redrawComponent0(this.createProp, propType, true, {
            x: Number.NEGATIVE_INFINITY,
            y: Number.NEGATIVE_INFINITY,
        } as any, {
            scale: 1,
            rotation: 0,
        } as any);
        this.display.addChild(this.createProp);
    }

    cancelCreation() {
        if (this.createProp !== undefined) {
            this.createProp.destroy({
                children: true,
                texture: false,
                baseTexture: false,
            });
            this.createProp = undefined;
        }
    }

    redrawCreation(pos: PIXI.Point) {
        if (this.createProp !== undefined) {
            this.createProp.position.set(pos.x, pos.y);
        }
    }

    confirmCreation(pos: PIXI.Point) {
        if (this.createProp === undefined) return;

        let id = this.ecs.spawnEntity(
            {
                type: 'position',
                x: pos.x,
                y: pos.y,
            } as PositionComponent,
            {
                type: 'transform',
                rotation: 0,
                scale: 1,
            } as TransformComponent,
            {
                type: 'prop',
                propType: this.createPropType,
                _display: this.createProp,
            } as PropComponent,
        );
        this.createProp = undefined;
        this.phase.changeTool(Tool.INSPECT);
        this.phase.selection.setOnlyEntity(id);
    }

    enable() {
        this.useVisibility = this.phase.lightSystem.localLightSettings.visionType !== 'dm';

        this.displayLayer = new PIXI.display.Layer();
        this.displayLayer.zIndex = EditMapDisplayPrecedence.PROP;
        this.displayLayer.interactive = false;
        this.displayLayer.interactiveChildren = false;

        this.display = new PIXI.Container();
        this.display.zIndex = EditMapDisplayPrecedence.PROP;
        this.display.interactive = false;
        this.display.interactiveChildren = false;
        this.display.parentLayer = this.displayLayer;

        this.phase.board.addChild(this.display);
        app.stage.addChild(this.displayLayer);
    }

    destroy(): void {
        this.display.destroy(DESTROY_ALL);
        this.displayLayer.destroy(DESTROY_ALL);
    }
}