import { Resource } from "@/ecs/resource";
import { System } from "@/ecs/system";
import { World } from "@/ecs/world";
import { TICK_EVENT, WEBGL_CONTEXT_CHANGE_EVENT } from "../pixi/pixiBoardSystem";
import { createConsoleLogger, unregisterConsoleLogger } from "./ConsoleLogReceiver";
import { DEFAULT_LOG_LEVEL, Logger, LogLevel, LogReceiver } from "./Logger";
import { WebGlProfiler } from "./Profiler";

export const LOG_TYPE = "log";
export type LOG_TYPE = typeof LOG_TYPE;

export interface LoggerResource extends Resource {
    type: LOG_TYPE,
    root: Logger,
    _send: false,
    _sync: false,
}

export class LogSystem implements System {
    readonly name = LOG_TYPE;
    readonly dependencies = [];

    readonly consoleLogger: LogReceiver;

    private readonly world: World;
    private readonly root: Logger;
    private readonly glProfiler: WebGlProfiler;

    constructor(world: World) {
        this.world = world;
        this.glProfiler = new WebGlProfiler(undefined);
        this.root = new Logger(undefined, "", this.glProfiler);
        this.consoleLogger = createConsoleLogger(this.root, true);
        this.consoleLogger.setRule('', DEFAULT_LOG_LEVEL);

        this.root.log("Enabling Logger, console default level: " + LogLevel[DEFAULT_LOG_LEVEL] + " dndme version: " + __COMMIT_HASH__);

        this.world.addResource({
            type: LOG_TYPE,
            root: this.root,
            _send: false,
            _sync: false,
        } as LoggerResource, 'fail');

        this.world.events.on(WEBGL_CONTEXT_CHANGE_EVENT, (gl: WebGL2RenderingContext) => {
            this.glProfiler.resetContext(gl);
        });
        this.world.events.on(TICK_EVENT, () => {
            this.glProfiler.onTick();
        });
    }

    enable(): void {
    }

    destroy(): void {
        window.rootLogger = undefined as any;
        unregisterConsoleLogger();
    }
}

export function getLogger(world: World, path: string): Logger {
    const res = world.getResource(LOG_TYPE) as LoggerResource | undefined;
    if (res === undefined) throw new Error("No log system found");
    return res.root.getLogger(path.split('.'), 0);
}
