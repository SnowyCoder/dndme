import {System} from "../system";
import {World} from "../world";
import {SingleEcsStorage} from "../storage";
import {Component} from "../component";
import { Resource } from "../resource";
import { VueComponent } from "@/ui/vue";
import { isMobile } from "pixi.js";


export const TOOLBAR_ITEM_TYPE = 'toolbar_item';
export type TOOLBAR_ITEM_TYPE = typeof TOOLBAR_ITEM_TYPE;
export interface ToolbarItemComponent extends Component {
    type: TOOLBAR_ITEM_TYPE;
    priority: number;

    icon: VueComponent;
    iconProps: any;
}

export const SIDEBAR_TYPE = 'sidebar';
export type SIDEBAR_TYPE = typeof SIDEBAR_TYPE;

export interface SidebarResource extends Resource {
    type: SIDEBAR_TYPE;
    open: boolean;
    current: VueComponent | undefined;
    currentProps: any;

    _save: false;
    _sync: false;
}


export const TOOLBAR_TYPE = 'toolbar';
export type TOOLBAR_TYPE = typeof TOOLBAR_TYPE;

export class ToolbarSystem implements System {
    readonly world: World;
    readonly name = TOOLBAR_TYPE;
    readonly dependencies = [];

    storage = new SingleEcsStorage<ToolbarItemComponent>(TOOLBAR_ITEM_TYPE, false, false);

    constructor(ecs: World) {
        this.world = ecs;

        this.world.addStorage(this.storage);
        this.world.addResource({
            type: SIDEBAR_TYPE,
            open: !isMobile.phone,
            current: undefined,
            currentProps: {},
            _save: false,
            _sync: false,
        } as SidebarResource, 'ignore');
    }

    enable(): void {
    }

    destroy(): void {
    }
}
