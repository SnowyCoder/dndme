import {GridOptions} from "../game/grid";
import {GRID_TYPE} from "./systems/gridSystem";
import {HideableComponent, MultiComponent} from "./component";
import {Aabb} from "../geometry/aabb";

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



export const RECTANGULAR_SELECTION_TYPE = "rectangular_selection";
export type RECTANGULAR_SELECTION_TYPE = typeof RECTANGULAR_SELECTION_TYPE;
export interface RectangularSelectionResource extends Resource {
    type: RECTANGULAR_SELECTION_TYPE;
    aabb: Aabb;
    _save: false;
    _sync: false;
}
