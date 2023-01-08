import {Component, POSITION_TYPE, PositionComponent} from "../component";
import {System} from "../system";
import {World} from "../world";
import {CUSTOM_BLEND_MODES, DESTROY_ALL} from "../../util/pixi";
import {SingleEcsStorage} from "../storage";
import {IPoint} from "../../geometry/point";
import {GridResource, Resource} from "../resource";
import {VISIBILITY_TYPE, VisibilityComponent, VISIBILITY_DETAILS_TYPE, VisibilityDetailsComponent} from "./back/visibilitySystem";
import {PLAYER_TYPE, PlayerComponent} from "./playerSystem";
import {BLEND_MODES, Container, Geometry, Mesh, Shader, Sprite, utils, Buffer} from "pixi.js";
import {PixiBoardSystem, PIXI_BOARD_TYPE} from "./back/pixi/pixiBoardSystem";
import {TOOL_TYPE, ToolSystem} from "./back/toolSystem";
import {ToolType} from "../tools/toolType";
import {GRID_TYPE} from "./gridSystem";
import {STANDARD_GRID_OPTIONS} from "../../game/grid";
import {LayerOrder} from "../../phase/editMap/layerOrder";

import { Group, Layer } from "@pixi/layers";
import { StandardToolbarOrder } from "@/phase/editMap/standardToolbarOrder";
import { ComponentInfoPanel, COMPONENT_INFO_PANEL_TYPE } from "./back/selectionUiSystem";

import LightSettingsEditComponent from "@/ui/edit/LightSettingsEdit.vue";
import EcsLight from "@/ui/ecs/EcsLight.vue";
import { PIN_TYPE } from "./pinSystem";
import { DepthFunc, VisibilityPolygonElement } from "./back/pixi/visibility/VisibilityPolygonElement";


export const DEFAULT_BACKGROUND = 0x6e472c;

export const DEFAULT_LIGHT_SETTINGS = {
    ambientLight: 0x555555,
    background: DEFAULT_BACKGROUND,
    needsLight: true,
};

export const LIGHT_TYPE = 'light';
export type LIGHT_TYPE = 'light';
export interface LightComponent extends Component {
    type: LIGHT_TYPE;
    color: number;
    range: number;

    _lightDisplay?: VisibilityPolygonElement;
    _visIndex: number;
}

export interface CustomPlayerComponent extends PlayerComponent {
    _lightVisionDisplay?: VisibilityPolygonElement;
}

export const LIGHT_SETTINGS_TYPE = 'light_settings';
export type LIGHT_SETTINGS_TYPE = 'light_settings';
export interface LightSettings extends Resource {
    type: LIGHT_SETTINGS_TYPE,
    ambientLight: number,
    needsLight: boolean,
    background: number,
    _save: true,
    _sync: true,
}

type VisionType = 'dm' | 'rp';

export const LOCAL_LIGHT_SETTINGS_TYPE = 'local_light_settings';
export type LOCAL_LIGHT_SETTINGS_TYPE = 'local_light_settings';
export interface LocalLightSettings extends Resource {
    type: LOCAL_LIGHT_SETTINGS_TYPE,
    visionType: VisionType,
    _save: true,
    _sync: false,
}


/**
 * How is light rendered?
 * There are three logical passes on a separate framebuffer.
 * Then this framebuffer is pasted onto the real screen.
 * 1. Clear the RGB channels with the ambient light. A=0
 * 2. Draw the mesh of every player with A=1
 * 3. Draw the lights only where A=1
 * 4. Draw the framebuffer on the screen ignoring the ALPHA channel (using a custom blend mode)
 *
 * If we're in master mode skip pass. 2 and clear the buffer with A=1
 *
 * Why is this usage of the alpha channel used?
 * We need to render light only where visible, so in the RP-view the players vision polygons should be used as a
 * mask for the light (you can't see a light that no player sees). So when the RP-view is enabled the framebuffer is
 * cleared with alpha=0 and the player's vision will fill in the alpha (they should be rendered BEFORE the lights).
 * When the DM-view is enabled the framebuffer is rendered with alpha=1 and the player's view is not drawn.
 */
export class LightSystem implements System {
    readonly name = LIGHT_TYPE;
    readonly dependencies = [PIXI_BOARD_TYPE, PLAYER_TYPE];

    readonly world: World;
    private boardSys: PixiBoardSystem;

    storage = new SingleEcsStorage<LightComponent>(LIGHT_TYPE);

    lightLayer: Layer;
    playerContainer: Container;
    lightContainer: Container;

