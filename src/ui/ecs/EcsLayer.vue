<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { ParentLayerComponent } from "../../ecs/systems/back/LayerSystem";

export default defineComponent({
  props: {
    component: { type: Object as PropType<ParentLayerComponent>, required: true },
  },
});
</script>

<style>

</style>
