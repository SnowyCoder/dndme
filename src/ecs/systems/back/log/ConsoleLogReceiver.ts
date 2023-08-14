import { Logger, LogLevel, LogReceiver } from "./Logger";


const STUBBED_METHODS = ['error', 'warn', 'log', 'info', 'debug', 'trace'] as const;
type STUBBED_METHODS = typeof STUBBED_METHODS[number];

const CONSOLE_TO_LOGGER = {
    'error': LogLevel.ERROR,
    'warn': LogLevel.WARNING,
    'log': LogLevel.LOG,
    'info': LogLevel.INFO,
    'debug': LogLevel.DEBUG,
    'trace': LogLevel.TRACE,
};

export type OriginalConsoleLogMethods = {[name in STUBBED_METHODS]: (...data: any[]) => void};

export let originalMethods: OriginalConsoleLogMethods | undefined = undefined;
let currentRawLogger: Logger | undefined = undefined;

function installStubs(): OriginalConsoleLogMethods {
    if (originalMethods !== undefined)  {
        return originalMethods;
    }
    originalMethods = {} as OriginalConsoleLogMethods;
    for (let m of STUBBED_METHODS) {
        originalMethods[m] = console[m];
        const lev = CONSOLE_TO_LOGGER[m];
        console[m] = (...args) => {
            if (currentRawLogger !== undefined) {
                currentRawLogger.write(lev, ...args);
            } else {
                originalMethods![m](...args);
            }
        }
    }

    return originalMethods;
}

export function createConsoleLogger(root: Logger, stubConsole: boolean): LogReceiver {
    currentRawLogger = root.getLogger(['raw'], 0);
    const fns = stubConsole ?  installStubs() : console;

    const onLog = (from: Logger, level: LogLevel, args: any[]) => {
        let fn;

        if (level == LogLevel.ERROR) {
            fn = fns.error;
        } else if (level == LogLevel.WARNING) {
            fn = fns.warn;
        } else if (level == LogLevel.LOG) {
            fn = fns.log;
        } else if (level == LogLevel.INFO) {
            fn = fns.info;
        } else if (level == LogLevel.DEBUG) {
            fn = fns.debug;
        } else if (level == LogLevel.TRACE) {
            // trace in console means sssssomething different
            fn = fns.debug;
        } else {
            return;
        }

        fn("[" + from.path + "]", ...args);
    }

    return new LogReceiver(root, onLog);
}

export function unregisterConsoleLogger() {
    currentRawLogger = undefined;
}
