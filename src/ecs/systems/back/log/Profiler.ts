import { arrayFilterInPlace } from "@/util/array";
import { Logger, LogLevel } from "./Logger";

export type ProfileHandle = string;

const LOG_PROFILE = import.meta.env.VITE_LOG_PROFILE == "true";

export class WebGlProfiler {
    private gl?: WebGL2RenderingContext;
    private ext: any;

    private pendingQueries: Array<[WebGLQuery, (a: unknown, elapsedTime: number) => void, unknown, unknown]> = [];

    isEnabled: boolean = false;

    constructor(gl?: WebGL2RenderingContext) {
        this.gl = gl;
        if (gl != undefined) {
            this.resetContext(gl);
        }
    }

    resetContext(gl: WebGL2RenderingContext): void {
        this.gl = gl;
        this.ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
        this.isEnabled = this.ext != null;
    }

    onTick(): void {
        if (!this.isEnabled) return;
        const gl = this.gl!;
        arrayFilterInPlace(this.pendingQueries, data => {
            const [query, fun, thus, meta] = data;
            if (!gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) {
                return true;
            }
            const elapsedTime = gl.getQueryParameter(query, gl.QUERY_RESULT);

            fun.apply(thus, [meta, elapsedTime]);
            return false;
        });
    }

    startQuery(): WebGLQuery | undefined {
        if (!this.isEnabled) return undefined;
        const gl = this.gl!;
        const q = gl.createQuery()!;
        gl.beginQuery(this.ext.TIME_ELAPSED_EXT, q);
        return q;
    }

    stopQuery<T>(q: WebGLQuery, fun: (a: T, elapsedTime: number) => void, thus: unknown, meta: T): void {
        if (!this.isEnabled) return;
        this.gl!.endQuery(this.ext.TIME_ELAPSED_EXT);
        this.pendingQueries.push([q, fun as any, thus, meta]);
    }
}

interface ProfileReporter {
    mean: number;
    msq: number;
    count: number;
    glQuery?: WebGLQuery;
    glPrintLevel?: LogLevel;
    cpuStart?: number;
}

export interface Report {
    name: string;
    count: number;
    mean: number;
    std: number;
}

export class Profiler {
    private readonly logger: Logger;
    private readonly glProf: WebGlProfiler;
    private profiles = new Map<ProfileHandle, ProfileReporter>();

    constructor(logger: Logger, glProf: WebGlProfiler) {
        this.logger = logger;
        this.glProf = glProf;
    }

    start(name: string, gpu: boolean): void {
        if (LOG_PROFILE) console.profile(name);
        let profile = this.profiles.get(name);
        if (profile === undefined) {
            profile = {
                mean: 0,
                msq: 0,
                count: 0,
            };
            this.profiles.set(name, profile);
        }

        if (gpu) {
            profile.glQuery = this.glProf.startQuery();
        }
        if (profile.glQuery === undefined) {
            profile.cpuStart = performance.now();
        }
    }

    stop(name: string, printLevel?: LogLevel): void {
        if (LOG_PROFILE) console.profileEnd(name);
        const profile = this.profiles.get(name);
        if (profile === undefined) return;

        if (profile.glQuery !== undefined) {
            const query = profile.glQuery;
            profile.glQuery = undefined;
            profile.glPrintLevel = printLevel;
            this.glProf.stopQuery(query, this.onGlQueryComplete, this, name);
        } else {
            const now = performance.now();
            const elapsedTime = now - profile.cpuStart!;
            this.onProfileComplete(name, profile, elapsedTime, printLevel);
        }
    }

    private onGlQueryComplete(name: string, elapsedTime: number): void {
        const profile = this.profiles.get(name);

        if (profile === undefined) return;

        this.onProfileComplete(name, profile, elapsedTime / 1000000, profile.glPrintLevel);
    }

    private onProfileComplete(name: string, profile: ProfileReporter, elapsedTime: number, printLevel?: LogLevel): void {
        // https://stats.stackexchange.com/a/235151
        const delta = elapsedTime - profile.mean;
        const oldM = profile.mean;
        const oldMsq = profile.msq;
        profile.mean += delta / (profile.count + 1);
        profile.msq += delta * (elapsedTime - profile.mean);
        profile.count += 1;

        if (printLevel !== undefined) {
            this.logger.write(printLevel, `report ${name}: elapsed ${elapsedTime} (${profile.count})`);
        }
    }

    *computeReports(clear: boolean=false): Generator<Report, void, unknown> {
        const profiles = this.profiles;
        if (clear) {
            const newProfileMap = new Map();
            this.profiles = newProfileMap;
        }

        for (let [name, {mean, msq, count}] of profiles) {
            yield {
                name: name,
                count,
                mean,
                std: count < 2 ? 0 : Math.sqrt(msq / (count - 1)),
            } as Report;
        }
    }
}
