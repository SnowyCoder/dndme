/**
 * Basic BitSet
 */
export class BitSet {
    data: Uint32Array;

    constructor(data: number | Uint32Array) {
        if (typeof data === 'number') {
            this.data = new Uint32Array(Math.ceil(length / 32));
        } else {
            this.data = data;
        }
    }

    get size(): number {
        return this.data.length << 5;
    }

    get(i: number): boolean {
        i |= 0;
        let wi = i >>> 5;
        if (wi >= this.data.length) return false;
        let b = this.data[wi];
        return !!((b >>> i) & 1);
    }

    private ensureCapacity(wi: number): void {
        let newLen = this.data.length;
        while (newLen < wi) newLen *= 2;
        if (newLen === this.data.length) return;
        let newData = new Uint32Array(newLen);
        newData.set(this.data);
        this.data = newData;
    }

    set(i: number): void {
        i |= 0;

        let wi = i >>> 5;
        this.ensureCapacity(wi);
        this.data[wi] |= 1 << i;
    }

    reset(i: number): void {
        i |= 0;

        let wi = i >>> 5;
        this.ensureCapacity(wi);
        this.data[wi] &= ~(1 << i);
    }

    isAll(target: boolean, until?: number): boolean {
        let t = 0;
        if (target) {
            t = 0xFFFFFFFF;
        }

        let loopLast = until === undefined ? this.data.length : (until >>> 5);

        for (let i = 0; i < loopLast; i++) {
            if (this.data[i] !== t) return false;
        }

        if (until === undefined) return true;

        let i = ((until - 1) >> 5) + 1;
        let il = until & 0x1F;
        let mask = (1 << il) - 1;

        let d = this.data[i];
        if (target) {
            d = ~d;
        }

        return (d & mask) === 0;
    }
}