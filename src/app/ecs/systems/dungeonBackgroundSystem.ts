import {System} from "../system";
import {EcsTracker} from "../ecs";
import {aabbAabbIntersect} from "../../util/geometry";
import {CustomRoomComponent} from "./roomSystem";
import {Component, PositionComponent, RoomComponent} from "../component";
import {BackgroundImageComponent} from "./backgroundSystem";
import {FlagEcsStorage, SingleEcsStorage} from "../storage";
import {Channel} from "../../network/channel";
import {RoomMapDraw} from "../../protocol/game";
import * as PIXI from "pixi.js";
import {app} from "../../index";
import {DESTROY_ALL, loadTexture} from "../../util/pixi";
import {PacketContainer} from "../../protocol/packet";
import {ClientEditMapPhase} from "../../phase/editMap/clientEditMapPhase";


export class HostDungeonBackgroundSystem implements System {
    readonly ecs: EcsTracker;
    readonly channel: Channel;

    roomKnownStorage: FlagEcsStorage;

    constructor(ecs: EcsTracker, channel: Channel) {
        this.ecs = ecs;
        this.channel = channel;
        this.channel.eventEmitter.on('_device_join', this.onDeviceJoin, this);

        this.roomKnownStorage = new FlagEcsStorage('host_room_known');
        this.ecs.addStorage(this.roomKnownStorage);


        this.ecs.events.on('entity_spawned', this.onEntitySpawned, this);
        this.ecs.events.on('component_add', this.onComponentAdd, this);
        this.ecs.events.on('component_edit', this.onComponentEdit, this);
        this.ecs.events.on('component_remove', this.onComponentRemove, this);
    }

    private async onDeviceJoin(devid: number) {
        let posStorage = this.ecs.storages.get('position') as SingleEcsStorage<PositionComponent>;

        let minX = Infinity, minY = Infinity;

        let rooms = [];

        for (let room of this.roomKnownStorage.allComponents()) {
            rooms.push(room.entity);
            let pos = posStorage.getComponent(room.entity);

            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
        }

        if (rooms.length === 0) return ;
        let blob = await this.cutRoomImage(rooms);

        if (blob === null) return;
        let arrayBuffer = await blob.arrayBuffer();

        this.channel.send({
            type: "room_map_draw",
            map: arrayBuffer,
            mapType: 'image/png',
            mapX: minX,
            mapY: minY,
        } as RoomMapDraw, devid);
    }

    private onEntitySpawned(entity: number): void {
        let room = this.ecs.getComponent(entity, 'room') as RoomComponent;
        if (room === undefined || !room.visible) return;
        if (this.ecs.hasAllComponents(entity, 'host_hidden') || this.ecs.hasAllComponents(entity, 'host_room_known')) return;
        this.ecs.addComponent(entity, {
            type: 'host_room_known'
        } as Component);
    }

    private async onComponentAdd(comp: Component) {
        if (comp.type === 'host_hidden') {
            let knowComp = this.roomKnownStorage.getComponent(comp.entity);
            if (knowComp !== undefined) this.ecs.removeComponent(knowComp);
            // The room entity is hidden, making the client forget it
        } else if (comp.type === 'host_room_known') {
            if (this.channel.connections.length === 0) return;
            let image = await this.cutRoomImage([comp.entity]);
            if (image === null) return;
            let arrayBuffer = await image.arrayBuffer();

            let pos = this.ecs.getComponent(comp.entity, 'position') as PositionComponent;

            this.channel.broadcast({
                type: "room_map_draw",
                map: arrayBuffer,
                mapType: 'image/png',
                mapX: pos.x,
                mapY: pos.y,
            } as RoomMapDraw);
        }
    }

    private async onComponentEdit(comp: Component, changes: any) {
        if (comp.type === 'room') {
            if (changes['visible'] === true && this.roomKnownStorage.getComponent(comp.entity) === undefined) {
                this.ecs.addComponent(comp.entity, {
                    type: 'host_room_known'
                } as Component);
            }
        } else if (comp.type == 'position' && this.roomKnownStorage.getComponent(comp.entity) !== undefined) {
            // move the room window?
        }
    }

