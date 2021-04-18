<template>
  <div class="game">

    <tool-bar v-bind:world="world">
    </tool-bar>

    <div id="canvas-container" style="width: 100%; height: calc(100vh - var(--topbar-height));">
    </div>

    <side-bar v-bind:world="world">
    </side-bar>

    <a id="hidden-download-link" style="display: none;"/>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import ToolBar from "./toolBar.vue";
import SideBar from "./sideBar.vue";

export default Vue.extend({
  components: {ToolBar, SideBar},
  props: ['world'],
});
</script>

<style scoped>
.game {
  user-select: none;
}
</style>
