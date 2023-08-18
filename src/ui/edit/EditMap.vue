<template>
  <div class="edit-map_game">

    <ToolBar />

    <div id="canvas-container" class="under-toolbar">
    </div>

    <SideBar />

    <ReconnectionModal v-if="!isMaster" />
    <MasterNameErrorModal v-else />

    <UpdateModal />

    <a id="hidden-download-link" style="display: none;"/>
  </div>
</template>

<script setup lang="ts">
import { provide, toRefs } from "vue";
import ToolBar from "./toolbar/ToolBar.vue";
import SideBar from "./SideBar.vue";
import ReconnectionModal from "./ReconnectionModal.vue";
import MasterNameErrorModal from "./MasterNameErrorModal.vue";
import UpdateModal from "./UpdateModal.vue";
import { World } from "@/ecs/World";

const props = defineProps<{
  world: World
}>();

const { world } = toRefs(props);
provide("world", world);
const isMaster = world.value.isMaster;
provide("isMaster", isMaster);

</script>

<style lang="scss">
.edit-map_game {
  user-select: none;
}

#canvas-container {
  width: 100%;
  height: calc(100vh - var(--toolbar-height));
}
</style>
