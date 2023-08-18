import {Stage} from "./phase/stage";
import {LoadingPhase} from "./phase/loadingPhase";
import { registerServiceWorker } from "./swClient";

// Main
export const stage = new Stage("main");


(async function () {
    console.log("Loading dndme: " + __COMMIT_HASH__);

    const phase = new LoadingPhase();
    stage.setPhase(phase);

    // Serviceworker
    try {
        const swData = await registerServiceWorker();
    } catch (e) {
        phase.update('sw_error');
        console.error(e);
        return;
    }
    phase.update('loading');

    await (await import('./secondPhase')).start();
})();
