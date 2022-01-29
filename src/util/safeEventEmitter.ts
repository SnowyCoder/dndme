
export type ListenerFn = (...args: any[]) => void;

interface EventHandler {
    cb: ListenerFn;
    self: any;
    once: boolean;
    priority: number;// if -inf: disabled
}

export const PRIORITY_DISABLED = -Infinity;

export default class SafeEventEmitter {
    events: {[name: string]: EventHandler[]} = {};
    children: SafeEventEmitter[] = [];

    emit(event: string, ...args: Array<any>): boolean {
        let received = false;
        for (let c of this.children) {
            let x = c.emit(event, ...args);
            received ||= x;
        }

        let listeners = this.events[event];

        if (listeners === undefined || listeners.length === 0) return received;

        let length = listeners.length;
        for (let i = 0; i < length;) {
            let listener = listeners[i];
            if (listener.priority === PRIORITY_DISABLED) {
                i++;
                continue;
            }
            try {
                listener.cb.call(listener.self, ...args);
            } catch (b) {
                console.error("Error while calling event " + event);
                console.error(b)
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

    private insertHandler(event: string, handler: EventHandler) {
        let listeners = this.events[event];
        if (listeners === undefined) {
            listeners = [handler];
            this.events[event] = listeners;
            return;
        }

        let i = listeners.length - 1;
        for (; i >= 0; i--) {
            if (listeners[i].priority >= handler.priority) break;
        }
        // Add at position
        listeners.splice(i, 0, handler)
    }

    /**
     * Add a listener for a given event.
     */
    on(event: string, fn: ListenerFn, context?: any, priority: number = 0): this {
        this.insertHandler(event, {
            cb: fn,
            self: context,
            once: false,
            priority,
        });

        return this;
    }

    /**
     * Add a one-time listener for a given event.
     */
    once(event: string, fn: ListenerFn, context?: any): this {
        this.insertHandler(event, {
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
        if (listeners === undefined) throw new Error('Cannot find event ' + event);
        let length = listeners.length;
        for (let i = 0; i < length; i++) {
            let listener = listeners[i];
            if (listener.cb === fn && listener.self === context) {
                listeners.splice(i, 1);
                return this;
            }
        }
        throw new Error('Cannot find event ' + event);
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

    reorderObjects(priorityList: any[], defaultPriority: number = -1): void {
        for (let name in this.events) {
            const listeners = this.events[name];
            for (let listener of listeners) {
                listener.priority = priorityList.indexOf(listener.self);
                if (listener.priority < 0) listener.priority = defaultPriority;
            }
            // decrescent order
            listeners.sort((a, b) => b.priority - a.priority);
        }
    }

    addChild(emitter: SafeEventEmitter): void {
        this.children.push(emitter);
    }

    removeChild(emitter: SafeEventEmitter): void {
        let index = this.children.indexOf(emitter);
        if (index >= 0) this.children.splice(index, 1);
    }
}
