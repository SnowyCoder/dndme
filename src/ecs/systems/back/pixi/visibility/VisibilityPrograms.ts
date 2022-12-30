import { Program } from "pixi.js";

export const MAX_BATCH_COUNT = 1024;// < 2**16 - 1 if using mediump int


export type LightProgramType = 'normal' | 'const' | 'player';

// Other methods: https://github.com/mattdesl/lwjgl-basics/wiki/2D-Pixel-Perfect-Shadows
const LIGHT_VERTEX_SHADER = `
#version 300 es
#define SHADER_NAME visibility-polygon-vertex
precision mediump int;

in vec2 aVertexPosition;
in vec4 aColor;
in float aModelId;

out vec2 vecPos;
out vec4 color;
flat out uint modelId;

layout (std140) uniform BatchBlock {
    vec4 centerRadius[${MAX_BATCH_COUNT}];
};

uniform mat3 projectionMatrix;

void main() {
    vecPos = aVertexPosition;
    modelId = uint(aModelId);
    color = aColor;
    float z = centerRadius[uint(modelId)].z;
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, z, 1.0);
}
`;

const FRAGMENT_PRELUDE = `#version 300 es
precision mediump float;
precision mediump int;

in vec2 vecPos;
in vec4 color;
flat in uint modelId;

out vec4 outColor;

layout (std140) uniform BatchBlock {
    highp vec4 centerRadius[${MAX_BATCH_COUNT}];
};
`

const FRAGMENT_MAIN_PRELUDE = `vec4 cr = centerRadius[modelId];
float radius = cr.w;
float dist = length(cr.xy - vecPos);`

// Used to render where a light shines
const LIGHT_FRAGMENT_SHADER = `${FRAGMENT_PRELUDE}
#define SHADER_NAME visibility-polygon-fragment-light

void main() {
    ${FRAGMENT_MAIN_PRELUDE}
    float invInt = dist / radius;
    float intensity = 1.0 - clamp(invInt * invInt, 0., 1.);
    outColor = color * (intensity * intensity);
}
`;

// Used to render where the player sees, it should be almost constant with a small edge at the end
const PLAYER_VIS_FRAGMENT_SHADER = `${FRAGMENT_PRELUDE}
#define SHADER_NAME visibility-polygon-fragment-player

void main() {
    ${FRAGMENT_MAIN_PRELUDE}
    float intensity = 1.0 - smoothstep(0.9, 1.0, clamp(dist / radius, 0., 1.));
    outColor = color * intensity;
}
`;

// Used in BitByBit image discovery, should optionally blit from an image (and should also write to the depth buffer)
const CONST_LIGHT_FRAGMENT_SHADER = `${FRAGMENT_PRELUDE}
#define SHADER_NAME visibility-polygon-fragment-const

uniform vec2 dimensions;
uniform sampler2D originalTex;

void main() {
    ${FRAGMENT_MAIN_PRELUDE}
    if (dist > radius) {
        discard;// Useful as it won't write to the depth buffer!
    }
    // We need to be able to control if we need to write or not, we do not care about real colors
    outColor = color.x * texture(originalTex, gl_FragCoord.xy / dimensions);
}
`;

export type LightProgramRegistry = {[name in LightProgramType]: Program};

export function compilePrograms(): LightProgramRegistry {
    const fragments = {
        'normal': LIGHT_FRAGMENT_SHADER,
        'player': PLAYER_VIS_FRAGMENT_SHADER,
        'const': CONST_LIGHT_FRAGMENT_SHADER,
    };
    const res = {} as LightProgramRegistry;
    let name: LightProgramType;
    for (name in fragments) {
        const fragment = fragments[name];
        const program = Program.from(LIGHT_VERTEX_SHADER, fragment, 'visibility-polygon-' + name);
        res[name] = program;
    }

    return res;
}
