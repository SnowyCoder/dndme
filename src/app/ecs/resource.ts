import {GridOptions} from "../game/grid";

export interface Resource {
    type: string;
    _save: boolean;
    _sync: boolean;
}


export interface GridResource extends Resource, GridOptions {
    type: 'grid';
    _save: true;
    _sync: true;
}
