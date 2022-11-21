<template>
  <div>
    <div class="d-flex align-items-center">
      Color:
      <editable-color :readonly="!isMaster" v-model="color" />
    </div>
    <div class="d-flex align-items-center">
      Size:
      <input type="checkbox" title="Specify" v-model="sizeSpecify" :readonly="!isMaster" />
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

<script lang="ts">
import { PinComponent } from "../../ecs/systems/pinSystem";

import EditableText from "../util/EditableText.vue";
import EditableColor from "../util/EditableColor.vue";
import EditableRange from "../util/EditableRange.vue";
import { computed, defineComponent, inject, PropType, ShallowRef, toRefs } from "vue";
import { useComponentPiece } from "../vue";

export default defineComponent({
  components: { EditableText, EditableColor, EditableRange },
  props: {
    component: { type: Object as PropType<PinComponent>, required: true },
  },
  setup(props) {
    const { component } = toRefs(props);

    const isMaster = inject<boolean>('isMaster');

    const rawSize = useComponentPiece(component, 'size', undefined) as ShallowRef<number | undefined>;

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
    return {
      color: useComponentPiece(component, 'color', 0xffffff),
      sizeSpecify, size, isMaster,
    }
  },
});
</script>

<style>
</style>
