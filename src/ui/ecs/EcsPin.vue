<template>
  <div>
    <div class="d-flex align-items-center">
      <!-- Image -->
      <editable-image :readonly="!isMaster" v-model="imageId" :border="{
        color: colorToHex(color),
        width: hideColor ? 1 : 0.8,
      }" />
    </div>
    <div class="d-flex align-items-center">
      Color:
      <editable-color :readonly="!isMaster || hideColor" v-model="color" />
      <button v-if="isMaster && imageId !== undefined" type="button" class="btn btn-toolbar-entry btn-sm rounded-0" style="display: grid;"
                :title="hideColor ? 'Show color' : 'Hide color'"
                @click="hideColor = !hideColor">
        <div class="g11" v-show="!hideColor"><i class="fas fa-eye"/></div>
        <div class="g11" v-show="hideColor"><i class="fas fa-eye-slash"/></div>
      </button>
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
import { computed, inject, ShallowRef, toRefs, watch } from "vue";
import { useComponentPiece } from "../vue";
import EditableImage from "../util/EditableImage.vue";

import { Color } from "@/pixi";

const colorToHex = (x: number) => new Color(x).toHex();

const props = defineProps<{
  component: PinComponent
}>();

const { component } = toRefs(props);
const isMaster = inject<boolean>('isMaster');

const rawSize = useComponentPiece(component, 'size', undefined) as ShallowRef<number | undefined>;
const color = useComponentPiece(component, 'color', 0xffffff);
const imageId = useComponentPiece(component, 'imageId', undefined);
const hideColor = useComponentPiece(component, 'hideColor', false);

watch(imageId, x => {
  if (!x) {
    hideColor.value = false;
  }
})

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
