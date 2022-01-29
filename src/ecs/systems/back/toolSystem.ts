import {System} from "../../system";
import {
    PIXI_BOARD_TYPE, PointerDownEvent,
} from "./pixiBoardSystem";
import {World} from "../../world";
import {SELECTION_TYPE} from "./selectionSystem";
import {Resource} from "../../resource";
import {FilteredPanPart, InteractPart, SelectPart} from "../../tools/inspect";
import {ToolType} from "../../tools/toolType";
import {MeasureToolPart} from "../../tools/measure";
import { KeyboardResource, KEYBOARD_TYPE } from "./keyboardSystem";
import SafeEventEmitter, { PRIORITY_DISABLED } from "../../../util/safeEventEmitter";
import { StandardToolbarOrder } from "@/phase/editMap/standardToolbarOrder";

import EntityInspectComponent from "@/ui/ecs/EntityInspect.vue";
import CreationOptionsComponent from "@/ui/edit/CreationOptions.vue";
import ToolBarEntry from "@/ui/edit/toolbar/ToolBarEntry.vue";
import ToolBarEntryInspect from "@/ui/edit/toolbar/ToolBarEntryInspect.vue";
import { SIDEBAR_TYPE, ToolbarItemComponent, TOOLBAR_ITEM_TYPE } from "../toolbarSystem";

import { VueComponent } from "@/ui/vue";

export interface ToolPart {
    readonly name: string;

    initialize(events: SafeEventEmitter): void;
    destroy(): void;

    onEnable(): void;
    onDisable(): void;
}

export interface ToolResource extends Resource {
    type: TOOL_TYPE;
    _save: true;
    _sync: false;

    tool?: string;
}

export type CustomToolbarEntry = {
    icon: string | VueComponent,
    title: string,
    priority?: number,
    customClass?: {
        color?: string,
        name?: string,
        activeName?: string,
    },
} | {
    customElement: VueComponent,
    priority?: number,
    customProps?: object,
};

export interface Tool {
    parts: Array<string>;
    sideBar?: VueComponent;
    sideBarProps?: object;
    // Not necessary, but if provided will create toolbar icon automatically
    toolbarEntry?: CustomToolbarEntry,
}

export interface CreationToolOptions {
    name: string;
    parts: Array<string>;
    additionalOptions?: VueComponent;
    toolbarEntry?: CustomToolbarEntry;
}

export const TOOL_TYPE = 'tool';
export type TOOL_TYPE = typeof TOOL_TYPE;
export class ToolSystem implements System {
    readonly name = TOOL_TYPE;
    readonly dependencies = [SELECTION_TYPE];
    readonly optionalDependencies = [PIXI_BOARD_TYPE, KEYBOARD_TYPE];

    private readonly world: World;
    private initialized: boolean = false;
    private populated: boolean = false;

    subEvents = new SafeEventEmitter();

    standardTool: ToolType = ToolType.INSPECT;
    parts = new Map<string, ToolPart>();
    tools = new Map<string, Tool>();
    currentToolName?: string;
    currentTool: Tool | undefined;

    constructor(world: World) {
        this.world = world;
        world.addResource({
            type: TOOL_TYPE,
            _save: true,
            _sync: false,

            tool: undefined,
        } as ToolResource);

        const events = world.events;
        events.on('resource_edited', this.onResourceEdited, this);
        events.on('populate', this.onPopulate, this);

        const keyboard = this.world.getResource(KEYBOARD_TYPE) as KeyboardResource | undefined;

        this.addToolPart(new FilteredPanPart(world, 'click_pan', () => true));
        this.addToolPart(new FilteredPanPart(world, 'space_pan', () => !!keyboard?.pressedKeys?.has(' ')));
        this.addToolPart(new FilteredPanPart(world, 'touch_pan', (w: World, e: PointerDownEvent) => {
            return (e.originalEvent as PointerEvent).pointerType !== "mouse" || !this.world.isMaster;
        }));
        this.addToolPart(new InteractPart(world));
        this.addToolPart(new SelectPart(world));
        this.addToolPart(new MeasureToolPart(world));
        this.addToolPart(new FlagToolPart('creation_flag'));

        this.addTool(ToolType.INSPECT, {
            parts: ['space_pan', 'select', 'touch_pan', 'interact'],
            sideBar: EntityInspectComponent,
            toolbarEntry: {
                customElement: ToolBarEntryInspect,
                priority: StandardToolbarOrder.INSPECT,
            },
        });
        this.addTool(ToolType.MEASURE, {
            parts: ['space_pan', 'interact', 'measure'],
            toolbarEntry: {
                icon: 'fas fa-ruler',
                title: 'Measure',
                priority: StandardToolbarOrder.MEASURE,
            },
        });
    }

