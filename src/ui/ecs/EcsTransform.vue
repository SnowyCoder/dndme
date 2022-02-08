<template>
  <div>
    <div class="d-flex align-items-center" ref="angleDiv">
      Angle: <editable-number :readonly="!isMaster" v-model="rotation"/>
    </div>
    <div class="d-flex align-items-center">
      Scale: <editable-number :readonly="!isMaster" v-model="scale" :can-be-zero="false"/>
    </div>
  </div>
</template>

<script lang="ts">
import { DEG_TO_RAD, RAD_TO_DEG } from "pixi.js";

import { TransformComponent } from "../../ecs/component";
import EditableNumber from "../util/EditableNumber.vue";
import { computed, defineComponent, inject, PropType, ref, shallowRef, toRefs, watch } from "vue";
import { useComponentPiece } from "../vue";

export default defineComponent({
  components: { EditableNumber },
  props: {
    component: { type: Object as PropType<TransformComponent>, required: true },
  },
  setup(props) {
    const { component } = toRefs(props);
    const isMaster = inject<boolean>('isMaster')!;

    // Only update back after @update or when not focused (so that 3 doesn't magically transform in 3.000000... while we type)
    const rotRad = useComponentPiece(component, 'rotation', 0);
    const angleDiv = ref<HTMLDivElement>(null);
    let lazyRot = rotRad.value * RAD_TO_DEG;
    const rotation = computed({
      get() {
        if (angleDiv.value?.contains(document.activeElement)) return lazyRot;
        return lazyRot = rotRad.value * RAD_TO_DEG;
      },
      set(x: number) {
        lazyRot = x * DEG_TO_RAD;
        rotRad.value = lazyRot;
      }
    });

    return {
      angleDiv,
      isMaster,
      scale: useComponentPiece(component, 'scale', 1),
      rotation,
    }
  }
});

</script>

<style>

</style>
