<template>
  <div>
    <div class="d-flex align-items-center">
      W: <editable-number :readonly="!isMaster" v-model="w"/>
    </div>
    <div class="d-flex align-items-center">
      H: <editable-number :readonly="!isMaster" v-model="h"/>
    </div>

    <wall-settings :is-master="isMaster"
        v-model:thickness="thick"
        v-model:block-light="blockLight"
        v-model:block-player="blockPlayer"  />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, toRefs, triggerRef } from "vue";
import { WallComponent } from "../../ecs/systems/wallSystem";
import EditableNumber from "../util/EditableNumber.vue";
import { useComponentPiece } from "../vue";
import WallSettings from "../edit/settings/WallSettings.vue";
import { BlockDirection } from "@/ecs/systems/back/VisibilitySystem";

export interface Props {
  component: WallComponent,
}

const props = defineProps<Props>();

const { component } = toRefs(props);

const vec = useComponentPiece(component, 'vec', [0, 0]);
const thick = useComponentPiece(component, 'thickness', 5);
const blockLight = useComponentPiece(component, 'blockLight', BlockDirection.BOTH);
const blockPlayer = useComponentPiece(component, 'blockPlayer', BlockDirection.BOTH);

const defineElement = (index: number) => computed({
  get: () => vec.value[index],
  set: (x: number) => {
    vec.value[index] = x;
    triggerRef(vec);
  }
});

const isMaster = inject<boolean>('isMaster')!;

const w = defineElement(0);
const h = defineElement(0);
</script>

<style>

</style>
