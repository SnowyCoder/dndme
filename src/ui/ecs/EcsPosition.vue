<template>
  <div>
    <div class="d-flex align-items-center">
      X: <editable-number class="flex-grow-1" :readonly="!isMaster" v-model="x"/>
    </div>
    <div class="d-flex align-items-center">
      Y: <editable-number class="flex-grow-1" :readonly="!isMaster" v-model="y"/>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, PropType, toRefs } from "vue";
import { PositionComponent } from "../../ecs/component";
import EditableNumber from "../util/EditableNumber.vue";
import { useComponentPiece } from "../vue";

export default defineComponent({
  components: { EditableNumber },
  props: {
    component: { type: Object as PropType<PositionComponent>, required: true },
  },
  setup(props) {
    const { component } = toRefs(props);
    const isMaster = inject<boolean>('isMaster');

    return {
      isMaster,
      x: useComponentPiece(component, 'x', 0),
      y: useComponentPiece(component, 'y', 0),
    }
  },
});
</script>

<style>
</style>
