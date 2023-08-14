import {Packet} from "./packet";
import {SerializedWorld} from "../ecs/World";
import {Component} from "../ecs/component";
import {Resource} from "../ecs/resource";
import {Command} from "../ecs/systems/command/command";
/*
/**
 * Host -> Device
 * Sent when the device joins
 * /
export interface Hello extends Packet {
    type: "hello";
    version: string;
    devices: number[];
}


/**
 * Host -> Device
 * Sent when a device joins
 * /
export interface DeviceJoined extends Packet {
    type: "device_joined";
    id: number;
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

export interface CommandPacket extends Packet {
    type: "cmd";
    data: Command[];
}

export interface EcsBootrstrap extends Packet {
    type: "ecs_bootstrap";

    payload: SerializedWorld;
}

export interface EntitySpawn extends Packet {
    type: "entity_spawn";
    entityId: number;
    components: [Component];
}

export interface MouseTrailPacket extends Packet {
    type: "mtrail",
    fut: number[],
}
