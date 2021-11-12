import {Stage} from "./phase/stage";

import {HomePhase} from "./phase/homePhase";

import {EventEmitterWrapper} from "./util/eventEmitterWrapper";

import Vue from 'vue'
import { BootstrapVue } from 'bootstrap-vue'

import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'

Vue.use(BootstrapVue)

// ================================================================================================ Public

import "Public/style.css";
import {ClientEditMapPhase} from "./phase/editMap/clientEditMapPhase";
import {loadAssets} from "./assetsLoader";
import {LoadingPhase} from "./phase/loadingPhase";

export const windowEventEmitter = new EventEmitterWrapper((event, emitter) => {
    window.addEventListener(event, data => {
        emitter.emit(event, data);
    });
});

// Main
export const stage = new Stage("main");

function onHashCahnge() {
    if (window.location.hash) {
        const roomId = window.location.hash.substr(1);// Remove #
        if (roomId.startsWith('t')) {
            console.log("Connecting with: torrent");
            stage.setPhase(new ClientEditMapPhase(roomId.substr(1)));
        } else {
            console.log("Invalid hash")
            stage.setPhase(new HomePhase());
        }

    } else {
        stage.setPhase(new HomePhase());
    }
}

(async function () {
    console.log("Loading dndme: " + __COMMIT_HASH__);

    stage.setPhase(new LoadingPhase());

    await loadAssets();

    onHashCahnge();

    window.onhashchange = function () {
        console.log("Hash change" + location.hash);
        onHashCahnge();
    }
})();
