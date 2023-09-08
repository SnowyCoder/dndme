import { Geometry, Buffer, TYPES } from "@/pixi";

export class VisibilityPolygonGeometry extends Geometry {
    _buffer: Buffer;
    _indexBuffer: Buffer;

    constructor(_static = false) {
        super();

        this._buffer = new Buffer(undefined, _static, false);
        this._indexBuffer = new Buffer(undefined, _static, true);

        this.addAttribute('aVertexPosition', this._buffer, 2, false, TYPES.FLOAT)
            .addAttribute('aColor', this._buffer, 4, true, TYPES.UNSIGNED_BYTE)// 4 unsigned bytes that get converted into 4 floats (normalized)
            .addAttribute('aModelId', this._buffer, 1, false, TYPES.FLOAT)
            .addIndex(this._indexBuffer);
    }
}
