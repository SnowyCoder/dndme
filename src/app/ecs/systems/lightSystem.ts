import {Component, PositionComponent} from "../component";
import {System} from "../system";
import {EcsTracker} from "../ecs";
import {PinSystem} from "./pinSystem";
import {Aabb} from "../../geometry/aabb";
import {computeViewport} from "../../geometry/visibilityPolygon";
import {WallComponent, WallSystem} from "./wallSystem";
import {Line} from "../../geometry/line";
import {DESTROY_ALL} from "../../util/pixi";
import {SingleEcsStorage} from "../storage";
import {EditMapPhase} from "../../phase/editMap/editMapPhase";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import {DynamicTree} from "../../geometry/dynamicTree";
import {StupidPoint} from "../../geometry/point";
import {Resource} from "../resource";
import PIXI from "../../PIXI";
import {app} from "../../index";
import hex2rgb = PIXI.utils.hex2rgb;

export interface LightComponent extends Component {
    type: 'light';

    range: number;// In grids (by default 1 grid = 50 pixels)
    color: number;

    _lightPolygon?: number[];
    _lightDisplay?: PIXI.Mesh;
    _lightTreeId?: number;
}

export interface LightSettings extends Resource {
    type: 'light_settings',
    ambientLight: number,
}

// Other methods: https://github.com/mattdesl/lwjgl-basics/wiki/2D-Pixel-Perfect-Shadows
const LIGHT_VERTEX_SHADER = `
    precision mediump float;
    attribute vec2 aVertexPosition;
    
    varying vec2 vecPos;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    void main() {
        vecPos = aVertexPosition;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
`;

const LIGHT_FRAGMENT_SHADER = `
    precision mediump float;

    varying vec2 vecPos;
    
    uniform vec2 center;
    uniform float radSquared;
    uniform vec3 color;

    void main() {
        vec2 diff = center - vecPos;
        float distSq = diff.x * diff.x + diff.y * diff.y;
        float intensity = 1.0 - smoothstep(0., 1., distSq / radSquared);
        gl_FragColor = vec4(color, 1) * intensity;// Pre multiplied alpha
    }
`;

export class LightSystem implements System {
    readonly ecs: EcsTracker;
    storage = new SingleEcsStorage<LightComponent>('light');
    phase: EditMapPhase;

    pinSystem: PinSystem;
    wallSystem: WallSystem;

    lightTree = new DynamicTree();

    lightContainer: PIXI.Container;
    lightProgram: PIXI.Program;
    lightLayer: PIXI.display.Layer;

    lightSettings: LightSettings;

    constructor(ecs: EcsTracker, phase: EditMapPhase) {
        this.ecs = ecs;
        this.phase = phase;
        this.pinSystem = phase.pinSystem;
        this.wallSystem = phase.wallSystem;

        ecs.addStorage(this.storage);
        this.lightSettings = {
            type: 'light_settings',
            ambientLight: 0x555555,
        } as LightSettings;
        ecs.addResource(this.lightSettings);

        ecs.events.on('component_add', this.onComponentAdd, this);
        ecs.events.on('component_remove', this.onComponentRemove, this);
        ecs.events.on('component_edited', this.onComponentEdited, this);
        ecs.events.on('resource_edited', this.onResourceEdited, this);
    }

    buildShaders() {
        this.lightProgram = PIXI.Program.from(LIGHT_VERTEX_SHADER, LIGHT_FRAGMENT_SHADER);
    }

    createVisibilityMesh(): PIXI.Mesh {
        let geometry = new PIXI.Geometry();
        let buff = new PIXI.Buffer(new Float32Array(1));
        geometry.addAttribute('aVertexPosition', buff, 2, false, PIXI.TYPES.FLOAT);

        // We'll change them all, in due time
        let shaders = new PIXI.Shader(this.lightProgram, {
            'center': new Float32Array([0.5, 0.5]),
            'radSquared': 10,
            'color': new Float32Array([0, 0, 0]),
        });

        let mesh = new PIXI.Mesh(geometry, shaders as PIXI.MeshMaterial, undefined, PIXI.DRAW_MODES.TRIANGLE_FAN);
        mesh.interactive = false;
        mesh.interactiveChildren = false;
        mesh.blendMode = PIXI.BLEND_MODES.ADD;
        this.lightContainer.addChild(mesh);
        mesh.parentLayer = this.lightLayer;

        return mesh;
    }

