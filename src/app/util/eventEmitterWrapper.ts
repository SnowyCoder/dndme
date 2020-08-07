import * as EventEmitter from "eventemitter3";

/**
 * The task of this function is to bring the event from a third-party
 * EventManager (that could be the DOM, Vue or whatever) to EventEmitter3.
 */
type CatchEventForEmitter = (event: any, emitter: EventEmitter) => void;

export class EventEmitterWrapper extends EventEmitter {
    readonly catcher: CatchEventForEmitter;
    private caught: Set<string> = new Set();


    constructor(catcher: CatchEventForEmitter) {
        super();
        this.catcher = catcher;
    }

    catchEvent(event: string) {
        this.catcher(event, this);
        this.caught.add(event);
    }

    on(event: string, fn: EventEmitter.ListenerFn, context?: any): this {
        super.on(event, fn, context);
        if (!this.caught.has(event)) {
            this.catchEvent(event);
        }
        return this;
    }

    addListener(event: string, fn: EventEmitter.ListenerFn, context?: any): this {
        super.addListener(event, fn, context);
        if (!this.caught.has(event)) {
            this.catchEvent(event);
        }
        return this;
    }
}