    lightSettings: LightSettings;
    localLightSettings: LocalLightSettings;

    private gridSize: number;

    constructor(world: World) {
        this.world = world;
        this.boardSys = world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;

        this.lightLayer = new Layer(new Group(LayerOrder.LIGHT, false));
        this.playerContainer = new Container();
        this.lightContainer = new Container();

        if (world.isMaster) {
            let toolSys = world.systems.get(TOOL_TYPE) as ToolSystem;
            toolSys.addToolAsCopy(ToolType.LIGHT, ToolType.INSPECT, {
                sideBar: LightSettingsEditComponent,
                sideBarProps: {},
                toolbarEntry: {
                    icon: 'fas fa-lightbulb',
                    title: 'Light',
                    priority: StandardToolbarOrder.LIGHT_EDIT,
                }
            });
        }

        world.addStorage(this.storage);
        this.lightSettings = Object.assign({
            type: LIGHT_SETTINGS_TYPE,
            _save: true, _sync: true,
        }, DEFAULT_LIGHT_SETTINGS) as LightSettings;
        world.addResource(this.lightSettings);
        this.localLightSettings = {
            type: LOCAL_LIGHT_SETTINGS_TYPE,
            visionType: this.world.isMaster ? 'dm' : 'rp',
            _save: true, _sync: false,
        } as LocalLightSettings;
        world.addResource(this.localLightSettings);

        this.gridSize = (this.world.getResource(GRID_TYPE) as GridResource ?? STANDARD_GRID_OPTIONS).size;

        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_remove', this.onComponentRemove, this);
        world.events.on('resource_edited', this.onResourceEdited, this);

        world.events.on('populate', () => {
            this.world.spawnEntity({
                type: COMPONENT_INFO_PANEL_TYPE,
                entity: -1,
                component: LIGHT_TYPE,
                name: 'Light',
                removable: true,
                panel: EcsLight,
                addEntry: {
                    whitelist: [PIN_TYPE],
                    blacklist: [LIGHT_TYPE],
                    component: (entity: number) => {
                        return [{
                            entity,
                            type: LIGHT_TYPE,
                            color: 0xFFFFFF,
                            range: 2,
                        } as LightComponent];
                    },
                }
            } as ComponentInfoPanel);
        });
    }

    createLightVisMesh(): VisibilityPolygonElement {
        const mesh = new VisibilityPolygonElement();
        mesh.program = 'normal';
        mesh.blendMode = CUSTOM_BLEND_MODES.ADD_WHERE_ALPHA_1 as any as BLEND_MODES;

        this.lightContainer.addChild(mesh);

        return mesh;
    }

    createPlayerVisMesh(): VisibilityPolygonElement {
        const mesh = new VisibilityPolygonElement();
        mesh.program = 'player';
        mesh.blendMode = BLEND_MODES.ADD;

        this.playerContainer.addChild(mesh);

        return mesh;
    }

    updateVisPolygon(entity: number, target: VisibilityPolygonElement | undefined, color: number, visId: number): void {
        let pos = this.world.getComponent(entity, POSITION_TYPE) as PositionComponent;
        if (pos === undefined || target === undefined) return;

        const vis = this.world.getComponent(entity, VISIBILITY_TYPE, visId) as VisibilityComponent;
        if (vis === undefined) {
            target.visible = false;
            return;
        }

        const visDet = this.world.getComponent(entity, VISIBILITY_DETAILS_TYPE) as VisibilityDetailsComponent;

        if (visDet?.polygon === undefined) {
            target.visible = false;
        } else {
            let range = vis.range * this.gridSize;
            target.visible = true;
            target.position.copyFrom(pos);
            target.polygon = visDet.polygon;
            target.radius = range;
            target.tint = color;
        }
    }

    updateLightVisPolygon(light: LightComponent): void {
        this.updateVisPolygon(light.entity, light._lightDisplay, light.color, light._visIndex);
    }

    updatePlayerVisPolygon(player: CustomPlayerComponent): void {
        this.updateVisPolygon(player.entity, player._lightVisionDisplay, 0, player._visIndex);
    }

    private onComponentAdd(comp: Component): void {
        if (comp.type === LIGHT_TYPE) {
            let light = comp as LightComponent;
            light._lightDisplay = this.createLightVisMesh();

            let vis = {
                type: VISIBILITY_TYPE,
                range: light.range,
                trackWalls: true,
                requester: LIGHT_TYPE,
            } as VisibilityComponent;
            this.world.addComponent(comp.entity, vis);
            light._visIndex = vis.multiId;
            this.updateLightVisPolygon(light);
        } else if (comp.type === PLAYER_TYPE) {
            let player = comp as CustomPlayerComponent;
            if (player._lightVisionDisplay === undefined) {
                player._lightVisionDisplay = this.createPlayerVisMesh();
            }
            this.updatePlayerVisPolygon(player);
        }
    }

