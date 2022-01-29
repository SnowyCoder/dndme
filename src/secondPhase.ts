

import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'
import { stage } from './index';

import { loadAssets } from './assetsLoader';
import { ClientEditMapPhase } from './phase/editMap/clientEditMapPhase';
import { HomePhase } from './phase/homePhase';

export async function start() {
    await loadAssets();

    onHashChange();

    window.onhashchange = function () {
        console.log("Hash change" + location.hash);
        onHashChange();
    }
}

export async function onHashChange() {
    if (window.location.hash) {
        const roomId = window.location.hash.substr(1);// Remove #
        if (roomId.startsWith('t')) {
            console.log("Connecting with: torrent");
            stage.setPhase(new ClientEditMapPhase(roomId.substr(1)));
        } else {
            console.log("Invalid hash");
            stage.setPhase(new HomePhase());
        }

    } else {
        stage.setPhase(new HomePhase());
    }
}