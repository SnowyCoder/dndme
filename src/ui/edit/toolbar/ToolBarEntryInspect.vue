<template>
  <ToolBarEntry icon="fas fa-hand-pointer" title="Inspect" tool-name="inspect"
                :custom-class="customClass" @click="onClick"></ToolBarEntry>
</template>

<script lang="ts">
import { computed, defineComponent, inject, ShallowRef } from "vue";
import { BackgroundLayerResource, BACKGROUND_LAYER_TYPE } from "../../../ecs/systems/back/layerSystem";
import { World } from "../../../ecs/world";
import { useResource } from "../../vue";
import ToolBarEntry from "./ToolBarEntry.vue";

export default defineComponent({
  setup() {
    const world = (inject("world") as ShallowRef<World>).value;
    const backgroundLayer = useResource<BackgroundLayerResource>(world, BACKGROUND_LAYER_TYPE);

    const customClass = computed(() => {
      return {
        color: backgroundLayer.value?.locked ? 'toolbar-btn' : 'btn-warning',
        name: undefined,
        activeName: undefined,
      }
    });

    const onClick = (useful: boolean) => {
      if (!useful) {
        const locked = (world.getResource(BACKGROUND_LAYER_TYPE) as BackgroundLayerResource).locked;
        world.editResource(BACKGROUND_LAYER_TYPE, { locked: !locked });
      }
    };

    return {
      customClass, onClick
    };
  },
  components: { ToolBarEntry }
});
</script>

<style>
</style>
