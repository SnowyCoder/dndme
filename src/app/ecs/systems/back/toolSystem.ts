import {System} from "../../system";
import {
    PIXI_BOARD_TYPE,
} from "./pixiBoardSystem";
import {World} from "../../world";
import {SELECTION_TYPE} from "./selectionSystem";
import {Resource} from "../../resource";
import {FilteredPanPart, InteractPart, SelectPart} from "../../tools/inspect";
import {Tool} from "../../tools/toolType";
import {MeasureToolPart} from "../../tools/measure";
import { KeyboardResource, KEYBOARD_TYPE } from "./keyboardSystem";
import SafeEventEmitter, { PRIORITY_DISABLED } from "../../../util/safeEventEmitter";

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

export const TOOL_TYPE = 'tool';
export type TOOL_TYPE = typeof TOOL_TYPE;
export class ToolSystem implements System {
    readonly name = TOOL_TYPE;
    readonly dependencies = [SELECTION_TYPE];
    readonly optionalDependencies = [PIXI_BOARD_TYPE, KEYBOARD_TYPE];

    private readonly world: World;
    private initialized: boolean = false;

    subEvents = new SafeEventEmitter();

    standardTool: Tool = Tool.INSPECT;
    parts = new Map<string, ToolPart>();
    tools = new Map<string, Array<string>>();
    currentTool?: string;
    currentParts = new Array<string>();

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

        const keyboard = this.world.getResource(KEYBOARD_TYPE) as KeyboardResource | undefined;

        this.addToolPart(new FilteredPanPart(world, 'click_pan', () => true));
        this.addToolPart(new FilteredPanPart(world, 'space_pan', () => !!keyboard?.pressedKeys?.has(' ')));
        this.addToolPart(new InteractPart(world));
        this.addToolPart(new SelectPart(world));
        this.addToolPart(new MeasureToolPart(world));
        this.addToolPart(new FlagToolPart('creation_flag'));

        this.addTool(Tool.INSPECT, ['space_pan', 'interact', 'select'])
        this.addTool(Tool.MEASURE, ['space_pan', 'interact', 'measure'])
    }

    addToolPart(tool: ToolPart): void {
        this.parts.set(tool.name, tool);
        if (this.initialized) {
            console.warn("Adding tool part after initialization");
            tool.initialize(this.subEvents);
        }
    }

    addTool(name: string, parts: Iterable<string>): void {
        let p = [...parts];
        for (let part of p) {
            if (!this.parts.has(part)) {
                console.warn("Cannot find part " + part);
            }
        }
        this.tools.set(name, p);
    }

    addToolAsCopy(name: string, original: string): void {
        const parts = this.tools.get(original);
        if (parts === undefined) throw new Error("Original tool not found");
        this.tools.set(name, parts);
    }

    isToolPartEnabled(name: string): boolean {
        return this.currentParts.includes(name);
    }

    private onResourceEdited(r: Resource, edited: any): void {
        if (r.type === TOOL_TYPE) {
            let ct = r as ToolResource;

            let toolName = ct.tool || this.standardTool;

            let parts = this.tools.get(toolName);
            if (parts === undefined) {
                console.warn("Unregistered tool requested: " + ct.tool);
                toolName = this.standardTool;
                parts = this.tools.get(this.standardTool)!;
            }

            if (toolName === this.currentTool) {
                return;
            }

            console.log("Changing tool from " + (this.currentTool || 'none')  + " to " + toolName);
            this.currentTool = toolName;

            // Disable all old parts
            for (let x of this.parts.values()) {
                const oldEnabled = this.currentParts.includes(x.name);
                const newEnable = parts.includes(x.name);

                if (oldEnabled && !newEnable) {
                    x.onDisable();
                }
            }
            // Enable all new parts
            for (let x of this.parts.values()) {
                const oldEnabled = this.currentParts.includes(x.name);
                const newEnable = parts.includes(x.name);

                if (!oldEnabled && newEnable) {
                    x.onEnable();
                }
            }
            this.currentParts = parts;
            // Reorder events
            const order = parts.map((x) => this.parts.get(x)).reverse();
            this.subEvents.reorderObjects(order, PRIORITY_DISABLED);
        }
    }

    enable(): void {
        this.initialized = true;

        this.world.events.addChild(this.subEvents);
        for (let part of this.parts.values()) {
            part.initialize(this.subEvents);
        }

        if (this.currentTool === undefined) {
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
