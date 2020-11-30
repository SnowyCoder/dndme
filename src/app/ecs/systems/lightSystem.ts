import {Component, PositionComponent} from "../component";
import {System} from "../system";
import {World} from "../ecs";
import {CUSTOM_BLEND_MODES, DESTROY_ALL} from "../../util/pixi";
import {SingleEcsStorage} from "../storage";
import {EditMapPhase} from "../../phase/editMap/editMapPhase";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {StupidPoint} from "../../geometry/point";
import {Resource} from "../resource";
import PIXI from "../../PIXI";
import {app} from "../../index";
import {VisibilityComponent} from "./visibilitySystem";
import hex2rgb = PIXI.utils.hex2rgb;
import * as PointLightRender from "../../game/pointLightRenderer";
import {PlayerComponent} from "./playerSystem";
import {Mesh} from "pixi.js";

export const DEFAULT_BACKGROUND = 0x6e472c;

export const DEFAULT_LIGHT_SETTINGS = {
    ambientLight: 0x555555,
    background: DEFAULT_BACKGROUND,
    needsLight: true,
};

export interface LightComponent extends Component {
    type: 'light';
    color: number;
    range: number;

    _lightDisplay?: PIXI.Mesh;
}

export interface CustomPlayerComponent extends PlayerComponent {
    _lightVisionDisplay?: PIXI.Mesh;
}

export interface LightSettings extends Resource {
    type: 'light_settings',
    ambientLight: number,
    needsLight: boolean,
    background: number,
    _save: true,
    _sync: true,
}

type VisionType = 'dm' | 'rp';

export interface LocalLightSettings extends Resource {
    type: 'local_light_settings',
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
    readonly ecs: World;
    storage = new SingleEcsStorage<LightComponent>('light');
    phase: EditMapPhase;

    playerContainer: PIXI.Container;
    lightContainer: PIXI.Container;
    lightLayer: PIXI.display.Layer;

    lightSettings: LightSettings;
    localLightSettings: LocalLightSettings;

    constructor(ecs: World, phase: EditMapPhase) {
        this.ecs = ecs;
        this.phase = phase;

        ecs.addStorage(this.storage);
        this.lightSettings = Object.assign({
            type: 'light_settings',
            _save: true, _sync: true,
        }, DEFAULT_LIGHT_SETTINGS) as LightSettings;
        ecs.addResource(this.lightSettings);
        this.localLightSettings = {
            type: 'local_light_settings',
            visionType: this.ecs.isMaster ? 'dm' : 'rp',
            _save: true, _sync: false,
        } as LocalLightSettings;
        ecs.addResource(this.localLightSettings);

        ecs.events.on('component_add', this.onComponentAdd, this);
        ecs.events.on('component_edited', this.onComponentEdited, this);
        ecs.events.on('component_remove', this.onComponentRemove, this);
        ecs.events.on('resource_edited', this.onResourceEdited, this);
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
            pos = this.ecs.getComponent(entity, "position") as PositionComponent;
            if (pos === undefined) return;
        }

        if (vis === undefined) {
            vis = this.ecs.getComponent(entity, "visibility") as VisibilityComponent;
            if (vis === undefined) {
                this.disableVisMesh(target);
                return;
            }
        }

