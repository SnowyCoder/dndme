<template>
  <div class="edit-map_game">

    <tool-bar v-bind:world="world">
    </tool-bar>

    <div id="canvas-container" style="width: 100%; height: calc(100vh - var(--topbar-height));">
    </div>

    <side-bar v-bind:world="world">
    </side-bar>

    <reconnection-modal v-if="!world.isMaster" v-bind:world="world">
    </reconnection-modal>

    <a id="hidden-download-link" style="display: none;"/>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ToolBar from "./toolBar.vue";
import SideBar from "./sideBar.vue";
import ReconnectionModal from "./reconnectionModal.vue";

export default Vue.extend({
  components: {ToolBar, SideBar, ReconnectionModal},
  props: ['world'],
});
</script>

<style>
.edit-map_game {
  user-select: none;
}
</style>
