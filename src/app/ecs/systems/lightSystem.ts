import {Component, POSITION_TYPE, PositionComponent} from "../component";
import {System} from "../system";
import {World} from "../world";
import {CUSTOM_BLEND_MODES, DESTROY_ALL} from "../../util/pixi";
import {SingleEcsStorage} from "../storage";
import {DisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {StupidPoint} from "../../geometry/point";
import {GridResource, Resource} from "../resource";
import PIXI from "../../PIXI";
import {app} from "../../index";
import {VISIBILITY_TYPE, VisibilityComponent} from "./back/visibilitySystem";
import * as PointLightRender from "../../game/pointLightRenderer";
import {PLAYER_TYPE, PlayerComponent} from "./playerSystem";
import {Mesh} from "pixi.js";
import {PixiBoardSystem, PIXI_BOARD_TYPE} from "./back/pixiBoardSystem";
import hex2rgb = PIXI.utils.hex2rgb;
import {TOOL_TYPE, ToolSystem} from "./back/toolSystem";
import {createEmptyDriver} from "../tools/utils";
import {Tool} from "../tools/toolType";
import {GRID_TYPE} from "./gridSystem";
import {STANDARD_GRID_OPTIONS} from "../../game/grid";

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

    _lightDisplay?: PIXI.Mesh;
}

