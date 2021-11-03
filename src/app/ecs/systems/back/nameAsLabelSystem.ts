import {System} from "../../system";
import {World} from "../../world";
import {MultiEcsStorage, SingleEcsStorage} from "../../storage";
import {ElementType, GRAPHIC_TYPE, GraphicComponent, PointElement, TextElement, VisibilityType, DisplayElement} from "../../../graphics";
import { Component, NameComponent, NAME_TYPE } from "../../component";
import { IPointData } from "pixi.js";
import { Resource } from "../../resource";
import { LocalLightSettings, LOCAL_LIGHT_SETTINGS_TYPE } from "../lightSystem";


export interface NameAsLabelComponent extends Component {
    type: NAME_AS_LABEL_TYPE;
    initialOffset: IPointData;
}

export const NAME_AS_LABEL_TYPE = 'name_as_label';
export type NAME_AS_LABEL_TYPE = typeof NAME_AS_LABEL_TYPE;
export class NameAsLabelSystem implements System {
    readonly name = NAME_AS_LABEL_TYPE;
    readonly dependencies = [GRAPHIC_TYPE];

    private world: World;

    readonly storage = new SingleEcsStorage<NameAsLabelComponent>(NAME_AS_LABEL_TYPE, false, false);

    private isMasterView: boolean = true;

    constructor(world: World) {
        this.world = world;

        world.addStorage(this.storage);
        world.events.on('component_add', this.onComponentAdd, this);
        world.events.on('component_edited', this.onComponentEdited, this);
        world.events.on('component_removed', this.onComponentRemoved, this);
        world.events.on('resource_edited', this.onResourceEdited, this);
    }

    private onComponentAdd(c: Component): void {
        if (c.type === NAME_AS_LABEL_TYPE) {
            this.updateElement(c as NameAsLabelComponent);
        } else if (c.type === NAME_TYPE) {
            const comp = this.storage.getComponent(c.entity);
            if (comp !== undefined) this.updateElement(comp);
        }
    }

    private onComponentEdited(c: Component): void {
        if (c.type === NAME_AS_LABEL_TYPE) {
            this.updateElement(c as NameAsLabelComponent);
        } else if (c.type === NAME_TYPE) {
            const comp = this.storage.getComponent(c.entity);
            if (comp !== undefined) this.updateElement(comp);
        }
    }

    private onComponentRemoved(c: Component): void {
        if (c.type === NAME_AS_LABEL_TYPE) {
            if (this.world.isDespawning.includes(c.entity)) return;
            const g = this.world.getComponent(c.entity, GRAPHIC_TYPE) as GraphicComponent;
            if (g === undefined) return;
            for (let elem of (g.display.children || [])) {
                if (elem.tag !== 'name') continue;
                if (g.display._childrenRemove === undefined) g.display._childrenRemove = [];
                g.display._childrenRemove.push(elem);
                break;
            }
        } else if (c.type === NAME_TYPE) {
            const comp = this.storage.getComponent(c.entity);
            if (comp !== undefined) this.updateElement(comp);
        }
    }

    private onResourceEdited(res: Resource, edited: any) {
        if (res.type === LOCAL_LIGHT_SETTINGS_TYPE && 'visionType' in edited) {
            this.isMasterView = (res as LocalLightSettings).visionType !== 'rp';
            for (let c of this.storage.allComponents()) {
                this.updateElement(c);
            }
        }
    }

    updateElement(c: NameAsLabelComponent): void {
        let dis = this.world.getComponent(c.entity, GRAPHIC_TYPE) as GraphicComponent;
        if (dis === undefined) {
            console.warn("Error, found text_as_label component on an element withot a graphic type," +
                         "please first create your graphic type, then add a text_as_label component");
            dis = {
                type: GRAPHIC_TYPE,
                display: {
                    type: ElementType.CONTAINER,
                    ignore: false,
                    priority: 0,
                },
                interactive: false,
            } as GraphicComponent;
            this.world.addComponent(c.entity, dis);
        }
        const nameStorage = this.world.getStorage(NAME_TYPE) as MultiEcsStorage<NameComponent>;
        let compositeName = '';
        for (let name of nameStorage.getComponents(c.entity)) {
            if (name.name === '') continue;
            if (!this.isMasterView && name.clientVisible === false) continue;
            if (compositeName !== '') compositeName += '\n';
            compositeName += name.name;
        }
        this.updateElement0(c, dis, compositeName);
    }

    private updateElement0(e: NameAsLabelComponent, graphic: GraphicComponent, names: string): void {
        const display = graphic.display;

        let elem: TextElement | undefined = undefined;

        // Search element
        for (let c of (display.children || [])) {
            if (c.type === ElementType.TEXT && c.tag === 'name') {
                elem = c as TextElement;
                break;
            }
        }
        // Or create one
        if (elem === undefined) {
            elem = {
                type: ElementType.TEXT,
                tag: 'name',
                ignore: false,
                priority: 0,
                color: 0,
                visib: VisibilityType.NORMAL,
                text: '',
                anchor: { x: 0.5, y: 1 },
                lineAlign: 'center',
            } as TextElement;
            if (display._childrenAdd === undefined) display._childrenAdd = [];
            display._childrenAdd.push(elem);
        }
        elem.offset = e.initialOffset;

        elem.text = names;
        this.world.editComponent(graphic.entity, graphic.type, { display: graphic.display }, undefined, false);
    }

    enable(): void {
        this.isMasterView = (this.world.getResource(LOCAL_LIGHT_SETTINGS_TYPE) as LocalLightSettings)?.visionType !== 'rp';
    }

    destroy(): void {
    }

}