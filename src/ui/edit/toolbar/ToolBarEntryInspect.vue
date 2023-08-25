<template>
  <ToolBarEntry icon="fas fa-hand-pointer" title="Inspect" tool-name="inspect"
                :custom-class="customClass" @click="onClick"></ToolBarEntry>
</template>

<script setup lang="ts">
import { ComputedRef, computed, inject, watch } from "vue";
import { BACKGROUND_LAYER_TYPE } from "../../../ecs/systems/back/LayerSystem";
import { useResource, useWorld } from "../../vue";
import ToolBarEntry from "./ToolBarEntry.vue";

const world = useWorld();
const backgroundLayer = useResource(world, BACKGROUND_LAYER_TYPE);

const customClass = computed(() => {
  return {
    color: backgroundLayer.value?.locked ? 'btn-toolbar-entry' : 'btn-outline-warning',
    name: undefined,
    activeName: undefined,
  }
});


const currentTool = inject('currentTool') as ComputedRef<string>;
watch(currentTool, x => {
  if (x != 'inspect' && !backgroundLayer.value?.locked) {
    world.editResource(BACKGROUND_LAYER_TYPE, { locked: true });
  }
});


const onClick = (useful: boolean) => {
  if (!useful) {
    const locked = backgroundLayer.value?.locked ?? false;
    world.editResource(BACKGROUND_LAYER_TYPE, { locked: !locked });
  }
};
</script>

<style>
</style>
