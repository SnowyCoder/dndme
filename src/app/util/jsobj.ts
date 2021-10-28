
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

export function objectClone(obj: any): any {
    // Yes, really, thanks js.
    return JSON.parse(JSON.stringify(obj));
}