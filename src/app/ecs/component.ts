import {EcsTracker} from "./ecs";
import {MultiEcsStorage, SingleEcsStorage} from "./storage";

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

export interface PositionComponent extends Component {
    type: "position";

    x: number,
    y: number,
}

export interface NameComponent extends HideableComponent, MultiComponent {
    type: "name";

    name: string;
}


export interface NoteComponent extends HideableComponent, MultiComponent {
    type: "note";

    note: string;
}

export function registerCommonStorage(ecs: EcsTracker) {
    ecs.addStorage(new SingleEcsStorage("position"));
    ecs.addStorage(new MultiEcsStorage("name"));
    ecs.addStorage(new MultiEcsStorage("note"));
}

export interface RoomComponent extends Component {
    type: "room";

    polygon: Array<number>;
    _worldPolygon?: Array<number>;// polygon + position
    visible: boolean;
}
