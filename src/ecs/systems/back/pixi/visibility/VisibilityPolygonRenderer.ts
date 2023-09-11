import { ObjectRenderer, Shader, State, Texture, ExtensionMetadata, ExtensionType, UniformGroup, utils, extensions, BufferSystem, Renderer, Buffer, Color } from "@/pixi";
import { DepthFunc, VisibilityPolygonElement } from "./VisibilityPolygonElement";
import { VisibilityPolygonGeometry } from "./VisibilityPolygonGeometry";
import { compilePrograms, LightProgramType, MAX_BATCH_COUNT } from "./VisibilityPrograms";


export const VISIBILITY_POLYGON = 'visibility_polygon';
export type VISIBILITY_POLYGON = typeof VISIBILITY_POLYGON;

export class VisibilityPolygonRenderer extends ObjectRenderer {
    // pixi.js should call contextChange before anything
    shaders!: {[name in LightProgramType]: Shader};
    state: State;
    shader!: Shader;

    private currentProgram: LightProgramType = 'normal';
    private currentDepthFunc: DepthFunc = DepthFunc.LESS;
    // Used before any draw is made, when the system is booted up
    private isGpuDirty: boolean = false;

    // Packed things
    private attributeBuffer: Float32Array = new Float32Array(16 * 4096);
    private iattributeBuffer: Uint32Array;
    private indexBuffer: Uint16Array = new Uint16Array(32 * 4096);
    private uniformCenterRadius = new Float32Array(4 * MAX_BATCH_COUNT);
    private texture: Texture = Texture.WHITE;

    private packedGeometry!: VisibilityPolygonGeometry;

    // Indexes
    private attributeIndex: number = 0;
    private indexIndex: number = 0;
    private modelIndex: number = 0;
    private trianglesWritten: number = 0;


    static extension: ExtensionMetadata = {
        name: VISIBILITY_POLYGON,
        type: ExtensionType.RendererPlugin,
    };

    constructor(renderer: Renderer) {
        super(renderer)
        this.state = State.for2d();
        this.state.depthMask = true;
        this.iattributeBuffer = new Uint32Array(this.attributeBuffer.buffer);

        renderer.runners.contextChange.add(this);
        this.contextChange();
    }

    /** Starts a new sprite batch. */
    start(): void {
        this.isGpuDirty = true;
    }

    render(element: VisibilityPolygonElement): void {
        // Check that element state is consistent with previously rendered states,
        // If it is not, flush and update GPU state
        this.updateState(element);
        // If the element has the same state as the others but cannot fit in the buffers, flush them.
        if (!this.canElementFit(element)) {
            this.flush();
        }
        // Write element in the buffers WITHOUT DRAWING THEM!
        this.writeElement(element);
    }

    /** Stops and flushes the current batch. */
    stop(): void {
        this.flush();
        this.setDepthFunc(DepthFunc.LESS);
    }

    contextChange(): void {
        //console.log(this.renderer.gl);
        let programs = compilePrograms();

        this.shaders = {} as any;
        let name: LightProgramType;
        for (name in programs) {
            const uniformGroup = new UniformGroup(new Buffer(this.uniformCenterRadius, false), false, true);
            let shader = new Shader(programs[name], {
                BatchBlock: uniformGroup,
                projectionMatrix1: this.renderer.projection.projectionMatrix,
            });
            this.shaders[name] = shader;
        }
        this.shader = this.shaders[this.currentProgram]

        this.packedGeometry = new VisibilityPolygonGeometry(false);
    }

    /** Destroys this `BatchRenderer`. It cannot be used again. */
    destroy(): void {
        this.packedGeometry.destroy();
        if (this.shader) {
            this.shader.destroy();
        }
        super.destroy();
    }

    private setDepthFunc(func: DepthFunc) {
        if (this.currentDepthFunc === func) return;
        this.currentDepthFunc = func;
        const gl = this.renderer.gl;
        let f: number = gl.LESS;
        if (func == DepthFunc.NEVER) f = gl.NEVER;
        else if (func == DepthFunc.LESS) f = gl.LESS;
        else if (func == DepthFunc.EQUAL) f = gl.EQUAL;
        else if (func == DepthFunc.LEQUAL) f = gl.LEQUAL;
        else if (func == DepthFunc.GREATER) f = gl.GREATER;
        else if (func == DepthFunc.NOTEQUAL) f = gl.NOTEQUAL;
        else if (func == DepthFunc.GEQUAL) f = gl.GEQUAL;
        else if (func == DepthFunc.ALWAYS) f = gl.ALWAYS;
        gl.depthFunc(f);
    }

    protected updateState(element: VisibilityPolygonElement) {
        let changed = false;
        if (element.program != this.currentProgram) {
            changed = true;
            this.currentProgram = element.program;
            this.shader = this.shaders[this.currentProgram];
        }
        if (element.texture != this.texture) {
            changed = true;
        }
        if (element.blendMode != this.state.blendMode) {
            changed = true;
            this.state.blendMode = element.blendMode;
        }
        if (element.depthTest !== this.state.depthTest) {
            this.state.depthTest = element.depthTest;
        }
        if (element.depthFunc !== this.currentDepthFunc) {
            changed = true;
        }
        if (changed || this.isGpuDirty) {
            this.isGpuDirty = false;
            this.flush();
            this.renderer.state.set(this.state);
            // don't sync uniforms, we'll sync them later (when they're filled up)
            this.renderer.shader.bind(this.shader, true);
            this.texture = element.texture;
            this.renderer.geometry.bind(this.packedGeometry);
            if (element.depthTest) this.setDepthFunc(element.depthFunc);
        }
    }

