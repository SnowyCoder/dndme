<template>
  <div>
    <div class="d-flex align-items-center">
      Angle: <editable-range :readonly="!isMaster" v-model="rotation" :min="-179" :max="180" :step="1"/>
    </div>
    <div class="d-flex align-items-center">
      Scale: <editable-number :readonly="!isMaster" v-model="scale" :can-be-zero="false"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DEG_TO_RAD, RAD_TO_DEG } from "pixi.js";

import { TransformComponent } from "../../ecs/component";
import EditableNumber from "../util/EditableNumber.vue";
import { computed, inject, ref, toRefs } from "vue";
import { useComponentPiece } from "../vue";
import EditableRange from "../util/EditableRange.vue";

export interface Props {
  component: TransformComponent,
}

const props = defineProps<Props>();

const { component } = toRefs(props);
const isMaster = inject<boolean>('isMaster')!;

// Only update back after @update or when not focused (so that 3 doesn't magically transform in 3.000000... while we type)
const rotRad = useComponentPiece(component, 'rotation', 0);
const rotation = computed({
  get() {
    let grad = (rotRad.value * RAD_TO_DEG) % 360;
    if (grad > 180) grad -= 360;
    return grad;
  },
  set(x: number) {
    // Normalize
    rotRad.value = ((x + 360) % 360) * DEG_TO_RAD;
  }
});

const scale = useComponentPiece(component, 'scale', 1);
</script>

<style>

</style>