    private async onComponentRemove(comp: Component) {
        if (comp.type === 'host_hidden') {
            let room = this.ecs.getComponent(comp.entity, 'room') as RoomComponent;
            if (room !== undefined && room.visible) {
                this.ecs.addComponent(comp.entity, {
                    type: 'host_room_known'
                } as Component);
            }
        }
    }


    private cutRoomImage(rooms: number[]): Promise<Blob | null> {
        let roomStorage = this.ecs.storages.get('room') as SingleEcsStorage<CustomRoomComponent>;
        let imgStorage = this.ecs.storages.get('background_image') as SingleEcsStorage<BackgroundImageComponent>;
        let posStorage = this.ecs.storages.get('position') as SingleEcsStorage<PositionComponent>;

        // Find rooms AABB
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (let roomid of rooms) {
            let room = roomStorage.getComponent(roomid);
            let p = posStorage.getComponent(roomid);

            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);

            let polLen = room.polygon.length;
            for (let i = 0; i < polLen; i += 2) {
                maxX = Math.max(maxX, room._worldPolygon[i] + p.x);
                maxY = Math.max(maxY, room._worldPolygon[i + 1] + p.y);
            }
        }

        let usedImages = [];

        for (let image of imgStorage.getComponents()) {
            let elem = image._html;
            let pos = posStorage.getComponent(image.entity);

            if (aabbAabbIntersect(minX, minY, maxX, maxY, pos.x, pos.y, pos.x + elem.width, pos.y + elem.height)) {
                usedImages.push(image);
            }
        }

        if (usedImages.length === 0) return Promise.resolve(null);

        let canvas = document.createElement('canvas');
        canvas.width = maxX - minX;
        canvas.height = maxY - minY;
        let ctx = canvas.getContext('2d');

        ctx.beginPath();
        for (let roomid of rooms) {
            let room = roomStorage.getFirstComponent(roomid) as RoomComponent;
            ctx.moveTo(room._worldPolygon[0] - minX, room._worldPolygon[1] - minY);
            let polLen = room.polygon.length;
            for (let i = 2; i < polLen; i += 2) {
                ctx.lineTo(room._worldPolygon[i] - minX, room._worldPolygon[i + 1] - minY);
            }
            ctx.closePath();
        }
        ctx.clip();


        for (let img of usedImages) {
            let pos = posStorage.getComponent(img.entity);
            let elem = img._html;

            let clipX = pos.x + minX;
            let clipY = pos.y + minY;
            let width = Math.min(maxX, pos.x + elem.width) - minX;
            let height = Math.min(maxY, pos.y + elem.height) - minY;

            ctx.drawImage(elem,
                clipX, clipY,
                width, height,
                0, 0,
                width, height
            );
        }

        return new Promise<Blob>(resolve => {
            canvas.toBlob(resolve);
        });
    }

    destroy(): void {
        this.channel.eventEmitter.off('_device_join', this.onDeviceJoin, this);
    }
}

export class ClientDungeonBackgroundSystem implements System {
    private phase: ClientEditMapPhase;
    readonly ecs: EcsTracker;
    readonly channel: Channel;

    private displayMap: PIXI.Sprite;
    private displayMapTex?: PIXI.Texture;

    constructor(phase: ClientEditMapPhase, channel: Channel) {
        this.phase = phase;
        this.ecs = phase.ecs;
        this.channel = channel;

        this.displayMap = new PIXI.Sprite(PIXI.Texture.EMPTY);
        this.displayMapTex = undefined;

        this.ecs.events.on('component_remove', this.onComponentRemove, this);
        channel.eventEmitter.on('room_map_draw', this.onRoomMapDraw, this);
    }

    // TODO: forget

    private onComponentRemove(comp: Component) {
        if (comp.type !== 'room') return;

        this.forget([comp.entity]);
    }

