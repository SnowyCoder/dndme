import EventEmitter from "eventemitter3";

import { registerSW } from 'virtual:pwa-register';
import { ShallowRef, shallowRef } from "vue";

// 15 mins
const UPDATE_CHECK_INTERVAL = 15 * 60 * 1000;

// Yes, global var, not the best design but it works
// as there should only be one service worker per page
export const versionReady = shallowRef<string | null>(null);

export interface Events {
    'updatefound': () => void,
    'updateactive': (version: string) => void,
}

export interface Result {
    events: EventEmitter<Events>,
}

export async function registerServiceWorker(): Promise<Result> {
    const res = {
        events: new EventEmitter<Events>(),
    } as Result;

    if (import.meta.env.DEV) {
        return Promise.resolve(res);
    }

    return new Promise((resolve, reject) => {
        console.log('registerSW');
        registerSW({
            onNeedRefresh() {
                // Not actually needed, we'll handle this our way using updatefound
                console.warn("[SW] Refresh needed!");
            },
            onOfflineReady() {
                console.log("[SW] Offline ready")
            },
            onRegisteredSW(url, registration) {
                if (registration == null) {
                    console.error('Registered SW but no registration');
                    // Reading the source code this will always be false
                    return;
                }
                console.log("[SW] registered!");
                registration.addEventListener('updatefound', () => {
                    console.log('Update found!');

                    res.events.emit('updatefound');
                    const usw = registration.installing;
                    if (usw == null) return;
                    const eventListener = async () => {
                        if (usw.state == 'activated') {
                            usw.removeEventListener('statechange', eventListener);
                            const version = await fetch('version').then(x => x.text());

                            console.log("Update version: ", version);
                            res.events.emit('updateactive', version);
                            versionReady.value = version;
                        }
                    }
                    usw.addEventListener('statechange', eventListener);
                    eventListener();
                });
                // Automatic update fetch
                setInterval(() => registration?.update(), UPDATE_CHECK_INTERVAL);
                resolve(res);
            },
            onRegisterError(e) {
                console.error('Error registering sw', e);
                reject(e);
            }
        })
    })
}
