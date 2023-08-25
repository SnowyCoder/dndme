<template>
  <div>
    <div class="d-flex align-items-center">
      <!-- Image -->
      <editable-image :readonly="!isMaster" v-model="imageId" :border="{
        color: utils.hex2string(color),
        width: 10,
      }" />
    </div>
    <div class="d-flex align-items-center">
      Color:
      <editable-color :readonly="!isMaster" v-model="color" />
    </div>
    <div class="d-flex align-items-center">
      Size:
      <input type="checkbox" title="Specify" v-model="sizeSpecify" :disabled="!isMaster" />
      <editable-range
        :readonly="!isMaster || !sizeSpecify"
        v-model="size"
        :min="0.5"
        :max="10"
        :step="0.1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PinComponent } from "../../ecs/systems/pinSystem";

import EditableColor from "../util/EditableColor.vue";
import EditableRange from "../util/EditableRange.vue";
import { computed, inject, ShallowRef, toRefs } from "vue";
import { useComponentPiece } from "../vue";
import EditableImage from "../util/EditableImage.vue";

import { utils } from "pixi.js";

const props = defineProps<{
  component: PinComponent
}>();

const { component } = toRefs(props);
const isMaster = inject<boolean>('isMaster');

const rawSize = useComponentPiece(component, 'size', undefined) as ShallowRef<number | undefined>;
const color = useComponentPiece(component, 'color', 0xffffff);
const imageId = useComponentPiece(component, 'imageId', undefined);

let sizeSpecify = computed({
  get() {
    const rsize = rawSize.value;
    return rsize !== undefined && rsize !== 0;
  },
  set(x: boolean) {
    const old = sizeSpecify.value;
    if (old && !x) {
      rawSize.value = undefined;
    } else if (!old && x) {
      rawSize.value = 1;
    }
  },
})

let size = computed({
  get() {
    const s = rawSize.value;
    return sizeSpecify.value ? s as number : 1;
  },
  set(x: number) {
    if (sizeSpecify.value) {
      rawSize.value = x;
    }
  },
});
</script>

<style>
</style>
