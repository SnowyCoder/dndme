import {System} from "../system";
import {EcsEntityLinked, EcsTracker} from "../ecs";
import * as PIXI from "pixi.js";
import {DESTROY_ALL, loadTexture} from "../../util/pixi";
import {EditMapPhase} from "../../phase/editMap/editMapPhase";
import {Component, PositionComponent, TransformComponent} from "../component";
import {SingleEcsStorage} from "../storage";
import {Rectangle} from "pixi.js";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";
import trimCanvas = PIXI.utils.trimCanvas;

type BACKGROUND_TYPE = 'background_image';
const BACKGROUND_TYPE = 'background_image';

export interface BackgroundImageComponent extends Component {
    type: BACKGROUND_TYPE;

    image: Uint8Array;
    imageType: string;

    _display?: PIXI.Sprite;
    _html?: HTMLImageElement;
}


export class BackgroundSystem implements System {
    readonly ecs: EcsTracker;
    readonly phase: EditMapPhase;
    readonly storage: SingleEcsStorage<BackgroundImageComponent>;

    displayMaps: PIXI.Container;

    constructor(tracker: EcsTracker, phase: EditMapPhase) {
        this.ecs = tracker;
        this.phase = phase;
        this.storage = new SingleEcsStorage<BackgroundImageComponent>(BACKGROUND_TYPE);

        this.ecs.addStorage(this.storage);
        this.ecs.events.on('entity_spawned', this.onEntitySpawned, this);
        this.ecs.events.on('component_edited', this.onComponentEdit, this);
        this.ecs.events.on('component_remove', this.onComponentRemove, this);
        this.ecs.events.on('selection_begin', this.onSelectionBegin, this);
        this.ecs.events.on('selection_end', this.onSelectionEnd, this);
    }

    onSelectionBegin(entity: number): void {
        let img = this.storage.getComponent(entity);
        if (img === undefined) return;
        img._display.tint = 0x7986CB;
    }

    onSelectionEnd(entity: number): void {
        let img = this.storage.getComponent(entity);
        if (img === undefined) return;
        img._display.tint = 0xFFFFFF;
    }

    enable() {
        this.displayMaps = new PIXI.Container();
        this.displayMaps.zIndex = EditMapDisplayPrecedence.BACKGROUND;
        this.displayMaps.interactive = true;
        this.displayMaps.interactiveChildren = true;

        this.phase.board.addChild(this.displayMaps);
    }

    async onEntitySpawned(entity: number): Promise<void> {
        let bkgImg = this.storage.getComponent(entity);
        if (bkgImg === undefined) return;
        let pos = this.ecs.getComponent(entity, 'position') as PositionComponent;
        if (pos === undefined) return;

        let transform = this.ecs.getComponent(entity, 'transform') as TransformComponent;
        if (transform === undefined) {
            transform = {
                type: "transform",
                entity: -1,
                rotation: 0,
            } as TransformComponent;
            this.ecs.addComponent(entity, transform);
        }


        if (bkgImg.image.byteOffset !== 0) {
            // Copy array to remove offset (TODO: fix)
            // https://github.com/peers/peerjs/issues/715
            bkgImg.image = new Uint8Array(bkgImg.image);
        }

        let [tex, img] = await loadTexture(bkgImg.image, bkgImg.imageType);

        let sprite = new PIXI.Sprite(tex);
        sprite.anchor.set(0.5);
        sprite.position.set(pos.x, pos.y);
        sprite.angle = transform.rotation;
        sprite.interactive = true;
        (sprite as EcsEntityLinked)._ecs_entity = entity;
        bkgImg._display = sprite;
        bkgImg._html = img;
        this.displayMaps.addChild(sprite);
        console.log("Sprite added");
    }

    onComponentEdit(newCmp: Component) {
        if (newCmp.type === 'position') {
            let pos = newCmp as PositionComponent;
            let mapCmp = this.storage.getComponent(newCmp.entity);
            if (mapCmp === undefined) return;
            mapCmp._display.position.set(pos.x, pos.y);
        } else if (newCmp.type === 'transform') {
            let pos = newCmp as TransformComponent;
            let mapCmp = this.storage.getComponent(newCmp.entity);
            if (mapCmp === undefined) return;
            mapCmp._display.angle = pos.rotation;
        }
    }

    onComponentRemove(cmp: Component) {
        if (cmp.type !== BACKGROUND_TYPE) return;
        let c = cmp as BackgroundImageComponent;
        c._display.destroy(DESTROY_ALL);
    }

    destroy(): void {
        this.displayMaps.destroy(DESTROY_ALL);
    }
}