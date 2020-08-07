export const STANDARD_GRID_OPTIONS = {
    color: 0,
    width: 10,
    opacity: 0.75,
    size: 100,
    offX: 0,
    offY: 0,
} as GridOptions;

export enum GridType {
    SQUARE,
    HEXAGON,
}

export interface GridGraphicalOptions {
    color: number;
    width: number;
    opacity: number;
}

export interface GridPlacementOptions {
    size: number;
    offX: number;
    offY: number;
}

export interface GridOptions extends GridGraphicalOptions, GridPlacementOptions {}

