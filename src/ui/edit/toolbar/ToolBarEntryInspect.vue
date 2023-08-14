<template>
  <ToolBarEntry icon="fas fa-hand-pointer" title="Inspect" tool-name="inspect"
                :custom-class="customClass" @click="onClick"></ToolBarEntry>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { BackgroundLayerResource, BACKGROUND_LAYER_TYPE } from "../../../ecs/systems/back/LayerSystem";
import { useResource, useWorld } from "../../vue";
import ToolBarEntry from "./ToolBarEntry.vue";

const world = useWorld();
const backgroundLayer = useResource(world, BACKGROUND_LAYER_TYPE);

const customClass = computed(() => {
  return {
    color: backgroundLayer.value?.locked ? 'toolbar-btn' : 'btn-warning',
    name: undefined,
    activeName: undefined,
  }
});

const onClick = (useful: boolean) => {
  if (!useful) {
    const locked = world.getResource(BACKGROUND_LAYER_TYPE)?.locked ?? false;
    world.editResource(BACKGROUND_LAYER_TYPE, { locked: !locked });
  }
};
</script>

<style>
</style>