    private onComponentEdited(comp: Component, changes: any): void {
        if (comp.type === LIGHT_TYPE) {
            let c = comp as LightComponent;
            if ('range' in changes) {
                this.world.editComponent(c.entity, VISIBILITY_TYPE, {
                    range: c.range
                }, c._visIndex);
            } else {
                let vis = this.world.getComponent(c.entity, VISIBILITY_TYPE, c._visIndex) as VisibilityComponent;
                let visDet = this.world.getComponent(c.entity, VISIBILITY_DETAILS_TYPE, c._visIndex) as VisibilityDetailsComponent;
                if (visDet.polygon !== undefined) {
                    c._lightDisplay!.radius = vis.range * this.gridSize;
                }
            }
        } else if (comp.type === VISIBILITY_DETAILS_TYPE) {
            let vis = comp as VisibilityDetailsComponent;
            if (!('polygon' in changes)) return;
            let light = this.storage.getComponent(vis.entity);
            if (light !== undefined)  {
                this.updateLightVisPolygon(light);
            }

            let player = this.world.getComponent(vis.entity, PLAYER_TYPE) as CustomPlayerComponent;
            if (player !== undefined) {
                this.updatePlayerVisPolygon(player);
            }
        }
    }

    private onResourceEdited(comp: Resource, changed: any) {
        if (comp.type === GRID_TYPE) {
            if (!('size' in changed)) return;
            let grid = comp as GridResource;
            this.gridSize = grid.size;

            // We don't really care, the visibility polygons will change on their own
        } else if (comp.type === LIGHT_SETTINGS_TYPE || comp.type === LOCAL_LIGHT_SETTINGS_TYPE) {
            let arr = [0.0, 0.0, 0.0, 0.0];
            if (this.localLightSettings.visionType === 'dm') arr[3] = 1.0;
            utils.hex2rgb(this.lightSettings.ambientLight, arr);
            this.lightLayer.clearColor = arr;

            this.playerContainer.visible = this.localLightSettings.visionType !== 'dm';

            this.boardSys.renderer.background.color = this.lightSettings.background;
            this.boardSys.renderer.background.alpha = 1;
        }
    }


    private onComponentRemove(comp: Component) {
        if (comp.type === LIGHT_TYPE) {
            let light = comp as LightComponent;
            light._lightDisplay?.destroy(DESTROY_ALL);
            light._lightDisplay = undefined;

            let vis = this.world.getComponent(comp.entity, VISIBILITY_TYPE, light._visIndex);
            if (vis !== undefined) {
                this.world.removeComponent(vis);
            } else {
                console.warn("No light visibility found on removal");
            }
        } else if (comp.type === PLAYER_TYPE) {
            let player = comp as CustomPlayerComponent;
            player._lightVisionDisplay?.destroy(DESTROY_ALL);
            player._lightVisionDisplay = undefined;
        }
    }

    enable() {
        this.lightLayer.useRenderTexture = true;
        this.lightLayer.interactive = false;
        this.lightLayer.interactiveChildren = false;

        this.playerContainer.interactive = false;
        this.playerContainer.interactiveChildren = false;
        this.playerContainer.parentLayer = this.lightLayer;

        this.lightContainer.interactive = false;
        this.lightContainer.interactiveChildren = false;
        this.lightContainer.parentLayer = this.lightLayer;

        this.onResourceEdited(this.lightSettings, {});// Update the clearColor

        let lightingSprite = new Sprite(this.lightLayer.getRenderTexture());
        lightingSprite.zIndex = LayerOrder.LIGHT;
        lightingSprite.interactive = false;
        lightingSprite.interactiveChildren = false;
        lightingSprite.blendMode = CUSTOM_BLEND_MODES.MULTIPLY_COLOR_ONLY as any;

        let board = this.world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;

        board.board.addChild(this.playerContainer, this.lightContainer, this.lightLayer);
        this.boardSys.root.addChild(lightingSprite);
    }

    destroy(): void {
        this.lightContainer.destroy(DESTROY_ALL);
        this.playerContainer.destroy(DESTROY_ALL);
        this.lightLayer.destroy(DESTROY_ALL);
    }
}
