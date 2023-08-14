import { arrayRemoveIf } from "@/util/array";
import { Profiler, ProfileHandle, WebGlProfiler } from "./Profiler";

export enum LogLevel {
    OFF = 9,
    ERROR = 6,
    WARNING = 5,
    LOG = 4,
    INFO = 3,
    DEBUG = 2,
    TRACE = 1,
}

export const MAX_LOG_LEVEL: LogLevel = parseLogLevel(import.meta.env.VITE_MAX_LOG_LEVEL, 'warn', LogLevel.INFO);
export const DEFAULT_LOG_LEVEL: LogLevel = parseLogLevel(import.meta.env.VITE_DEFAULT_LOG_LEVEL, 'warn', LogLevel.INFO);

declare global {
    interface Window {
        rootLogger: Logger;
    }
}

export class Logger {
    static readonly EMPTY = new Logger(undefined, "", new WebGlProfiler(undefined), false);

    readonly parent: Logger | undefined;

    readonly name: string;
    readonly path: string;
    private profiler?: Profiler;
    private glProfiler: WebGlProfiler;

    private logLevel: LogLevel = LogLevel.OFF;

    private computedRules: Array<[LogReceiver, LogLevel]> = [];
    private rules: Array<[LogReceiver, LogLevel]> = [];

    children: Map<string, Logger> = new Map();

    constructor(parent: Logger | undefined, name: string, glProfiler: WebGlProfiler, installRootLogger: boolean = true) {
        this.parent = parent;
        this.glProfiler = glProfiler;
        if (parent === undefined) {
            this.name = '';
            this.path = '';
            if (installRootLogger) this.installRootLogger();
        } else {
            let path = parent.name;
            if (path.length !== 0) path += '.';
            this.path = path + name;
            this.name = name;
        }
    }

    private installRootLogger() {
        if (window.rootLogger === undefined) {
            window.rootLogger = this;
        } else {
            console.warn("window.rootLogger already registered!", this);
        }
    }

    private setLoggerLevel(target: Array<[LogReceiver, LogLevel]>, recv: LogReceiver, level: LogLevel): boolean {
        for (let e of target) {
            if (e[0] == recv) {
                if (e[1] == level) return false;
                e[1] = level;
                return true;
            }
        }
        target.push([recv, level]);
        return true;
    }

    private clearLoggerLevel(target: Array<[LogReceiver, LogLevel]>, recv: LogReceiver): boolean {
        return arrayRemoveIf(target, x => x[0] == recv);
    }

    private sortRules(target: Array<[LogReceiver, LogLevel]>): void {
        // ascending order (first the lower levels, then higher ones)
        target.sort((a, b) => a[1] - b[1]);
    }

    private recomputeSubtree(): void {
        let newLevel = LogLevel.OFF;
        if (this.rules.length === 0) {
            if (this.parent === undefined) {
                newLevel = LogLevel.OFF;
            } else {
                this.computedRules = this.parent.computedRules;
                newLevel = this.parent.logLevel;
            }
        } else {
            if (this.parent === undefined) {
                this.computedRules = [];
                newLevel = LogLevel.OFF;
            } else {
                this.computedRules = [...this.parent.computedRules];
                newLevel = this.parent.logLevel;
            }
            for (let [logger, level] of this.rules) {
                this.setLoggerLevel(this.computedRules, logger, level);
                if (level < newLevel) newLevel = level;
            }
            this.sortRules(this.computedRules);
        }

        this.logLevel = newLevel;
        for (let c of this.children) {
            c[1].recomputeSubtree();
        }
    }

    addRule(recv: LogReceiver, rule: LogLevel): void {
        if (this.setLoggerLevel(this.rules, recv, rule)) {
            this.recomputeSubtree();
        }
    }

    clearRule(recv: LogReceiver): void {
        if (this.clearLoggerLevel(this.rules, recv)) {
            this.recomputeSubtree();
        }
    }

