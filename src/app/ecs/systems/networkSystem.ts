import {System} from "../system";
import {EcsTracker} from "../ecs";
import {Channel} from "../../network/channel";
import {Component, HideableComponent, MultiComponent} from "../component";
import * as P from "../../protocol/game";
import {HiddenResource, Resource} from "../resource";
import {PacketContainer} from "../../protocol/packet";

export class HostNetworkSystem implements System {
    readonly ecs: EcsTracker;
    private channel: Channel;

    private entitySpawning?: number;
    private entityDespawning?: number;

    private connectedClients = 0;

    isEnabled = false;

    constructor(ecs: EcsTracker, ch: Channel) {
        this.ecs = ecs;
        this.channel = ch;

        this.channel.eventEmitter.on('_device_join', this.onDeviceJoin, this);
        this.channel.eventEmitter.on('_device_left', this.onDeviceLeft, this);
        this.ecs.events.on('entity_spawn', this.onEntitySpawn, this);
        this.ecs.events.on('entity_spawned', this.onEntitySpawned, this);
        this.ecs.events.on('entity_despawn', this.onEntityDespawn, this);
        this.ecs.events.on('entity_despawned', this.onEntityDespawned, this);
        this.ecs.events.on('component_add', this.onComponentAdd, this);
        this.ecs.events.on('component_edit', this.onComponentEdit, this);
        this.ecs.events.on('component_removed', this.onComponentRemoved, this);
        this.ecs.events.on('resource_add', this.onResourceAdd, this);
        this.ecs.events.on('resource_edit', this.onResourceEdit, this);
        this.ecs.events.on('resource_remove', this.onResourceRemove, this);
    }

    // ---------------------------------- EVENT LISTENERS ----------------------------------

    private onDeviceJoin(chId: number): void {
        this.connectedClients++;
        this.isEnabled = true;
        this.channel.send({
            type: "ecs_bootstrap",
            payload: this.ecs.serializeClient(),
        } as P.EcsBootrstrap, chId);
    }

    private onDeviceLeft(chId: number): void {
        this.connectedClients--;
        this.isEnabled = this.connectedClients !== 0;
    }

    private onEntitySpawn(entity: number): void {
        this.entitySpawning = entity;
    }

    private onEntitySpawned(entity: number): void {
        if (entity !== this.entitySpawning && !this.ecs.isDeserializing) {
            this.entitySpawning = undefined;
            throw 'Invalid entity spawn';
        }
        this.entitySpawning = undefined;

        if (!this.isEnabled || this.shouldIgnoreEntity(entity)) return;

        this.channel.broadcast(this.createEntitySpawnPacket(entity));
    }

    private onEntityDespawn(entity: number): void {
        if (!this.isEnabled || this.shouldIgnoreEntity(entity)) return;

        this.entityDespawning = entity;
        this.channel.broadcast({
            type: "entity_despawn",
            entityId: entity,
        } as P.EntityDespawn);
    }

    private onEntityDespawned(entity: number): void {
        this.entityDespawning = undefined;
    }

    private onComponentAdd(component: Component): void {
        if (this.entitySpawning === component.entity || !this.isEnabled) return;

        if (component.type === 'host_hidden') {
            this.channel.broadcast({
                type: "entity_despawn",
                entityId: component.entity,
            } as P.EntityDespawn);
            return;
        }

        if (this.shouldIgnoreComponent(component)) return;
        
        this.channel.broadcast({
            type: "component_add",
            entityId: component.entity,
            payload: processComponent(component),
        } as P.ComponentAdd);
    }

    private onComponentEdit(component: Component, changes: any): void {
        if (!this.isEnabled || this.shouldIgnoreEntity(component.entity)) return;

        if (changes.clientVisible === true && (component as HideableComponent).clientVisible === false) {
            let finishedComponent = Object.assign({}, component, changes);
            this.channel.broadcast({
                type: "component_add",
                entityId: component.entity,
                payload: processComponent(finishedComponent),
            } as P.ComponentAdd);
            return;
        } else if (changes.clientVisible === false && (component as HideableComponent).clientVisible !== false) {
            this.channel.broadcast({
                type: "component_remove",
                entityId: component.entity,
                compType: component.type,
                multiId: (component as MultiComponent).multiId,
            } as P.ComponentRemove);
            return;
        }

        if ((component as HideableComponent).clientVisible === false) return;

        this.channel.broadcast({
            type: "component_edit",
            entityId: component.entity,
            compType: component.type,
            multiId: (component as MultiComponent).multiId,
            changes: changes,
        } as P.ComponentEdit);
    }

    private onComponentRemoved(component: Component): void {
        if (this.entityDespawning === component.entity || !this.isEnabled) return;

        if (component.type === 'host_hidden') {
            if (this.entityDespawning === component.entity) return
            this.channel.broadcast(this.createEntitySpawnPacket(component.entity));
            return;
        }

        if (this.shouldIgnoreComponent(component)) return;

        this.channel.broadcast({
            type: "component_remove",
            entityId: component.entity,
            compType: component.type,
            multiId: (component as MultiComponent).multiId,
        } as P.ComponentRemove);
    }

