import { IPoint } from "../geometry/point";
import PIXI from "../PIXI";
import hex2rgb = PIXI.utils.hex2rgb;

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
    precision lowp float;

    varying vec2 vecPos;

    uniform vec2 center;
    uniform float radius;
    uniform vec3 color;

    void main() {
        float dist = length(center - vecPos);
        float invInt = dist / radius;
        float intensity = 1.0 - clamp(invInt * invInt, 0., 1.);
        gl_FragColor = vec4(color, 1) * (intensity * intensity);// Pre multiplied alpha
    }
`;

const CONST_LIGHT_FRAGMENT_SHADER = `
    precision lowp float;

    varying vec2 vecPos;

    uniform vec2 center;
    uniform float radius;
    uniform vec3 color;

    void main() {
        float dist = length(center - vecPos);
        float intensity = float(dist <= radius);
        gl_FragColor = vec4(color, 1) * intensity;// Pre multiplied alpha
    }
`;

const PLAYER_VIS_FRAGMENT_SHADER = `
    precision lowp float;

    varying vec2 vecPos;

    uniform vec2 center;
    uniform float radius;
    uniform vec3 color;

    void main() {
        float dist = length(center - vecPos);
        float intensity = 1.0 - smoothstep(0.9, 1.0, clamp(dist / radius, 0., 1.));
        gl_FragColor = vec4(color, 1) * intensity;// Pre multiplied alpha
    }
`;

let lightProgram: PIXI.Program | undefined = undefined;
let constLightProgram: PIXI.Program | undefined = undefined;
let playerVisProgram: PIXI.Program | undefined = undefined;

type LightProgramType = 'normal' | 'const' | 'player';

export function setup() {
    if (lightProgram === undefined) {
        lightProgram = PIXI.Program.from(LIGHT_VERTEX_SHADER, LIGHT_FRAGMENT_SHADER, 'light');
        constLightProgram = PIXI.Program.from(LIGHT_VERTEX_SHADER, CONST_LIGHT_FRAGMENT_SHADER, 'const_light');
        playerVisProgram = PIXI.Program.from(LIGHT_VERTEX_SHADER, PLAYER_VIS_FRAGMENT_SHADER, 'player_vis');
    }
}

export function createMesh(lightType: LightProgramType = 'normal'): PIXI.Mesh {
    let geometry = new PIXI.Geometry();
    let buff = new PIXI.Buffer(new Float32Array(1));
    geometry.addAttribute('aVertexPosition', buff, 2, false, PIXI.TYPES.FLOAT);

    let program;
    switch (lightType) {
        case 'normal': program = lightProgram; break;
        case 'const': program = constLightProgram; break;
        case 'player': program = playerVisProgram; break;
    }
    // We'll change them all, in due time
    let shaders = new PIXI.Shader(program!, {
        'center': new Float32Array([0.5, 0.5]),
        'radius': 10,
        'color': new Float32Array([0, 0, 0]),
    });

    let mesh = new PIXI.Mesh(geometry, shaders as PIXI.MeshMaterial, undefined, PIXI.DRAW_MODES.TRIANGLE_FAN);
    mesh.interactive = false;
    mesh.interactiveChildren = false;

    return mesh;
}

export function updateMeshPolygons(mesh: PIXI.Mesh, pos: IPoint, poly?: number[]): void {
    let buffer = mesh.geometry.getBuffer('aVertexPosition');

    if (poly === undefined) {
        mesh.visible = false;
        return;
    }

    let fBuffer = new Float32Array(poly.length + 4);
    fBuffer[0] = pos.x;
    fBuffer[1] = pos.y;
    fBuffer.set(poly, 2);
    fBuffer[poly.length + 2] = poly[0];
    fBuffer[poly.length + 3] = poly[1];
    buffer.update(fBuffer);
}

export function updateMeshUniforms(mesh: PIXI.Mesh, center: IPoint, radius: number, color: number) {
    let uni = mesh.shader.uniforms;
    let c = uni.center;
    c[0] = center.x;
    c[1] = center.y;
    uni.radius = radius;
    hex2rgb(color, uni.color);
}
