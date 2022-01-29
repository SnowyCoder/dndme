<template>
  <div>
    <div class="d-flex align-items-center">
      Angle: <editable-number :readonly="!isMaster" v-model="rotation"/>
    </div>
    <div class="d-flex align-items-center">
      Scale: <editable-number :readonly="!isMaster" v-model="scale"/>
    </div>
  </div>
</template>

<script lang="ts">
import { DEG_TO_RAD, RAD_TO_DEG } from "pixi.js";

import { TransformComponent } from "../../ecs/component";
import EditableNumber from "../util/EditableNumber.vue";
import { computed, defineComponent, inject, PropType, toRefs } from "vue";
import { useComponentPiece } from "../vue";

export default defineComponent({
  components: { EditableNumber },
  props: {
    component: { type: Object as PropType<TransformComponent>, required: true },
  },
  setup(props) {
    const { component } = toRefs(props);
    const isMaster = inject<boolean>('isMaster')!;
    const rotRad = useComponentPiece(component, 'rotation', 0);
    const rotation = computed({
      get() {
        return rotRad.value * RAD_TO_DEG;
      },
      set(x: number) {
        rotRad.value = x * DEG_TO_RAD;
      }
    });

    return {
      isMaster,
      scale: useComponentPiece(component, 'scale', 1),
      rotation,
    }
  }
});

</script>

<style>

</style>
