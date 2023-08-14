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

// base 64

export function bufferToBase64Url(input: Buffer): string {
    return input.toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
};

export function base64UrlToBuffer(base64url: string): Buffer {
    const base64 = b64PadString(base64url)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");
    return Buffer.from(base64, "base64");
}

function b64PadString(input: string): string {
    let segmentLength = 4;
    let stringLength = input.length;
    let diff = stringLength % segmentLength;

    if (!diff) {
        return input;
    }

    let position = stringLength;
    let padLength = segmentLength - diff;
    let paddedStringLength = stringLength + padLength;
    let buffer = Buffer.alloc(paddedStringLength);

    buffer.write(input);

    while (padLength--) {
        buffer.write("=", position++);
    }

    return buffer.toString();
}
