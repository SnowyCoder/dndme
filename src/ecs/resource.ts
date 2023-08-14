import {GridOptions} from "../game/grid";
import {GRID_TYPE} from "./systems/gridSystem";
import {Aabb} from "../geometry/aabb";
import { ResourceType } from "./TypeRegistry";

export interface Resource {
    type: ResourceType;
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

export const MEASURE_TYPE = "measure";
export type MEASURE_TYPE = typeof MEASURE_TYPE;
export interface MeasureResource extends Resource {
    type: MEASURE_TYPE;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    _save: false;
    _sync: false;
}


export const CREATION_INFO_TYPE = "creation_info";
export type CREATION_INFO_TYPE = typeof CREATION_INFO_TYPE;
export interface CreationInfoResource extends Resource {
    type: CREATION_INFO_TYPE;
    exitAfterCreation: boolean;
    _save: true;
    _sync: false;
}

export type DEFAULT_RESOURCES = GridResource | RectangularSelectionResource | MeasureResource | CreationInfoResource;
