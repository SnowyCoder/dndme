import { decode, encode } from "@msgpack/msgpack";
import { Buffer } from "buffer";

export function objectMerge(to: any, from: any) {
    for (let i in from) {
        to[i] = from[i];
    }
}

export function objectFilterInplace<T>(x: {[name: string]: T}, filter: (name: string, val: T) => boolean) {
    for (let name in x) {
        if (!filter(name, x[name])) {
            delete x[name];
        }
    }
}

export function objectClone<T>(obj: T): T {
    // Yes, really, thanks js.
    return decode(encode(obj)) as any;
    //return JSON.parse(JSON.stringify(obj));
}

export function randombytes(num: number): Buffer {
    let buffer = Buffer.allocUnsafe(num);

    crypto.getRandomValues(buffer);
    return buffer;
}
