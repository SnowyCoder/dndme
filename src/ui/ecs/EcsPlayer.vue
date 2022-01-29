<template>
  <div>
    <div class="d-flex align-items-center">
      Night vision:
      <input type="checkbox" v-if="isMaster" class="form-check-input" v-model="nightVision">
      <span v-else style="margin-left: 0.5rem;">{{ nightVision ? "yes" : "no" }}</span>
    </div>
    <div class="d-flex align-items-center">
      Visibility Range:
      <editable-number :readonly="!isMaster" isNegative="false" v-model="range"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, PropType, toRefs } from "vue";
import { PlayerComponent } from "../../ecs/systems/playerSystem";
import EditableNumber from "../util/EditableNumber.vue";
import { useComponentPiece } from "../vue";

export default defineComponent({
  components: { EditableNumber },
  props: {
    component: { type: Object as PropType<PlayerComponent>, required: true },
  },
  setup(props) {
    const { component } = toRefs(props);
    const isMaster = inject<boolean>('isMaster');

    return {
      nightVision: useComponentPiece(component, 'nightVision', false),
      range: useComponentPiece(component, 'range', 0),
      isMaster,
    }
  },
});
</script>

<style>

</style>
