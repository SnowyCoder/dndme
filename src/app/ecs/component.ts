import {World} from "./world";
import {FlagEcsStorage, MultiEcsStorage, SingleEcsStorage} from "./storage";

export interface Component {
    type: string;
    entity: number;
}

export interface MultiComponent extends Component {
    multiId: number;
}

export interface HideableComponent extends Component {
    clientVisible: boolean;
}

export const POSITION_TYPE = "position";
export type POSITION_TYPE = typeof POSITION_TYPE;
export interface PositionComponent extends Component {
    type: POSITION_TYPE;

    x: number;
    y: number;
}

export const TRANSFORM_TYPE = "transform";
export type TRANSFORM_TYPE = typeof TRANSFORM_TYPE;
export interface TransformComponent extends Component {
    type: TRANSFORM_TYPE;

    scale: number;
    rotation: number;
}

export const NAME_TYPE = "name";
export type NAME_TYPE = typeof NAME_TYPE;
export interface NameComponent extends HideableComponent, MultiComponent {
    type: NAME_TYPE;

    name: string;
}


export const NOTE_TYPE = "note";
export type NOTE_TYPE = typeof NOTE_TYPE;
export interface NoteComponent extends HideableComponent, MultiComponent {
    type: NOTE_TYPE;

    note: string;
}

export const FOLLOW_MOUSE_TYPE = "follow_mouse";
export type FOLLOW_MOUSE_TYPE = typeof FOLLOW_MOUSE_TYPE;
export interface FollowMouseComponent extends Component {
    type: FOLLOW_MOUSE_TYPE;
}

export const HOST_HIDDEN_TYPE = "host_hidden";
export type HOST_HIDDEN_TYPE = typeof HOST_HIDDEN_TYPE;
export interface HostHiddenComponent extends Component {
    type: HOST_HIDDEN_TYPE;
}

export function registerCommonStorage(ecs: World) {
    ecs.addStorage(new SingleEcsStorage(POSITION_TYPE));
    ecs.addStorage(new SingleEcsStorage(TRANSFORM_TYPE));
    ecs.addStorage(new MultiEcsStorage(NAME_TYPE));
    ecs.addStorage(new MultiEcsStorage(NOTE_TYPE));
    ecs.addStorage(new FlagEcsStorage(FOLLOW_MOUSE_TYPE, false, false));
    ecs.addStorage(new FlagEcsStorage(HOST_HIDDEN_TYPE, false, false));
}