    private async onRoomMapDraw(packet: RoomMapDraw, container: PacketContainer) {
        if (container.sender !== 0) return; // Only admin

        let [tex] = await loadTexture(packet.map, packet.mapType);
        this.addPartialImage(packet.mapX, packet.mapY, tex);
    }

    forget(rooms: number[]) {
        if (this.displayMapTex === undefined) return;

        let roomStorage = this.ecs.storages.get('room') as SingleEcsStorage<RoomComponent>;

        let clearImg = new PIXI.Graphics();

        clearImg.lineStyle(3);
        for (let roomid of rooms) {
            let room = roomStorage.getComponent(roomid);

            clearImg.beginFill();
            clearImg.drawPolygon(room._worldPolygon);
            clearImg.endFill();
        }

        clearImg.blendMode = PIXI.BLEND_MODES.ERASE;


        let mapPos = this.displayMap.position;

        let container = new PIXI.Container();
        container.filters = [new PIXI.filters.AlphaFilter()];
        container.position.set(-mapPos.x, -mapPos.y);

        let dmap = new PIXI.Sprite(this.displayMapTex);
        dmap.position.copyFrom(mapPos);

        container.addChild(dmap);
        container.addChild(clearImg);

        let targetTex = PIXI.RenderTexture.create({
            width: this.displayMapTex.width,
            height: this.displayMapTex.height,
            scaleMode: PIXI.SCALE_MODES.LINEAR,
        });


        app.renderer.render(container, targetTex);

        // Swap textures
        this.displayMap.texture = targetTex;

        if (this.displayMapTex !== undefined) {
            this.displayMapTex.destroy(true);
        }
        this.displayMapTex = targetTex;
    }

    addPartialImage(x: number, y: number, image: PIXI.Texture) {
        let newRoomTex = new PIXI.Sprite(image);
        let dmap = new PIXI.Sprite(this.displayMapTex);
        dmap.x = this.displayMap.x;
        dmap.y = this.displayMap.y;

        newRoomTex.position.set(x, y);

        // render texture AABB = polygon AABB + map AABB
        // If we're adding a new part of the map then it's quite probable that we'll need to allocate a bigger texture
        let mapX = this.displayMap.x;
        let mapY = this.displayMap.y;
        let allocMinX;
        let allocMinY;
        let firstImg = this.displayMapTex === undefined;
        if (this.displayMapTex !== undefined) {
            allocMinX = Math.min(x, mapX);
            allocMinY = Math.min(y, mapY);
        } else {
            allocMinX = x;
            allocMinY = y;
        }
        let allocMaxX = Math.max(x + image.width, mapX + this.displayMap.width);
        let allocMaxY = Math.max(y + image.height, mapY + this.displayMap.height);

        let targetTex = PIXI.RenderTexture.create({
            width: Math.ceil(allocMaxX - allocMinX),
            height: Math.ceil(allocMaxY - allocMinY),
            scaleMode: PIXI.SCALE_MODES.LINEAR,
        });

        let container = new PIXI.Container();
        container.addChild(newRoomTex);
        container.addChild(dmap);
        // Tex2 = Tex1 + Room
        //console.log(x, y, allocMinX, allocMinY);
        container.position.set(-allocMinX, -allocMinY);

        app.renderer.render(container, targetTex);

        // Swap textures
        this.displayMap.texture = targetTex;
        this.displayMap.x = allocMinX;
        this.displayMap.y = allocMinY;

        if (this.displayMapTex !== undefined) {
            this.displayMapTex.destroy(true);
        }
        this.displayMapTex = targetTex;

        // Cleanup
        container.destroy({
            children: false,
            texture: true,
            baseTexture: true
        });
        dmap.destroy({
            children: false,
            texture: false,
            baseTexture: false,
        });
        newRoomTex.destroy(DESTROY_ALL);
    }

    enable() {
        this.phase.board.addChild(this.displayMap);
    }

    destroy(): void {
        this.displayMap.destroy(DESTROY_ALL);
        this.channel.eventEmitter.off('room_map_draw', this.onRoomMapDraw, this);
    }
}