export interface CustomPlayerComponent extends PlayerComponent {
    _lightVisionDisplay?: PIXI.Mesh;
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
 * 1. Clear the RGBA channels with the ambient light.
 * 2. Draw only in the ALPHA channel every player mesh (achieved by setting the color to 0)
 * 3. Draw the light only where the ALPHA channel is 1 (using a custom blend mode)
 * 4. Draw the framebuffer on the screen ignoring the ALPHA channel (using a custom blend mode)
 *
 * Why is this usage of the alpha channel used?
 * We need to render light only where visible, so in the RP-view the players vision polygons should be used as a
 * mask for the light (you can't see a light that no player sees). So when the RP-view is enabled the framebuffer is
 * cleared with alpha=0 and the player's vision will fill in the alpha (they should be rendered BEFORE the lights).
 * When the DM-view is enabled the framebuffer is rendered with alpha=1 and the player's view is not drawn.
 *
 * Why isn't the visibility polygon rendering batched?
 * We need uniforms in the shaders to know the distance from the light center: remember that visibility mesh is not only
 * the visibility polygon, it also calculates the distance form the center of the light (to render a proper circle).
 * So yeah, no batched uniforms in WebGL it seems. (TODO: explore more possibilities)
 */
export class LightSystem implements System {
    readonly world: World;
    readonly name = LIGHT_TYPE;
    readonly dependencies = [PIXI_BOARD_TYPE, PLAYER_TYPE];

    storage = new SingleEcsStorage<LightComponent>(LIGHT_TYPE);

    lightLayer: PIXI.display.Layer;
    playerContainer: PIXI.Container;
    lightContainer: PIXI.Container;

    lightSettings: LightSettings;
    localLightSettings: LocalLightSettings;

    private gridSize: number;

    constructor(world: World) {
        this.world = world;

        this.lightLayer = new PIXI.display.Layer();
        this.playerContainer = new PIXI.Container();
        this.lightContainer = new PIXI.Container();

        let toolSys = world.systems.get(TOOL_TYPE) as ToolSystem;
        toolSys.addTool(createEmptyDriver(Tool.LIGHT));

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
    }

    createLightVisMesh(): PIXI.Mesh {
        let mesh = PointLightRender.createMesh();

        mesh.blendMode = CUSTOM_BLEND_MODES.ADD_WHERE_ALPHA_1;
        this.lightContainer.addChild(mesh);

        return mesh;
    }

    createPlayerVisMesh(): PIXI.Mesh {
        let mesh = PointLightRender.createMesh('player');

        mesh.blendMode = PIXI.BLEND_MODES.ADD;
        this.playerContainer.addChild(mesh);

        return mesh;
    }

    updateVisMesh(mesh: PIXI.Mesh, pos: StupidPoint, poly: number[]) {
        mesh.visible = true;
        PointLightRender.updateMeshPolygons(mesh, pos, poly);
    }

    updateVisUniforms(mesh: PIXI.Mesh, center: StupidPoint, rangeSquared: number, color: number) {
        PointLightRender.updateMeshUniforms(mesh, center, rangeSquared, color);
    }

    disableVisMesh(mesh: PIXI.Mesh) {
        mesh.visible = false;
    }

    updateVisPolygon(entity: number, target: Mesh, color: number, pos?: PositionComponent, vis?: VisibilityComponent): void {
        if (pos === undefined) {
            pos = this.world.getComponent(entity, POSITION_TYPE) as PositionComponent;
            if (pos === undefined) return;
        }

        if (vis === undefined) {
            vis = this.world.getComponent(entity, VISIBILITY_TYPE) as VisibilityComponent;
            if (vis === undefined) {
                this.disableVisMesh(target);
                return;
            }
        }

        if (vis.polygon === undefined) {
            this.disableVisMesh(target);
        } else {
            let range = vis.range * this.gridSize;
            this.updateVisMesh(target, pos, vis.polygon);
            this.updateVisUniforms(target, pos, range * range, color);
        }
    }

    updateLightVisPolygon(light: LightComponent, pos?: PositionComponent, vis?: VisibilityComponent): void {
        this.updateVisPolygon(light.entity, light._lightDisplay!, light.color, pos, vis);
    }

    updatePlayerVisPolygon(player: CustomPlayerComponent, pos?: PositionComponent, vis?: VisibilityComponent): void {
        if (player._lightVisionDisplay === undefined) {
            player._lightVisionDisplay = this.createPlayerVisMesh();
        }
        this.updateVisPolygon(player.entity, player._lightVisionDisplay, 0, pos, vis);
    }

    private onComponentAdd(comp: Component): void {
        if (comp.type === LIGHT_TYPE) {
            let light = comp as LightComponent;
            light._lightDisplay = this.createLightVisMesh();

            let vis = {
                type: VISIBILITY_TYPE,
                range: light.range,
                trackWalls: true,
            } as VisibilityComponent;
            this.world.addComponent(comp.entity, vis);
            this.updateLightVisPolygon(light, undefined, vis);
        } else if (comp.type === PLAYER_TYPE) {
            let player = comp as CustomPlayerComponent;
            if (player._lightVisionDisplay === undefined) {
                player._lightVisionDisplay = this.createPlayerVisMesh();
            }

            let vis = this.world.getComponent(player.entity, VISIBILITY_TYPE) as VisibilityComponent;
            if (vis === undefined) {
                console.error("Player does not have a visibility type")
            }
            this.updatePlayerVisPolygon(player, undefined, vis);
        }
    }

    private onComponentEdited(comp: Component, changes: any): void {
        if (comp.type === LIGHT_TYPE) {
            let c = comp as LightComponent;
            if ('range' in changes) {
                this.world.editComponent(c.entity, VISIBILITY_TYPE, {
                    range: c.range
                });
            } else {
                let pos = this.world.getComponent(c.entity, POSITION_TYPE) as PositionComponent;
                let vis = this.world.getComponent(c.entity, VISIBILITY_TYPE) as VisibilityComponent;
                if (vis.polygon !== undefined) {
                    let range = vis.range * this.gridSize;
                    this.updateVisUniforms(c._lightDisplay!, pos, range * range, c.color);
                }
            }
        } else if (comp.type === VISIBILITY_TYPE) {
            let vis = comp as VisibilityComponent;
            if (!('polygon' in changes)) return;
            let light = this.storage.getComponent(vis.entity);
            if (light !== undefined)  {
                this.updateLightVisPolygon(light, undefined, vis);
            } else {
                let player = this.world.getComponent(vis.entity, PLAYER_TYPE) as CustomPlayerComponent;
                if (player !== undefined) {
                    this.updatePlayerVisPolygon(player, undefined, vis);
                }
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
            hex2rgb(this.lightSettings.ambientLight, arr);
            this.lightLayer.clearColor = arr;

            this.playerContainer.visible = this.localLightSettings.visionType !== 'dm';

            app.renderer.backgroundColor = this.lightSettings.background;
        }
    }


    private onComponentRemove(comp: Component) {
        if (comp.type === LIGHT_TYPE) {
            let light = comp as LightComponent;
            light._lightDisplay?.destroy(DESTROY_ALL);

            let vis = this.world.getComponent(comp.entity, VISIBILITY_TYPE);
            if (vis !== undefined) {
                this.world.removeComponent(vis);
            } else {
                console.warn("No light visibility found on removal");
            }
        } else if (comp.type === PLAYER_TYPE) {
            let player = comp as CustomPlayerComponent;
            player._lightVisionDisplay?.destroy(DESTROY_ALL);
        }
    }

    enable() {
        PointLightRender.setup();

        this.lightLayer.useRenderTexture = true;
        this.lightLayer.interactive = false;
        this.lightLayer.interactiveChildren = false;

        this.playerContainer.zOrder = DisplayPrecedence.LIGHT - 1;
        this.playerContainer.zIndex = DisplayPrecedence.LIGHT - 1;
        this.playerContainer.interactive = false;
        this.playerContainer.interactiveChildren = false;
        let lightSystem = this.world.systems.get(LIGHT_TYPE) as LightSystem;
        this.playerContainer.parentLayer = lightSystem.lightLayer;

        this.lightContainer.zOrder = DisplayPrecedence.LIGHT;
        this.lightContainer.zIndex = DisplayPrecedence.LIGHT;
        this.lightContainer.interactive = false;
        this.lightContainer.interactiveChildren = false;
        this.lightContainer.parentLayer = this.lightLayer

        this.onResourceEdited(this.lightSettings, {});// Update the clearColor

        let lightingSprite = new PIXI.Sprite(this.lightLayer.getRenderTexture());
        lightingSprite.blendMode = CUSTOM_BLEND_MODES.MULTIPLY_COLOR_ONLY;
        lightingSprite.zIndex = DisplayPrecedence.LIGHT;
        lightingSprite.interactive = false;
        lightingSprite.interactiveChildren = false;

        let board = this.world.systems.get(PIXI_BOARD_TYPE) as PixiBoardSystem;

        board.board.addChild(this.playerContainer, this.lightContainer, this.lightLayer);
        app.stage.addChild(lightingSprite);
    }

    destroy(): void {
        this.lightContainer.destroy(DESTROY_ALL);
        this.playerContainer.destroy(DESTROY_ALL);
        this.lightLayer.destroy(DESTROY_ALL);
        app.renderer.backgroundColor = DEFAULT_BACKGROUND;
    }
}