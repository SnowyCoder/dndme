import {Stage} from "./phase/stage";


import {LoadingPhase} from "./phase/loadingPhase";

// Main
export const stage = new Stage("main");


(async function () {
    console.log("Loading dndme: " + __COMMIT_HASH__);

    // Serviceworker
    await registerServiceWorker();


    stage.setPhase(new LoadingPhase());

    await (await import('./secondPhase')).start();
})();


async function registerServiceWorker(): Promise<void> {
    if (window.crossOriginIsolated) return;

    const registration = await navigator.serviceWorker.register('./sw.js');
    console.log("COOP/COEP Service Worker registered", registration.scope);

    registration.addEventListener('updatefound', () => {
        console.log("Reloading page to make use of updated COOP/COEP Service Worker.");
        window.location.reload();
    });
    if (registration.active && !navigator.serviceWorker.controller) {
        console.log("Reloading page to make use of COOP/COEP Service Worker.");
        window.location.reload();
    }
}
