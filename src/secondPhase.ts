

import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'
import { stage } from './index';

import { loadAssets } from './assetsLoader';
import { ClientEditMapPhase } from './phase/editMap/clientEditMapPhase';
import { HomePhase } from './phase/homePhase';

export async function start() {
    await loadAssets();

    resetPhase();
}

export function resetPhase() {
    const hash = window.location.hash;
    if (hash.length > 1) {
        const roomId = hash.substring(1);// Remove #
        console.log("Connecting to room", roomId);
        stage.setPhase(new ClientEditMapPhase(roomId));
    } else {
        stage.setPhase(new HomePhase());
    }
}
