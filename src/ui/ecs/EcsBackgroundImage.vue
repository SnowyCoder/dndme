<template>
  <span>Your regular background image</span>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { BackgroundImageComponent } from "../../ecs/systems/backgroundImageSystem";

export default defineComponent({
  props: {
    component: { type: Object as PropType<BackgroundImageComponent>, required: true },
  },
});
</script>

<style>

</style>
