import { Resource } from "@/ecs/resource";
import { System } from "@/ecs/System";
import { World } from "@/ecs/World";
import { TICK_EVENT, WEBGL_CONTEXT_CHANGE_EVENT } from "../pixi/pixiBoardSystem";
import { createConsoleLogger, unregisterConsoleLogger } from "./ConsoleLogReceiver";
import { LOG_DIRECTIVE, Logger, LogLevel, LogReceiver } from "./Logger";
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
    readonly resources?: [LoggerResource];

    readonly consoleLogger: LogReceiver;

    private readonly world: World;
    private readonly root: Logger;
    private readonly glProfiler: WebGlProfiler;

    constructor(world: World) {
        this.world = world;
        this.glProfiler = new WebGlProfiler(undefined);
        this.root = new Logger(undefined, "", this.glProfiler);
        this.consoleLogger = createConsoleLogger(this.root, true);

        let dirString = '';
        for (let [path, level] of LOG_DIRECTIVE) {
            this.consoleLogger.setRule(path, level);
            if (dirString != '') dirString += ',';
            if (path.length > 0) dirString += `${path}=`;
            dirString += `${LogLevel[level]}`;
        }

        const style = 'color: yellow; background-color: purple; padding:2px;'
        this.root.log("---------------------------------");
        this.root.log("Dndme enabling logger!");
        this.root.log("Console directive: " + dirString);
        this.root.log("Dndme version: " + __COMMIT_HASH__);
        this.root.log("---------------------------------");

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
    const res = world.getResource(LOG_TYPE);
    if (res === undefined) throw new Error("No log system found");
    return res.root.getLogger(path.split('.'), 0);
}
