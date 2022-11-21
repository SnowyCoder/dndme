import SafeEventEmitter from "../../util/safeEventEmitter";

const MAX_BUFFERED_AMOUNT = 64 * 1024

export class WrtcChannel {
    handle: RTCDataChannel;
    events: SafeEventEmitter;
    isDestroyed: boolean;

    private messageCallback?: () => void;

    constructor(handle: RTCDataChannel) {
        this.isDestroyed = false;
        this.events = new SafeEventEmitter();

        this.handle = handle;
        this.handle.binaryType = 'arraybuffer';
        this.handle.bufferedAmountLowThreshold = MAX_BUFFERED_AMOUNT;

        this.handle.onopen = this.onOpen.bind(this);
        this.handle.onmessage = this.onMessage.bind(this);
        this.handle.onerror = this.onError.bind(this) as any;
        this.handle.onclose = this.onClose.bind(this);
        this.handle.onbufferedamountlow = this.onBufferedAmountLow.bind(this);
    }

    private onOpen() {
        this.events.emit('open');
    }

    private onMessage(event: MessageEvent<any>) {
        if (this.isDestroyed) return;
        this.events.emit('data', event.data);
    }

    private onError(event: ErrorEvent) {
        if (this.isDestroyed) return;
        const err = event.error instanceof Error
            ? event.error
            : new Error(`Datachannel error: ${event.message} ${event.filename}:${event.lineno}:${event.colno}`);
        this.onDestroy(err);
    }

    private onClose() {
        if (this.isDestroyed) return;
        this.onDestroy();
    }

    private onDestroy(err?: Error) {
        if (this.isDestroyed) return;
        this.isDestroyed = true;

        try {
            this.handle.close();
        } catch(err) {}

        this.events.emit('close');
        if (err) {
            this.events.emit('error', err);
        }
    }

    close() {
        this.onDestroy();
    }

    send(data: ArrayBufferView | ArrayBuffer | string, callback: () => void) {
        if (this.isDestroyed) return;
        if (this.messageCallback !== undefined) {
            throw Error("Sent data without waiting for callback!");
        }

        if (this.handle.readyState === 'connecting') {
            // Handle messages before connection established
            this.events.once('open', () => this.send(data, callback));
            return;
        }

        this.handle.send(data as any);// as any shouldn't be there(?)

        if (this.handle.bufferedAmount > MAX_BUFFERED_AMOUNT) {
            this.messageCallback = callback;
        } else {
            callback();
        }
    }

    private onBufferedAmountLow() {
        if (this.isDestroyed || !this.messageCallback) return;
        const cb = this.messageCallback;
        this.messageCallback = undefined;
        cb();
    }
}
