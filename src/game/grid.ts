export enum GridType {
    SQUARE,
    HEXAGON,
}

export interface GridGraphicalOptions {
    visible: boolean;
    gridType: GridType,
    color: number;
    thick: number;
    opacity: number;
}

export interface GridPlacementOptions {
    size: number;
    offX: number;
    offY: number;
}

export interface GridUnitsOptions {
    unitMul: number;
    unitName: string;
}

export interface GridOptions extends GridGraphicalOptions, GridPlacementOptions, GridUnitsOptions {}

export const STANDARD_GRID_OPTIONS = {
    visible: true,
    gridType: GridType.SQUARE,
    color: 0,
    thick: 10,
    opacity: 0.75,
    size: 128,
    offX: 0,
    offY: 0,
    unitMul: 1.5,
    unitName: 'm',
} as GridOptions;
