import {World} from "./World";
import {FlagEcsStorage, MultiEcsStorage, SingleEcsStorage} from "./Storage";
import { ComponentTypes } from "./TypeRegistry";

export interface Component {
    type: ComponentTypes;
    entity: number;
}

export interface MultiComponent extends Component {
    multiId: number;
}

export type IsFlagComponent<X> = Omit<Component, 'type'> extends Omit<X, 'type'> ? 1 : 2;

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
export interface FollowMouseFlag extends Component {
    type: FOLLOW_MOUSE_TYPE;
}

export const SHARED_TYPE = "shared";
export type SHARED_TYPE = typeof SHARED_TYPE;
export interface SharedFlag extends Component {
    type: SHARED_TYPE;
}

export const SERIALIZED_TYPE = "serialized";
export type SERIALIZED_TYPE = typeof SERIALIZED_TYPE;
export interface SerializedFlag extends Component {
    type: SERIALIZED_TYPE;
}

export type DEFAULT_COMPONENTS = PositionComponent | TransformComponent | NameComponent | NoteComponent | FollowMouseFlag | SharedFlag | SerializedFlag;

export function registerCommonStorage(ecs: World) {
    ecs.addStorage(new SingleEcsStorage<PositionComponent>(POSITION_TYPE));
    ecs.addStorage(new SingleEcsStorage<TransformComponent>(TRANSFORM_TYPE));
    ecs.addStorage(new MultiEcsStorage<NameComponent>(NAME_TYPE));
    ecs.addStorage(new MultiEcsStorage<NoteComponent>(NOTE_TYPE));
    ecs.addStorage(new FlagEcsStorage<FollowMouseFlag>(FOLLOW_MOUSE_TYPE, false, false));
    ecs.addStorage(new FlagEcsStorage<SharedFlag>(SHARED_TYPE, false, true));
    ecs.addStorage(new FlagEcsStorage<SerializedFlag>(SERIALIZED_TYPE, false, false));
}
