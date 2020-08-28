import {Packet} from "./packet";
import {SerializedEcs} from "../ecs/ecs";
import {Component} from "../ecs/component";
import {Resource} from "../ecs/resource";

/**
 * Host -> Device
 * Sent when the device joins
 */
export interface Hello extends Packet {
    type: "hello";
    version: string;
    //devices: DisplayDeviceData[];
    you: number; // index in devices array
}

/*
/**
 * Host -> Device
 * Sent when a device joins
 * /
export interface DeviceJoined extends Packet {
    type: "device_joined";
    device: DisplayDeviceData;
}

/**
 * Host -> Device
 * Sent when the device leaves
 * /
export interface DeviceLeft extends Packet {
    type: "device_left";
    id: number;
}
*/

export interface EcsBootrstrap extends Packet {
    type: "ecs_bootstrap";

    payload: SerializedEcs;
}

export interface EntitySpawn extends Packet {
    type: "entity_spawn";
    entityId: number;
    components: [Component];
}

export interface EntityDespawn extends Packet {
    type: "entity_despawn";
    entityId: number;
}

export interface ComponentAdd {
    type: "component_add";

    entityId: number;

    payload: Component;
}

export interface ComponentEdit {
    type: "component_edit";

    entityId: number;
    compType: string;
    multiId?: number;

    changes: { [key: string]: any; }
}

export interface ComponentRemove {
    type: "component_remove";

    entityId: number;
    compType: string;
    multiId?: number;
}

export interface ResourceAdd {
    type: "resource_add";

    payload: Resource;
}

export interface ResourceRemove {
    type: "resource_remove";
    resType: string;
}

export interface ResourceEdit {
    type: "resource_edit";
    resType: string;
    changes: { [key: string]: any; }
}

export interface RoomMapDraw extends Packet {
    type: 'room_map_draw';
    map: ArrayBuffer;
    mapType: string;
    mapX: number;
    mapY: number;
}