    addToolPart(tool: ToolPart): void {
        this.parts.set(tool.name, tool);
        if (this.initialized) {
            console.warn("Adding tool part after initialization");
            tool.initialize(this.subEvents);
        }
    }

    addTool(name: string, tool: Tool): void {
        tool.parts = [...tool.parts];
        for (let part of tool.parts) {
            if (!this.parts.has(part)) {
                console.warn("Cannot find part " + part);
            }
        }
        this.tools.set(name, tool);
        this.spawnToolIcon(name, tool);
    }

    addCreationTool(options: CreationToolOptions) {
        this.addTool(options.name, {
            parts: options.parts.concat('creation_flag'),
            toolbarEntry: options.toolbarEntry,
            sideBar: CreationOptionsComponent,
            sideBarProps: {
                additionalOptions: options.additionalOptions,
            },
        });
    }

    addToolAsCopy(name: string, original: string, changes?: Partial<Tool>): void {
        if (changes === undefined) {
            changes = {};
        }
        const tool = this.tools.get(original);
        if (tool === undefined) throw new Error("Original tool not found");
        this.addTool(name, Object.assign({}, tool, changes));
    }

    isToolPartEnabled(name: string): boolean {
        return this.currentTool?.parts.includes(name) || false;
    }

    private spawnToolIcon(toolName: string, tool: Tool) {
        if (tool.toolbarEntry === undefined || !this.populated) return;

        let icon;
        let iconProps;
        if ('customElement' in tool.toolbarEntry) {
            icon = tool.toolbarEntry.customElement;
            iconProps = tool.toolbarEntry.customProps ?? {};
        } else {
            icon = ToolBarEntry;
            iconProps = Object.assign(tool.toolbarEntry, { toolName });
        }

        this.world.spawnEntity({
            type: TOOLBAR_ITEM_TYPE,
            priority: tool.toolbarEntry.priority ?? 0,
            icon, iconProps,
        } as ToolbarItemComponent);
    }

    private onPopulate() {
        this.populated = true;
        for (let [name, tool] of this.tools) {
            this.spawnToolIcon(name, tool);
        }
    }

    private onResourceEdited(r: Resource, edited: any): void {
        if (r.type === TOOL_TYPE) {
            let ct = r as ToolResource;

            let toolName = ct.tool || this.standardTool;

            let tool = this.tools.get(toolName);
            if (tool === undefined) {
                console.warn("Unregistered tool requested: " + ct.tool);
                toolName = this.standardTool;
                tool = this.tools.get(this.standardTool)!;
            }

            if (toolName === this.currentToolName) {
                return;
            }

            console.log("Changing tool from " + (this.currentToolName || 'none')  + " to " + toolName);
            this.currentToolName = toolName;

            // Disable all old parts
            for (let x of this.parts.values()) {
                const oldEnabled = this.currentTool?.parts.includes(x.name) || false;
                const newEnable = tool.parts.includes(x.name);

                if (oldEnabled && !newEnable) {
                    x.onDisable();
                }
            }
            // Enable all new parts
            for (let x of this.parts.values()) {
                const oldEnabled = this.currentTool?.parts.includes(x.name) || false;
                const newEnable = tool.parts.includes(x.name);

                if (!oldEnabled && newEnable) {
                    x.onEnable();
                }
            }
            // Reorder events
            const order = tool.parts.map((x) => this.parts.get(x)).reverse();
            this.subEvents.reorderObjects(order, PRIORITY_DISABLED);

            // Change Sidebar
            this.world.editResource(SIDEBAR_TYPE, {
                current: tool.sideBar,
                currentProps: tool.sideBarProps,
            });
            this.currentTool = tool;
        }
    }

    enable(): void {
        this.initialized = true;

        this.world.events.addChild(this.subEvents);
        for (let part of this.parts.values()) {
            part.initialize(this.subEvents);
        }

        if (this.currentToolName === undefined) {
            this.world.editResource(TOOL_TYPE, {
                tool: this.standardTool,
            });
        }
    }

    destroy(): void {
        for (let part of this.parts.values()) {
            part.destroy();
        }
        this.world.events.removeChild(this.subEvents);
    }
}

export class FlagToolPart implements ToolPart {
    readonly name: string;
    constructor(name: string) {
        this.name = name;
    }
    initialize(events: SafeEventEmitter): void {
    }
    destroy(): void {
    }
    onEnable(): void {
    }
    onDisable(): void {
    }
}
