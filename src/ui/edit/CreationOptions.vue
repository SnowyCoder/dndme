<template>
  <div>
    <div style="display: flex; align-items: center;">
      Create once:
      <input type="checkbox" class="form-check-input" v-model="exitAfterCreation">
    </div>
    <component :is="additionalOptions" v-if="additionalOptions !== undefined"></component>
  </div>
</template>

<script lang="ts">
import { CREATION_INFO_TYPE } from "../../ecs/resource";
import { defineComponent, PropType, VueElementConstructor } from "vue";
import { useResourcePiece } from "../vue";

export default defineComponent({
  props: {
    additionalOptions: { default: undefined, type: Object as PropType<VueElementConstructor> },
  },
  setup() {
    const exitAfterCreation = useResourcePiece(CREATION_INFO_TYPE, 'exitAfterCreation', true);

    return {
      exitAfterCreation
    };
  },
});
</script>
