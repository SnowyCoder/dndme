
type ListenerFn = (...args: any[]) => void;

interface EventHandler {
    cb: ListenerFn;
    self: any;
    once: boolean;
}

export default class SafeEventEmitter {
    events: {[name: string]: EventHandler[]} = {};

    emit(event: string, ...args: Array<any>): boolean {
        let listeners = this.events[event];

        if (listeners === undefined || listeners.length === 0) return false;

        let length = listeners.length;
        for (let i = 0; i < length;) {
            let listener = listeners[i];
            try {
                listener.cb.call(listener.self, ...args);
            } catch (b) {
                console.error("Error while calling event " + event, b);
            }
            if (listener.once) {
                listeners.splice(i, 1);
                length--;
            } else {
                i++;
            }
        }
        return true;
    }

    /**
     * Add a listener for a given event.
     */
    on(event: string, fn: ListenerFn, context?: any): this {
        let listeners = this.events[event];
        if (listeners === undefined) {
            listeners = [];
            this.events[event] = listeners;
        }
        listeners.push({
            cb: fn,
            self: context,
            once: false,
        } as EventHandler);
        return this;
    }

    /**
     * Add a one-time listener for a given event.
     */
    once(event: string, fn: ListenerFn, context?: any): this {
        let listeners = this.events[event];
        if (listeners === undefined) {
            listeners = [];
            this.events[event] = listeners;
        }
        listeners.push({
            cb: fn,
            self: context,
            once: true,
        } as EventHandler);
        return this;
    }

    /**
     * Remove the listeners of a given event.
     */
    off(event: string, fn: ListenerFn, context?: any, once?: boolean): this {
        let listeners = this.events[event];
        if (listeners === undefined) throw 'Cannot find event ' + event;
        let length = listeners.length;
        for (let i = 0; i < length; i++) {
            let listener = listeners[i];
            if (listener.cb === fn && listener.self === context) {
                listeners.splice(i, 1);
                return this;
            }
        }
        throw 'Cannot find event ' + event;
    }

    /**
     * Remove all listeners, or those of the specified event.
     */
    removeAllListeners(event?: string): this {
        if (event !== undefined) {
            this.events[event] = [];
        } else {
            this.events = {};
        }
        return this;
    }
}