    updateVisibilityMesh(mesh: PIXI.Mesh, pos: StupidPoint, poly: number[]) {
        mesh.visible = true;
        let buffer = mesh.geometry.getBuffer('aVertexPosition');

        let fBuffer = new Float32Array(poly.length + 4);
        fBuffer[0] = pos.x;
        fBuffer[1] = pos.y;
        fBuffer.set(poly, 2);
        fBuffer[poly.length + 2] = poly[0];
        fBuffer[poly.length + 3] = poly[1];
        buffer.update(fBuffer);
    }

    updateVisibilityUniforms(mesh: PIXI.Mesh, center: StupidPoint, rangeSquared: number, color: number) {
        PIXI.BatchPluginFactory.create()
        let uni = mesh.shader.uniforms;
        let c = uni.center;
        c[0] = center.x;
        c[1] = center.y;
        uni.radSquared = rangeSquared;
        hex2rgb(color, uni.color);
    }

    disableVisibilityMesh(mesh: PIXI.Mesh) {
        mesh.visible = false;
    }

    updateVisibilityPolygon(light: LightComponent): void {
        let pos = this.ecs.getComponent(light.entity, "position") as PositionComponent;
        if (pos === undefined) return;

        if (light.range <= 0) {
            this.removeVisibilityPolygon(light);
            this.disableVisibilityMesh(light._lightDisplay);
            return;
        }

        // Remove the tree from Aabb
        if (light._lightTreeId !== undefined) {
            this.lightTree.destroyProxy(light._lightTreeId);
            light._lightTreeId = undefined;
        }

        let range = light.range * 50;

        let viewport = new Aabb(pos.x - range, pos.y - range, pos.x + range, pos.y + range);
        light._lightTreeId = this.lightTree.createProxy(viewport, light.entity);

        let lines = new Array<Line>();

        for (let entry of this.wallSystem.wallAabbTree.query(viewport)) {
            lines.push(entry.tag[0]);
        }
        light._lightPolygon = computeViewport(lines, viewport, pos);

        this.updateVisibilityMesh(light._lightDisplay, pos, light._lightPolygon);
        this.updateVisibilityUniforms(light._lightDisplay, pos, range * range, light.color);
    }

    removeVisibilityPolygon(ligth: LightComponent): void {
        if (ligth._lightTreeId !== undefined) {
            this.lightTree.destroyProxy(ligth._lightTreeId);
            ligth._lightTreeId = undefined;
        }
    }

    private onWallUpdated(wall: WallComponent) {
        let aabb = new Aabb(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

        let strip = wall._worldStrip;
        for (let i = 0; i < strip.length; i += 2) {
            aabb.minX = Math.min(aabb.minX, strip[i]);
            aabb.minY = Math.min(aabb.minY, strip[i + 1]);
            aabb.maxX = Math.min(aabb.maxX, strip[i]);
            aabb.maxY = Math.min(aabb.maxY, strip[i + 1]);
        }

        for (let light of [...this.lightTree.query(aabb)]) {
            this.updateVisibilityPolygon(this.storage.getComponent(light.tag as number));
        }
    }

    private onComponentAdd(comp: Component) {
        if (comp.type === 'light') {
            let light = comp as LightComponent;
            light._lightDisplay = this.createVisibilityMesh();
            this.updateVisibilityPolygon(comp as LightComponent);
        } else if (comp.type === 'wall') {
            this.onWallUpdated(comp as WallComponent);
        }
    }

    private onComponentEdited(comp: Component) {
        if (comp.type === 'wall') {
            this.onWallUpdated(comp as WallComponent);
            return;
        } else {
            let wallCmp = this.wallSystem.storage.getComponent(comp.entity);
            if (wallCmp !== undefined) {
                this.onWallUpdated(wallCmp);
                return;
            }
        }

        let light: LightComponent = undefined;

        if (comp.type === 'light') {
            light = comp as LightComponent;
        } else if (comp.type === 'position') {
            light = this.storage.getComponent(comp.entity);
        }
        if (light === undefined) return;

        this.updateVisibilityPolygon(light);
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
        if (comp.type !== 'light') return;

        let light = comp as LightComponent;
        this.removeVisibilityPolygon(light);
        light._lightDisplay.destroy(DESTROY_ALL);
    }

    enable() {
        this.buildShaders();
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