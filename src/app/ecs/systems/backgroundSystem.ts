import {System} from "../system";
import {EcsTracker} from "../ecs";
import * as PIXI from "pixi.js";
import {DESTROY_ALL, loadTexture} from "../../util/pixi";
import {EditMapPhase} from "../../phase/editMap/editMapPhase";
import {Component, PositionComponent} from "../component";
import {SingleEcsStorage} from "../storage";
import {Rectangle} from "pixi.js";
import {EditMapDisplayPrecedence} from "../../phase/editMap/displayPrecedence";

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

    private displayMaps: PIXI.Container;

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
        let img = this.ecs.getComponent(entity, BACKGROUND_TYPE) as BackgroundImageComponent;
        if (img === undefined) return;
        img._display.tint = 0x7986CB;
    }

    onSelectionEnd(entity: number): void {
        let img = this.ecs.getComponent(entity, BACKGROUND_TYPE) as BackgroundImageComponent;
        if (img === undefined) return;
        img._display.tint = 0xFFFFFF;
    }

    findBackgroundAt(point: PIXI.Point): number | undefined {
        let rect = new Rectangle();
        for (let room of this.storage.allComponents()) {
            room._display.getLocalBounds(rect);
            rect.x += room._display.position.x;
            rect.y += room._display.position.y;
            if (rect.contains(point.x, point.y)) return room.entity;
        }
        return undefined;
    }

    enable() {
        this.displayMaps = new PIXI.Container();
        this.displayMaps.zIndex = EditMapDisplayPrecedence.BACKGROUND;

        this.phase.board.addChild(this.displayMaps);
    }

    async onEntitySpawned(entity: number): Promise<void> {
        let bkgImg = this.ecs.getComponent(entity, BACKGROUND_TYPE) as BackgroundImageComponent;
        if (bkgImg === undefined) return;
        let pos = this.ecs.getComponent(entity, 'position') as PositionComponent;
        if (pos === undefined) return;


        if (bkgImg.image.byteOffset !== 0) {
            // Copy array to remove offset (TODO: fix)
            // https://github.com/peers/peerjs/issues/715
            bkgImg.image = new Uint8Array(bkgImg.image);
        }

        let [tex, img] = await loadTexture(bkgImg.image, bkgImg.imageType);

        let sprite = new PIXI.Sprite(tex);
        sprite.position.set(pos.x, pos.y);
        (sprite as any).dndBkgImage = entity;// Save as a tag
        bkgImg._display = sprite;
        bkgImg._html = img;
        this.displayMaps.addChild(sprite);
        console.log("Sprite added");
    }

    onComponentEdit(newCmp: Component) {
        if (newCmp.type !== 'position') return;
        let pos = newCmp as PositionComponent;
        let mapCmp = this.ecs.getComponent(newCmp.entity, BACKGROUND_TYPE) as BackgroundImageComponent;
        if (mapCmp === undefined) return;
        mapCmp._display.position.set(pos.x, pos.y);
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