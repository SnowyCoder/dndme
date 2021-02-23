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
    precision mediump float;

    varying vec2 vecPos;
    
    uniform vec2 center;
    uniform float radSquared;
    uniform vec3 color;

    void main() {
        vec2 diff = center - vecPos;
        float distSq = diff.x * diff.x + diff.y * diff.y;
        float intensity = 1.0 - clamp(distSq / radSquared, 0., 1.);
        gl_FragColor = vec4(color, 1) * (intensity * intensity);// Pre multiplied alpha
    }
`;

const CONST_LIGHT_FRAGMENT_SHADER = `
    precision mediump float;

    varying vec2 vecPos;
    
    uniform vec2 center;
    uniform float radSquared;
    uniform vec3 color;

    void main() {
        vec2 diff = center - vecPos;
        float distSq = diff.x * diff.x + diff.y * diff.y;
        float intensity = float(distSq <= radSquared);
        gl_FragColor = vec4(color, 1) * intensity;// Pre multiplied alpha
    }
`;

const PLAYER_VIS_FRAGMENT_SHADER = `
    precision mediump float;

    varying vec2 vecPos;
    
    uniform vec2 center;
    uniform float radSquared;
    uniform vec3 color;

    void main() {
        vec2 diff = center - vecPos;
        float distSq = diff.x * diff.x + diff.y * diff.y;
        float intensity = 1.0 - smoothstep(0.9, 1.0, clamp(distSq / radSquared, 0., 1.));
        gl_FragColor = vec4(color, 1) * intensity;// Pre multiplied alpha
    }
`;

let lightProgram: PIXI.Program | undefined = undefined;
let constLightProgram: PIXI.Program | undefined = undefined;
let playerVisProgram: PIXI.Program | undefined = undefined;

type LightProgramType = 'normal' | 'const' | 'player';

export function setup() {
    if (lightProgram === undefined) {
        lightProgram = PIXI.Program.from(LIGHT_VERTEX_SHADER, LIGHT_FRAGMENT_SHADER);
        constLightProgram = PIXI.Program.from(LIGHT_VERTEX_SHADER, CONST_LIGHT_FRAGMENT_SHADER);
        playerVisProgram = PIXI.Program.from(LIGHT_VERTEX_SHADER, PLAYER_VIS_FRAGMENT_SHADER);
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
    let shaders = new PIXI.Shader(program, {
        'center': new Float32Array([0.5, 0.5]),
        'radSquared': 10,
        'color': new Float32Array([0, 0, 0]),
    });

    let mesh = new PIXI.Mesh(geometry, shaders as PIXI.MeshMaterial, undefined, PIXI.DRAW_MODES.TRIANGLE_FAN);
    mesh.interactive = false;
    mesh.interactiveChildren = false;

    return mesh;
}

export function updateMeshPolygons(mesh: PIXI.Mesh, pos: PIXI.IPointData, poly: number[]): void {
    let buffer = mesh.geometry.getBuffer('aVertexPosition');

    let fBuffer = new Float32Array(poly.length + 4);
    fBuffer[0] = pos.x;
    fBuffer[1] = pos.y;
    fBuffer.set(poly, 2);
    fBuffer[poly.length + 2] = poly[0];
    fBuffer[poly.length + 3] = poly[1];
    buffer.update(fBuffer);
}

export function updateMeshUniforms(mesh: PIXI.Mesh, center: PIXI.IPointData, rangeSquared: number, color: number) {
    let uni = mesh.shader.uniforms;
    let c = uni.center;
    c[0] = center.x;
    c[1] = center.y;
    uni.radSquared = rangeSquared;
    hex2rgb(color, uni.color);
}