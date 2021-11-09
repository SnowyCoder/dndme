import * as PIXI from "pixi.js";
import {Aabb} from "../../geometry/aabb";
import {World} from "../world";
import {INTERACTION_TYPE, InteractionSystem, shapeAabb} from "../systems/back/interactionSystem";
import {aabbSameOriginDifference} from "../../util/geometry";
import {RECTANGULAR_SELECTION_TYPE, RectangularSelectionResource} from "../resource";
import {SELECTION_TYPE, SelectionSystem} from "../systems/back/selectionSystem";
import {KEYBOARD_TYPE, KeyboardResource} from "../systems/back/keyboardSystem";
import { IPointData } from "pixi.js";

type IPoint = PIXI.IPoint;

export class RectangularSelection {
    private readonly world: World;
    private readonly selectionSys: SelectionSystem;
    private readonly keyboard: KeyboardResource;

    isActive: boolean = false;
    startPoint: IPointData = new PIXI.Point();
    endPoint: IPointData = new PIXI.Point();

    predicate: (id: number) => boolean = _ => true;
    entitiesInside = new Set<number>();
    entitiesSelected = new Set<number>();
    isMultiple: boolean = false;

    display: PIXI.Graphics;

    constructor(world: World) {
        this.world = world;
        this.keyboard = world.getResource(KEYBOARD_TYPE) as KeyboardResource;
        this.display = new PIXI.Graphics();

        this.selectionSys = world.systems.get(SELECTION_TYPE) as SelectionSystem;
    }

    begin(pos: IPointData) {
        this.entitiesSelected.clear();
        this.isActive = true;
        this.world.addResource({
            type: RECTANGULAR_SELECTION_TYPE,
            aabb: new Aabb(pos.x, pos.y, pos.x, pos.y),
            _save: false,
            _sync: false,
        } as RectangularSelectionResource, 'update');
        this.startPoint = pos;
        this.endPoint = pos;

        this.isMultiple = this.keyboard.ctrl;
        if (!this.isMultiple) {
            this.selectionSys.clear();
        }
    }


    moveEnd(pos: IPointData) {
        let added = [] as Aabb[];
        let removed = [] as Aabb[];
        aabbSameOriginDifference(this.startPoint!, this.endPoint!, pos, added, removed);

        for (let x of added) {
            this.addRect(x);
        }
        for (let x of removed) {
            this.removeRect(x);
        }
        this.endPoint = pos;

        this.world.editResource(RECTANGULAR_SELECTION_TYPE, {
            aabb: new Aabb(this.startPoint!.x, this.startPoint!.y, pos.x, pos.y),
        });
    }

    done() {
        this.isActive = false;
        this.world.removeResource(RECTANGULAR_SELECTION_TYPE);

        this.entitiesInside.clear();
        this.entitiesSelected.clear();
    }

    private onEntityEnter(id: number) {
        if (this.selectionSys.selectedEntities.has(id)) {
            return;
        }
        this.entitiesSelected.add(id);
        this.selectionSys.addEntities([id]);
    }

    private onEntityLeave(id: number) {
        if (this.entitiesSelected.delete(id)) {
            this.selectionSys.removeEntities([id]);
        }
    }


    addRect(aabb: Aabb) {
        let sys = this.world.systems.get(INTERACTION_TYPE) as InteractionSystem;
        let ents = sys.queryVisible(shapeAabb(aabb), c => {
            if (this.entitiesInside.has(c.entity)) return false;
            return this.predicate(c.entity);
        });
        for (let c of ents) {
            this.entitiesInside.add(c.entity);
            this.onEntityEnter(c.entity);
        }
    }

    removeRect(aabb: Aabb) {
        let sys = this.world.systems.get(INTERACTION_TYPE) as InteractionSystem;
        let ents = sys.queryVisible(shapeAabb(aabb), c => {
            return this.entitiesInside.has(c.entity);
        });
        for (let c of ents) {
            this.entitiesInside.delete(c.entity);
            this.onEntityLeave(c.entity);
        }
    }


}