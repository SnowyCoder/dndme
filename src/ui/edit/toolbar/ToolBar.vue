<template>
  <div id="toolbar-container" class="btn-toolbar bg-dark justify-content-between" role="toolbar">
    <div v-if="world.isMaster" class="btn-group me-5" role="group">
      <button title="Undo" class="btn btn-secondary rounded-0 toolbar-btn plz-prioritize undo-redo-btn" :disabled="!historyState.canUndo" @click="undo()">
        <i class="fas fa-undo"></i>
      </button>
      <button title="Redo" class="btn btn-secondary rounded-0 toolbar-btn plz-prioritize undo-redo-btn" :disabled="!historyState.canRedo" @click="redo()">
        <i class="fas fa-redo"></i>
      </button>
    </div>

    <div class="btn-group" role="group" aria-label="tools">
      <component v-bind:is="entry.icon" v-bind="entry.iconProps" v-for="entry in entries" :key="entry.entity"></component>
      <ExportMap v-if="world.isMaster"/>
    </div>

    <div style="flex: 1 1 0;"/> <!-- Spacing -->

    <button title="Toggle sidebar" class="btn btn-warning" @click="toggleSidebar">
      <i class="fas fa-angle-double-right"/>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useComponentsOfType, useEvent, useResource, useWorld } from "../../vue";
import { TOOL_TYPE, ToolResource } from "../../../ecs/systems/back/ToolSystem";

import { computed, provide, reactive, ShallowRef } from "vue";
import { SIDEBAR_TYPE, ToolbarItemComponent, TOOLBAR_ITEM_TYPE } from "../../../ecs/systems/toolbarSystem";
import ExportMap from "./ExportMap.vue";

const world = useWorld();

const currentToolRes = useResource(world, TOOL_TYPE) as ShallowRef<ToolResource>;
const currentTool = computed(() => currentToolRes.value.tool ?? "uninitialized");
provide('currentTool', currentTool);

const rawEntries = useComponentsOfType(TOOLBAR_ITEM_TYPE) as ShallowRef<ToolbarItemComponent[]>;
const entries = computed(() => rawEntries.value.slice().sort((a, b) => a.priority - b.priority));

const historyState = reactive({
  canUndo: false,
  canRedo: false,
});

useEvent(world, 'command_history_change', (canUndo: boolean, canRedo: boolean) => {
  historyState.canUndo = canUndo;
  historyState.canRedo = canRedo;
});

const undo = () => world.events.emit('command_undo');
const redo = () => world.events.emit('command_redo');
const toggleSidebar = () => {
  const sidebar = world.getResource(SIDEBAR_TYPE)!;
  world.editResource(SIDEBAR_TYPE, {
    open: !sidebar.open,
  });
};
</script>

<style lang="scss">
@import "@/style/vars";
@import "bootstrap/scss/mixins";

.plz-prioritize.undo-redo-btn.disabled, .plz-prioritize.undo-redo-btn:disabled {
  background-color: #343a40;
  border-color: #343a40;
  box-shadow: none;
}

#toolbar-container {
  width: 100%;
  height: var(--toolbar-height);
  z-index: 1000;
  position: fixed;
  bottom: 0;
  @include media-breakpoint-up(md) {
    bottom: unset;
    top: 0;
    left: 0;
  }
}
</style>
