<template>
  <div class="edit-map_game">

    <tool-bar>
    </tool-bar>

    <div id="canvas-container" class="under-toolbar">
    </div>

    <side-bar>
    </side-bar>

    <reconnection-modal v-if="!isMaster">
    </reconnection-modal>

    <a id="hidden-download-link" style="display: none;"/>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, provide, toRefs } from "vue";
import ToolBar from "./toolbar/ToolBar.vue";
import SideBar from "./SideBar.vue";
import ReconnectionModal from "./ReconnectionModal.vue";
import { World } from "@/ecs/World";

export default defineComponent({
  components: { ToolBar, SideBar, ReconnectionModal },
  props: {
    world: { required: true, type: Object as PropType<World>, }
  },
  setup(props) {
    const { world } = toRefs(props);
    provide("world", world);
    const isMaster = world.value.isMaster;
    provide("isMaster", isMaster);

    return {
      isMaster
    }
  },
});
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