    getLogger(path: string[], index: number): Logger {
        // Deal with "a..b" or even ""
        while (index < path.length && path[index] === '') index++;
        if (index >= path.length) return this;

        let c = this.children.get(path[index]);
        if (c === undefined) {
            c = new Logger(this, path[index], this.glProfiler);
            this.children.set(path[index], c);
            c.recomputeSubtree();
        }
        return c.getLogger(path, index + 1);
    }

    isEnabled(level: LogLevel): boolean {
        // Plz JIT, I believe in you
        if (level < MAX_LOG_LEVEL) return false;
        return level >= this.logLevel;
    }

    write(level: LogLevel, ...args: any[]): void {
        if (level < MAX_LOG_LEVEL) return;
        for (let e of this.computedRules) {
            if (level >= e[1]) e[0].onLog(this, level, args);
            else break;
        }
    }

    trace(...args: any[]): void {
        this.write(LogLevel.TRACE, ...args);
    }

    debug(...args: any[]): void {
        this.write(LogLevel.DEBUG, ...args);
    }

    info(...args: any[]): void {
        this.write(LogLevel.INFO, ...args);
    }

    log(...args: any[]): void {
        this.write(LogLevel.LOG, ...args);
    }

    warning(...args: any[]): void {
        this.write(LogLevel.WARNING, ...args);
    }

    error(...args: any[]): void {
        this.write(LogLevel.ERROR, ...args);
    }

    profileStart(name: string, gpu: boolean=false): ProfileHandle {
        if (this.profiler === undefined) {
            this.profiler = new Profiler(this, this.glProfiler);
        }

        this.profiler.start(name, gpu);
        return name;
    }

    profileStop(handle: ProfileHandle, printLevel?: LogLevel): void {
        if (this.profiler === undefined) {
            console.error("Logger.profileStop when no start has been called");
            return;
        }
        this.profiler.stop(handle, printLevel);
    }

    profileReport(level: LogLevel=LogLevel.LOG, clear: boolean=false): void {
        if (this.profiler !== undefined && this.isEnabled(level)) {
            const iter = this.profiler.computeReports(clear);
            for (let report of iter) {
                this.log(level, `Report ${report.name}: it: ${report.count}, mean: ${report.mean}, std: ${report.std}`)
            }
        }
        for (let c of this.children.values()) {
            c.profileReport(level, clear);
        }
    }

    logFn(level: LogLevel, fn: () => any): void {
        if (this.isEnabled(level)) this.log(level, fn());
    }

    logFnMultiple(level: LogLevel, fn: () => any[]): void {
        if (this.isEnabled(level)) this.log(level, ...fn());
    }
}

export class LogReceiver {
    readonly root: Logger;
    private readonly _onLog: (from: Logger, level: LogLevel, data: any[]) => void;

    constructor(root: Logger, onLog: (from: Logger, level: LogLevel, data: any[]) => void) {
        this.root = root;
        this._onLog = onLog;
    }

    onLog(from: Logger, level: LogLevel, data: any[]): void {
        this._onLog(from, level, data);
    }

    setRule(path: string, level: LogLevel): void {
        const logger = this.root.getLogger(path.split('.'), 0);
        logger.addRule(this, level);
    }

    clearRule(path: string): void {
        const logger = this.root.getLogger(path.split('.'), 0);
        logger.clearRule(this);
    }
}

export function parseLogLevel(name: string, rejectAction: 'ignore' | 'fail' | 'warn' = 'fail', def: LogLevel = LogLevel.INFO): LogLevel {
    const res = LogLevel[name as any] as any;
    if (typeof(res) === 'number') {
        return res;
    }
    if (rejectAction === 'fail') {
        throw new Error("Invalid LogLevel " + name);
    }
    if (rejectAction === 'warn') {
        console.warn("Invalid LogLevel " + name);
    }
    return def;
}

export function getLogger(path: string): Logger {
    const res = window.rootLogger;
    if (res === undefined) throw new Error("No log system found");
    return res.getLogger(path.split('.'), 0);
}
