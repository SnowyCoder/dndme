import {Stage} from "./phase/stage";


import {LoadingPhase} from "./phase/loadingPhase";

// Main
export const stage = new Stage("main");

(async function () {
    console.log("Loading dndme: " + __COMMIT_HASH__);

    stage.setPhase(new LoadingPhase());

    await (await import('./secondPhase')).start();
})();