    flush(): void {
        if (this.attributeIndex === 0) return;

        const { gl, geometry, shader, texture }  =  this.renderer;

        this.packedGeometry._buffer.update(this.attributeBuffer.subarray(0, this.attributeIndex));
        this.packedGeometry._indexBuffer.update(this.indexBuffer.subarray(0, this.indexIndex));
        geometry.updateBuffers();
        // Is this how you bind textures??
        texture.bind(this.texture);
        this.shader.uniforms.BatchBlock.buffer!.update(this.uniformCenterRadius.subarray(0, this.modelIndex * 4));
        const fb = this.renderer.framebuffer.current;
        this.shader.uniforms.dimensions = new Float32Array([fb.width, fb.height]);
        shader.syncUniformGroup(this.shader.uniformGroup, {
            textureCount: 0, uboCount: 0
        });
        gl.drawElements(gl.TRIANGLES, this.trianglesWritten * 3, gl.UNSIGNED_SHORT, 0);

        // Reset indices
        this.attributeIndex = 0;
        this.indexIndex = 0;
        this.modelIndex = 0;
        this.trianglesWritten = 0;
    }

    private writeElement(element: VisibilityPolygonElement): void {
        if (element.polygon.length < 4) return;// at least 2 points should be specified
        const modelId = this.modelIndex++;
        // encode center (xyz) + radius
        const u = this.uniformCenterRadius;

        const wt = element.transform.worldTransform;

        u[4 * modelId + 0] = wt.tx;
        u[4 * modelId + 1] = wt.ty;
        u[4 * modelId + 2] = element.depth;
        // wt.a + wt.b = 1 && wt.c + wt.d = 1
        // r = radius * len(A * (1, 0)) = radius * len((a, b))
        u[4 * modelId + 3] = element.radius * Math.sqrt(wt.a*wt.a + wt.b*wt.b);

        const alpha = Math.min(element.worldAlpha, 1.0);
        let argb = Color.shared.setValue(element.tint).toPremultiplied(alpha);
        argb = (argb & 0xFF00FF00) | ((argb & 0x00FF0000) >> 16) | ((argb & 0x000000FF) << 16);


        const px = element.position.x;
        const py = element.position.y;
        const writeVertex = (x: number, y: number) => {
            const i = this.attributeIndex;
            this.attributeBuffer[i + 0] = wt.a * (x - px) + wt.c * (y - py) + wt.tx;
            this.attributeBuffer[i + 1] = wt.b * (x - px) + wt.d * (y - py) + wt.ty;
            this.iattributeBuffer[i + 2] = argb;
            this.attributeBuffer[i + 3] = modelId;
            this.attributeIndex += 4;
        };
        const writeTriangle = (a: number, b: number) => {
            const i = this.indexIndex;
            this.indexBuffer[i + 0] = centeri;
            this.indexBuffer[i + 1] = a;
            this.indexBuffer[i + 2] = b;
            this.indexIndex += 3;
            this.trianglesWritten++;
        };
        const centeri = this.attributeIndex / 4;
        const polygon = element.polygon;
        // Write center
        writeVertex(px, py);
        // And first point
        writeVertex(polygon[0], polygon[1]);
        let trIndex = centeri + 2;
        for (let i = 2; i < polygon.length; i += 2) {
            writeVertex(polygon[i], polygon[i + 1]);
            writeTriangle(trIndex - 1, trIndex);
            trIndex += 1;
        }
        writeTriangle(centeri + 1, trIndex - 1);
    }

    private canElementFit(elem: VisibilityPolygonElement): boolean {
        // example: 4 points A B C D
        // used attributes: 5 points (abcd + center), 4 f32 each (x, y, color and pos)
        // used indices: 4*N*u16
        if (this.modelIndex >= MAX_BATCH_COUNT) return false;
        const vertexCount = elem.polygon.length / 2;
        const usedAttrs =  4 * (1 + vertexCount);
        const usedIndices = 3 * vertexCount;
        return (this.attributeIndex + usedAttrs) < this.attributeBuffer.length &&
               (this.indexIndex + usedIndices)   < this.indexBuffer.length;

    }
}

extensions.add(VisibilityPolygonRenderer);

// Turns out BufferSystem does not support updating a buffer partially, this adds the support
// by allocating a buffer at least as big as the TypedArray's underlying buffer
// TODO: ask upstream
(BufferSystem as any).prototype.update = function(buffer: Buffer): void {
    const { gl, CONTEXT_UID } = this;

    const glBuffer = buffer._glBuffers[CONTEXT_UID] || this.createGLBuffer(buffer);

    if (buffer._updateID === glBuffer.updateID)
    {
        return;
    }

    glBuffer.updateID = buffer._updateID;

    gl.bindBuffer(buffer.type, glBuffer.buffer);
    const len = (buffer.data as any as ArrayBufferView).buffer?.byteLength ?? buffer.data.byteLength;

    if (glBuffer.byteLength >= len)
    {
        // offset is always zero for now!
        gl.bufferSubData(buffer.type, 0, buffer.data);
    }
    else
    {
        const drawType = buffer.static ? gl.STATIC_DRAW : gl.DYNAMIC_DRAW;

        glBuffer.byteLength = len;
        let data = buffer.data as any as ArrayBufferView;
        if (len != data.byteLength) {
            let d = new Uint8Array(len)
            if (data.buffer !== undefined) {
                d.set(new Uint8Array(data.buffer));
            } else {
                d.set(new Uint8Array(data as any as ArrayBufferLike));
            }
            data = d;
        }
        gl.bufferData(buffer.type, data, drawType);
    }
}
