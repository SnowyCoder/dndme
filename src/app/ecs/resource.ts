import {GridOptions} from "../game/grid";
import {GRID_TYPE} from "./systems/gridSystem";

export interface Resource {
    type: string;
    _save: boolean;
    _sync: boolean;
}


export interface GridResource extends Resource, GridOptions {
    type: GRID_TYPE;
    _save: true;
    _sync: true;
}
