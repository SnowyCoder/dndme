import {System} from "../system";
import {
    PIXI_BOARD_TYPE,
    PointerClickEvent,
    PointerDownEvent,
    PointerEvents,
    PointerMoveEvent,
    PointerRightDownEvent,
    PointerRightUpEvent,
    PointerUpEvent
} from "./pixiBoardSystem";
import {World} from "../world";
import {SELECTION_TYPE} from "./selectionSystem";
import {Resource} from "../resource";
import {InspectToolDriver, MoveToolDriver} from "../tools/common";
import {Tool} from "../tools/toolType";

export interface ToolDriver {
    readonly name: string;

    initialize?(): void;
    destroy?(): void;

    onStart?(): void;
    onEnd?(): void;

    onPointerMove?(event: PointerMoveEvent): void;
    onPointerDown?(event: PointerDownEvent): void;
    onPointerUp?(event: PointerUpEvent): void;
    onPointerRightDown?(event: PointerRightDownEvent): void;
    onPointerRightUp?(event: PointerRightUpEvent): void;
    onPointerClick?(event: PointerClickEvent): void;
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
    readonly optionalDependencies = [PIXI_BOARD_TYPE];

    private readonly world: World;

    standardTool: Tool = Tool.INSPECT;
    tools = new Map<string, ToolDriver>();
    currentTool?: ToolDriver;

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

        events.on(PointerEvents.POINTER_MOVE, this.onPointerMove, this);
        events.on(PointerEvents.POINTER_DOWN, this.onPointerDown, this);
        events.on(PointerEvents.POINTER_UP, this.onPointerUp, this);
        events.on(PointerEvents.POINTER_RIGHT_DOWN, this.onPointerRightDown, this);
        events.on(PointerEvents.POINTER_RIGHT_UP, this.onPointerRightUp, this);
        events.on(PointerEvents.POINTER_CLICK, this.onPointerClick, this);

        this.addTool(new InspectToolDriver(world));
        this.addTool(new MoveToolDriver(world));
    }

    addTool(tool: ToolDriver): void {
        this.tools.set(tool.name, tool);
    }

    private onResourceEdited(r: Resource, edited: any): void {
        if (r.type === TOOL_TYPE) {
            let ct = r as ToolResource;

            let toolName = ct.tool || this.standardTool;

            let tool = this.tools.get(toolName);
            if (ct.tool === undefined) {
                console.warn("Unregistered tool requested: " + ct.tool);
                tool = this.tools.get(this.standardTool);
            }

            if (tool === this.currentTool) {
                return;
            }

            console.log("Changing tool from " + (this.currentTool?.name || 'none')  + " to " + tool.name);

            if (this.currentTool !== undefined && this.currentTool.onEnd !== undefined) {
                this.currentTool.onEnd();
            }

            this.currentTool = tool;
            if (tool.onStart !== undefined) tool.onStart();
        }
    }

    private onPointerMove(e: PointerMoveEvent): void {
        if (this.currentTool !== undefined && this.currentTool.onPointerMove !== undefined) {
            this.currentTool.onPointerMove(e);
        }
    }

    private onPointerDown(e: PointerDownEvent): void {
        if (this.currentTool !== undefined && this.currentTool.onPointerDown !== undefined) {
            this.currentTool.onPointerDown(e);
        }
    }

    private onPointerUp(e: PointerUpEvent): void {
        if (this.currentTool !== undefined && this.currentTool.onPointerUp !== undefined) {
            this.currentTool.onPointerUp(e);
        }
    }

    private onPointerRightDown(e: PointerRightDownEvent): void {
        if (this.currentTool !== undefined && this.currentTool.onPointerRightDown !== undefined) {
            this.currentTool.onPointerRightDown(e);
        }
    }

    private onPointerRightUp(e: PointerRightUpEvent): void {
        if (this.currentTool !== undefined && this.currentTool.onPointerRightUp !== undefined) {
            this.currentTool.onPointerRightUp(e);
        }
    }

    private onPointerClick(e: PointerClickEvent): void {
        if (this.currentTool !== undefined && this.currentTool.onPointerClick !== undefined) {
            this.currentTool.onPointerClick(e);
        }
    }

    enable(): void {
        for (let tool of this.tools.values()) {
            if (tool.initialize !== undefined) tool.initialize();
        }

        if (this.currentTool === undefined) {
            this.world.editResource(TOOL_TYPE, {
                tool: this.standardTool,
            });
        }
    }

    destroy(): void {
        for (let tool of this.tools.values()) {
            if (tool.destroy !== undefined) tool.destroy();
        }
    }
}
