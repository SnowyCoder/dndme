import {EcsTracker} from "./ecs";

export interface System {
    readonly ecs: EcsTracker;

    destroy(): void;
}

