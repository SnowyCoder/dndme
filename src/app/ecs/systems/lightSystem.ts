import {Component, PositionComponent} from "../component";
import {System} from "../system";
import {EcsTracker} from "../ecs";
import {DESTROY_ALL} from "../../util/pixi";
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

export interface LightComponent extends Component {
    type: 'light';
    color: number;

    _lightDisplay?: PIXI.Mesh;
}

export interface LightSettings extends Resource {
    type: 'light_settings',
    ambientLight: number,
}



export class LightSystem implements System {
    readonly ecs: EcsTracker;
    storage = new SingleEcsStorage<LightComponent>('light');
    phase: EditMapPhase;

    lightContainer: PIXI.Container;
    lightLayer: PIXI.display.Layer;

    lightSettings: LightSettings;

    constructor(ecs: EcsTracker, phase: EditMapPhase) {
        this.ecs = ecs;
        this.phase = phase;

        ecs.addStorage(this.storage);
        this.lightSettings = {
            type: 'light_settings',
            ambientLight: 0x555555,
        } as LightSettings;
        ecs.addResource(this.lightSettings);

        ecs.events.on('component_add', this.onComponentAdd, this);
        ecs.events.on('component_edited', this.onComponentEdited, this);
        ecs.events.on('component_remove', this.onComponentRemove, this);
        ecs.events.on('resource_edited', this.onResourceEdited, this);
    }

    createVisibilityMesh(): PIXI.Mesh {
        let mesh = PointLightRender.createMesh();

        mesh.blendMode = PIXI.BLEND_MODES.ADD;
        this.lightContainer.addChild(mesh);
        mesh.parentLayer = this.lightLayer;

        return mesh;
    }

    updateVisibilityMesh(mesh: PIXI.Mesh, pos: StupidPoint, poly: number[]) {
        mesh.visible = true;
        PointLightRender.updateMeshPolygons(mesh, pos, poly);
    }

    updateVisibilityUniforms(mesh: PIXI.Mesh, center: StupidPoint, rangeSquared: number, color: number) {
        PointLightRender.updateMeshUniforms(mesh, center, rangeSquared, color);
    }

    disableVisibilityMesh(mesh: PIXI.Mesh) {
        mesh.visible = false;
    }

    updateVisibilityPolygon(light: LightComponent, pos?: PositionComponent, vis?: VisibilityComponent): void {
        if (pos === undefined) {
            pos = this.ecs.getComponent(light.entity, "position") as PositionComponent;
            if (pos === undefined) return;
        }

        if (vis === undefined) {
            vis = this.ecs.getComponent(light.entity, "visibility") as VisibilityComponent;
            if (vis === undefined) {
                this.disableVisibilityMesh(light._lightDisplay);
                return;
            }
        }

        if (vis.polygon === undefined) {
            this.disableVisibilityMesh(light._lightDisplay);
        } else {
            let range = vis.range * 50;
            this.updateVisibilityMesh(light._lightDisplay, pos, vis.polygon);
            this.updateVisibilityUniforms(light._lightDisplay, pos, range * range, light.color);
        }
    }

    private onComponentAdd(comp: Component): void {
        if (comp.type !== 'light') return;

        let light = comp as LightComponent;
        light._lightDisplay = this.createVisibilityMesh();

        let vis = this.ecs.getComponent(light.entity, 'visibility');
        if (vis === undefined) {
            // We need a visibility component, create one if it does not already exist
            vis = {
                type: "visibility",
                range: 5,
            } as VisibilityComponent;
            this.ecs.addComponent(comp.entity, vis);
        } else {
            this.updateVisibilityPolygon(comp as LightComponent);
        }
    }

    private onComponentEdited(comp: Component, changes: any): void {
        if (comp.type === 'light') {
            let c = comp as LightComponent;
            let pos = this.ecs.getComponent(c.entity, 'position') as PositionComponent;
            let vis = this.ecs.getComponent(c.entity, 'visibility') as VisibilityComponent;
            if (vis.polygon !== undefined) {
                let range = vis.range * 50;
                this.updateVisibilityUniforms(c._lightDisplay, pos, range * range, c.color);
            }
        } else if (comp.type === 'visibility') {
            let vis = comp as VisibilityComponent;
            let c = this.storage.getComponent(vis.entity);
            if (c === undefined || !('polygon' in changes)) return;

            this.updateVisibilityPolygon(c, undefined, vis);
        }
    }

    private onResourceEdited(comp: Resource) {
        if (comp.type !== 'light_settings') {
            return;
        }
        let arr = [0.0, 0.0, 0.0, 1.0];
        hex2rgb(this.lightSettings.ambientLight, arr);
        this.lightLayer.clearColor = arr;
    }


    private onComponentRemove(comp: Component) {
        if (comp.type === 'light') {
            let light = comp as LightComponent;
            light._lightDisplay.destroy(DESTROY_ALL);
        }
    }

    enable() {
        PointLightRender.setup();

        this.lightContainer = new PIXI.Container();
        this.lightContainer.zIndex = EditMapDisplayPrecedence.LIGHT;
        this.lightContainer.interactive = false;
        this.lightContainer.interactiveChildren = false;

        this.lightLayer = new PIXI.display.Layer();
        this.lightLayer.useRenderTexture = true;
        this.lightLayer.interactive = false;
        this.lightLayer.interactiveChildren = false;
        this.onResourceEdited(this.lightSettings);// Update the clearColor

        let lightingSprite = new PIXI.Sprite(this.lightLayer.getRenderTexture());
        lightingSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
        lightingSprite.zIndex = EditMapDisplayPrecedence.LIGHT;
        lightingSprite.interactive = false;
        lightingSprite.interactiveChildren = false;

        this.phase.board.addChild(this.lightContainer, this.lightLayer);
        app.stage.addChild(lightingSprite);
    }

    destroy(): void {
        this.lightContainer.destroy(DESTROY_ALL);
        this.lightLayer.destroy(DESTROY_ALL);
    }
}