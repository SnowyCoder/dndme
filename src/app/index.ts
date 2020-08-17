import {Stage} from "./phase/stage";
import {Channel} from "./network/channel";
import * as PIXI from "pixi.js";

import {HomePhase} from "./phase/homePhase";

import {EventEmitterWrapper} from "./util/eventEmitterWrapper";

import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'

import '@fortawesome/fontawesome-free/css/all.css'
import '@fortawesome/fontawesome-free/js/all.js'

Vue.use(BootstrapVue)

// ================================================================================================ Public

import "Public/style.css";
import {ClientEditMapPhase} from "./phase/editMap/clientEditMapPhase";

export const windowEventEmitter = new EventEmitterWrapper((event, emitter) => {
    window.addEventListener(event, data => {
        emitter.emit(event, data);
    });
});

// PIXI
export let app: PIXI.Application;

// Main
export const stage = new Stage("main");

function onHashCahnge() {
    if (window.location.hash) {
        const roomId = window.location.hash.substr(1);// Remove #
        if (roomId.startsWith('p')) {
            console.log("Connecting with: peerj2");
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
    app = new PIXI.Application({
        resizeTo: window,
        transparent: true
    });
    // The app.view (canvas) is only appended when the game-phase starts.

    app.view.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    onHashCahnge();

    window.onhashchange = function (e: HashChangeEvent) {
        console.log("Hash change" + e.newURL);
        onHashCahnge();
    }
})();