    private onResourceAdd(resource: Resource): void {
        if (!this.isEnabled || (resource as HiddenResource)._clientHide === true) return;

        this.channel.broadcast({
            type: "resource_add",
            payload: removePrivate(resource),
        } as P.ResourceAdd);
    }

    private onResourceEdit(resource: Resource): void {
        if (!this.isEnabled || (resource as HiddenResource)._clientHide === true) return;

        this.channel.broadcast({
            type: "resource_remove",
            resType: resource.type,
        } as P.ResourceRemove);
    }

    private onResourceRemove(resource: Resource, changes: any): void {
        if (!this.isEnabled || (resource as HiddenResource)._clientHide === true) return;

        this.channel.broadcast({
            type: "resource_edit",
            resType: resource.type,
            changes: changes
        } as P.ResourceEdit);
    }

    // ---------------------------------- UTILS ----------------------------------

    private shouldIgnoreComponent(component: Component): boolean {
        return this.shouldIgnoreEntity(component.entity) || ((component as HideableComponent).clientVisible === false) || component.type.startsWith('host_')
    }

    private shouldIgnoreEntity(entity: number): boolean {
        return this.ecs.hasAllComponents(entity, 'host_hidden');
    }

    private createEntitySpawnPacket(entity: number): P.EntitySpawn {
        let components = this.ecs.getAllComponents(entity);

        let comps = [];

        for (let comp of components) {
            if (comp.type.startsWith('host_')) continue;
            if ((comp as HideableComponent).clientVisible === false) continue;
            comps.push(processComponent(comp));
        }

        return {
            type: "entity_spawn",
            entityId: entity,
            components: comps,
        } as P.EntitySpawn;
    }



    destroy(): void {
    }

}

export class ClientNetworkSystem implements System {
    readonly ecs: EcsTracker;
    private channel: Channel;

    constructor(ecs: EcsTracker, channel: Channel) {
        this.ecs = ecs;
        this.channel = channel;

        channel.eventEmitter.on('ecs_bootstrap', this.onEcsBootstrap, this);
        channel.eventEmitter.on('entity_spawn', this.onEntitySpawn, this);
        channel.eventEmitter.on('entity_despawn', this.onEntityDespawn, this);
        channel.eventEmitter.on('component_add', this.onComponentAdd, this);
        channel.eventEmitter.on('component_edit', this.onComponentEdit, this);
        channel.eventEmitter.on('component_remove', this.onComponentRemove, this);
        channel.eventEmitter.on('resource_add', this.onResourceAdd, this);
        channel.eventEmitter.on('resource_edit', this.onResourceEdit, this);
        channel.eventEmitter.on('resource_remove', this.onResourceRemove, this);
    }

    private onEcsBootstrap(packet: P.EcsBootrstrap, container: PacketContainer): void {
        if (container.sender !== 0) return; // Only admin

        this.ecs.deserialize(packet.payload);
    }

    private onEntitySpawn(packet: P.EntitySpawn, container: PacketContainer): void {
        if (container.sender !== 0) return; // Only admin

        this.ecs.spawnEntityManual(packet.entityId, packet.components);
    }

    private onEntityDespawn(packet: P.EntityDespawn, container: PacketContainer): void {
        if (container.sender !== 0) return; // Only admin

        this.ecs.despawnEntity(packet.entityId);
    }

    private onComponentAdd(packet: P.ComponentAdd, container: PacketContainer): void {
        if (container.sender !== 0) return; // Only admin

        this.ecs.addComponent(packet.entityId, packet.payload);
    }

    private onComponentEdit(packet: P.ComponentEdit, container: PacketContainer): void {
        if (container.sender !== 0) return; // Only admin

        this.ecs.editComponent(packet.entityId, packet.compType, packet.changes, packet.multiId);
    }

    private onComponentRemove(packet: P.ComponentRemove, container: PacketContainer): void {
        if (container.sender !== 0) return; // Only admin

        let comp = this.ecs.getComponent(packet.entityId, packet.compType, packet.multiId);
        if (comp !== undefined) this.ecs.removeComponent(comp);
    }

    private onResourceAdd(packet: P.ResourceAdd, container: PacketContainer): void {
        if (container.sender !== 0) return; // Only admin

        this.ecs.addResource(packet.payload);
    }

    private onResourceEdit(packet: P.ResourceEdit, container: PacketContainer): void {
        if (container.sender !== 0) return; // Only admin

        this.ecs.editResource(packet.resType, packet.changes);
    }

    private onResourceRemove(packet: P.ResourceRemove, container: PacketContainer): void {
        if (container.sender !== 0) return; // Only admin

        this.ecs.removeResource(packet.resType);
    }

    destroy(): void {
    }

}

function processComponent(comp: Component): any {
    let res = {} as any;
    for (let name in comp) {
        if (name[0] === '_' || name === 'entity' || name === 'clientVisible') continue;
        res[name] = (comp as any)[name];
    }
    return res;
}

function removePrivate(x: any): any {
    let out = {} as any;

    for (let name in x) {
        if (name[0] === '_') continue;
        out[name] = x[name];
    }

    return out;
}