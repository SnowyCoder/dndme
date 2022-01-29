<template>
  <div style="display: flex; align-items: center;">
    Default size
    <editable-range v-model="defaultSize" :min="0.5" :max=10 :step="0.1"/>
  </div>
</template>

<script lang="ts">
import EditableRange from "../util/EditableRange.vue";
import { defineComponent } from "vue";
import { useResourcePiece } from "../vue";
import { PIN_TYPE } from "../../ecs/systems/pinSystem";

export default defineComponent({
  components: { EditableRange },
  setup() {
    const defaultSize = useResourcePiece(PIN_TYPE, 'defaultSize', 1);

    return { defaultSize };
  },
});
</script>
