import {GridOptions, GridType} from "../game/grid";

export interface Resource {
    type: string;
}

export interface HiddenResource extends Resource{
    _clientHide: true;
}


export interface GridResource extends Resource, GridOptions {
    type: 'grid';
    gridType: GridType;
}