        if (vis.polygon === undefined) {
            this.disableVisMesh(target);
        } else {
            let range = vis.range * 50;
            this.updateVisMesh(target, pos, vis.polygon);
            this.updateVisUniforms(target, pos, range * range, color);
        }
    }

    updateLightVisPolygon(light: LightComponent, pos?: PositionComponent, vis?: VisibilityComponent): void {
        this.updateVisPolygon(light.entity, light._lightDisplay, light.color, pos, vis);
    }

    updatePlayerVisPolygon(player: CustomPlayerComponent, pos?: PositionComponent, vis?: VisibilityComponent): void {
        this.updateVisPolygon(player.entity, player._lightVisionDisplay, 0, pos, vis);
    }

    private onComponentAdd(comp: Component): void {
        if (comp.type === 'light') {
            let light = comp as LightComponent;
            light._lightDisplay = this.createLightVisMesh();

            let vis = this.ecs.getComponent(light.entity, 'visibility') as VisibilityComponent;
            if (vis === undefined) {
                // We need a visibility component, create one if it does not already exist
                vis = {
                    type: "visibility",
                    range: light.range,
                    trackWalls: true,
                } as VisibilityComponent;
                this.ecs.addComponent(comp.entity, vis);
            } else {
                this.updateLightVisPolygon(light, undefined, vis);
            }
        } else if (comp.type === 'player') {
            let player = comp as CustomPlayerComponent;
            player._lightVisionDisplay = this.createPlayerVisMesh();

            let vis = this.ecs.getComponent(player.entity, 'visibility') as VisibilityComponent;
            if (vis === undefined) {
                // We need a visibility component, create one if it does not already exist
                vis = {
                    type: "visibility",
                    range: player.range,
                    trackWalls: true,
                } as VisibilityComponent;
                this.ecs.addComponent(comp.entity, vis);
            } else {
                this.updatePlayerVisPolygon(player, undefined, vis);
            }
        }
    }

    private onComponentEdited(comp: Component, changes: any): void {
        if (comp.type === 'light') {
            let c = comp as LightComponent;
            if ('range' in changes) {
                this.ecs.editComponent(c.entity, 'visibility', {
                    range: c.range
                });
            } else {
                let pos = this.ecs.getComponent(c.entity, 'position') as PositionComponent;
                let vis = this.ecs.getComponent(c.entity, 'visibility') as VisibilityComponent;
                if (vis.polygon !== undefined) {
                    let range = vis.range * 50;
                    this.updateVisUniforms(c._lightDisplay, pos, range * range, c.color);
                }
            }
        } else if (comp.type === 'visibility') {
            let vis = comp as VisibilityComponent;
            if (!('polygon' in changes)) return;
            let light = this.storage.getComponent(vis.entity);
            if (light !== undefined)  {
                this.updateLightVisPolygon(light, undefined, vis);
            } else {
                let player = this.ecs.getComponent(vis.entity, 'player') as CustomPlayerComponent;
                if (player !== undefined) {
                    this.updatePlayerVisPolygon(player, undefined, vis);
                }
            }
        }
    }

    private onResourceEdited(comp: Resource) {
        if (comp.type !== 'light_settings' && comp.type !== 'local_light_settings') {
            return;
        }
        let arr = [0.0, 0.0, 0.0, 0.0];
        if (this.localLightSettings.visionType === 'dm') arr[3] = 1.0;
        hex2rgb(this.lightSettings.ambientLight, arr);
        this.lightLayer.clearColor = arr;

        this.playerContainer.visible = this.localLightSettings.visionType !== 'dm';

        app.renderer.backgroundColor = this.lightSettings.background;
    }


    private onComponentRemove(comp: Component) {
        if (comp.type === 'light') {
            let light = comp as LightComponent;
            light._lightDisplay.destroy(DESTROY_ALL);
        } else if (comp.type === 'player') {
            let player = comp as CustomPlayerComponent;
            player._lightVisionDisplay.destroy(DESTROY_ALL);
        }
    }

    enable() {
        PointLightRender.setup();

        this.lightLayer = new PIXI.display.Layer();
        this.lightLayer.useRenderTexture = true;
        this.lightLayer.interactive = false;
        this.lightLayer.interactiveChildren = false;

        this.playerContainer = new PIXI.Container();
        this.playerContainer.zOrder = EditMapDisplayPrecedence.LIGHT - 1;
        this.playerContainer.zIndex = EditMapDisplayPrecedence.LIGHT - 1;
        this.playerContainer.interactive = false;
        this.playerContainer.interactiveChildren = false;
        this.playerContainer.parentLayer = this.phase.lightSystem.lightLayer;

        this.lightContainer = new PIXI.Container();
        this.lightContainer.zOrder = EditMapDisplayPrecedence.LIGHT;
        this.lightContainer.zIndex = EditMapDisplayPrecedence.LIGHT;
        this.lightContainer.interactive = false;
        this.lightContainer.interactiveChildren = false;
        this.lightContainer.parentLayer = this.lightLayer

        this.onResourceEdited(this.lightSettings);// Update the clearColor

        let lightingSprite = new PIXI.Sprite(this.lightLayer.getRenderTexture());
        lightingSprite.blendMode = CUSTOM_BLEND_MODES.MULTIPLY_COLOR_ONLY;
        lightingSprite.zIndex = EditMapDisplayPrecedence.LIGHT;
        lightingSprite.interactive = false;
        lightingSprite.interactiveChildren = false;

        this.phase.board.addChild(this.playerContainer, this.lightContainer, this.lightLayer);
        app.stage.addChild(lightingSprite);
    }

    destroy(): void {
        this.lightContainer.destroy(DESTROY_ALL);
        this.playerContainer.destroy(DESTROY_ALL);
        this.lightLayer.destroy(DESTROY_ALL);
        app.renderer.backgroundColor = DEFAULT_BACKGROUND;
    }
}