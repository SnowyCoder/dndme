import {Component} from "./component";


export function filterComponentKeepEntity(comp: Component): any {
    let res = {} as any;
    for (let name in comp) {
        if (name[0] === '_' || name === 'clientVisible') continue;
        res[name] = (comp as any)[name];
    }
    return res;
}

export function filterComponent(comp: Component): any {
    let res = {} as any;
    for (let name in comp) {
        if (name[0] === '_' || name === 'entity' || name === 'clientVisible') continue;
        res[name] = (comp as any)[name];
    }
    return res;
}