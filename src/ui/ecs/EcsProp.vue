<template>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { PropComponent } from "../../ecs/systems/propSystem";

export default defineComponent({
  props: {
    component: { required: true, type: Object as PropType<PropComponent> },
  }
});
</script>

<style>

</style>
