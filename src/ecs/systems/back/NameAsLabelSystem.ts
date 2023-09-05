import {System} from "../../System";
import {World} from "../../World";
import {MultiEcsStorage, SingleEcsStorage} from "../../Storage";
import {ElementType, GRAPHIC_TYPE, GraphicComponent, PointElement, TextElement, VisibilityType, DisplayElement} from "../../../graphics";
import { Component, NameComponent, NAME_TYPE } from "../../component";
import { LOCAL_LIGHT_SETTINGS_TYPE } from "../lightSystem";
import { IPoint } from "@/geometry/point";
import { DECLARATIVE_LISTENER_TYPE } from "./DeclarativeListenerSystem";
import { STANDARD_GRID_OPTIONS } from "@/game/grid";


export interface NameAsLabelComponent extends Component {
    type: NAME_AS_LABEL_TYPE;
    initialOffset: IPoint;
    scaleMode: 'grid' | 'raw';
    scale?: number;
}

export const NAME_AS_LABEL_TYPE = 'name_as_label';
export type NAME_AS_LABEL_TYPE = typeof NAME_AS_LABEL_TYPE;
export class NameAsLabelSystem implements System {
    readonly name = NAME_AS_LABEL_TYPE;
    readonly dependencies = [GRAPHIC_TYPE, DECLARATIVE_LISTENER_TYPE];
    readonly components?: [NameAsLabelComponent];

    private world: World;

    readonly storage = new SingleEcsStorage<NameAsLabelComponent>(NAME_AS_LABEL_TYPE, false, false);

    private isMasterView: boolean = true;
    private gridProp: number = 1;

    constructor(world: World) {
        this.world = world;

        world.addStorage(this.storage);
        const decl = world.requireSystem('declarative_listener');

        decl.onComponent(NAME_AS_LABEL_TYPE, '', (cold, cnew) => {
            if (cnew != null) {
                this.updateElement(cnew);
            } else if (cold != null) {
                if (this.world.isDespawning.includes(cold.entity)) return;
                const g = this.world.getComponent(cold.entity, GRAPHIC_TYPE);
                if (g === undefined) return;
                for (let elem of (g.display.children || [])) {
                    if (elem.tag !== 'name') continue;
                    if (g.display._childrenRemove === undefined) g.display._childrenRemove = [];
                    g.display._childrenRemove.push(elem);
                    break;
                }
            }
        });

        decl.onComponent(NAME_TYPE, '', (cold, cnew) => {
            const entity = cold?.entity ?? cnew?.entity;
            if (entity === undefined) return;
            const comp = this.storage.getComponent(entity);
            if (comp !== undefined) this.updateElement(comp);
        });

        decl.onResource(LOCAL_LIGHT_SETTINGS_TYPE, 'visionType', (_old, newVisionType) => {
            this.isMasterView = newVisionType !== 'rp';
            for (let c of this.storage.allComponents()) {
                this.updateElement(c);
            }
        });

        decl.onResource('grid', 'size', (_old, x) => {
            if (x == null) return;
            this.gridProp = x / STANDARD_GRID_OPTIONS.size;
            for (const el of this.storage.allComponents()) {
                if (el.scaleMode == 'grid') {
                    this.updateElement(el);
                }
            }
        });
    }

    updateElement(c: NameAsLabelComponent): void {
        let dis = this.world.getComponent(c.entity, GRAPHIC_TYPE);
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
                color: 0xffffff,
                visib: VisibilityType.NORMAL,
                text: '',
                anchor: { x: 0.5, y: 1 },
                lineAlign: 'center',
            } as TextElement;
            if (display._childrenAdd === undefined) display._childrenAdd = [];
            display._childrenAdd.push(elem);
        }
        elem.offset = { x: e.initialOffset.x, y: e.initialOffset.y };
        const scale = e.scale ?? 1;
        elem.offset.x *= scale;
        elem.offset.y *= scale;
        elem.scale = scale;
        if (e.scaleMode == 'grid') {
            elem.offset.x *= this.gridProp;
            elem.offset.y *= this.gridProp;
        }

        elem.text = names;
        this.world.editComponent(graphic.entity, graphic.type, { display: graphic.display }, undefined, false);
    }

    enable(): void {
        this.isMasterView = this.world.getResource(LOCAL_LIGHT_SETTINGS_TYPE)?.visionType !== 'rp';
    }

    destroy(): void {
    }

}
