<template>
  <div>
    <div class="d-flex align-items-center">
      W: <editable-number :readonly="!isMaster" v-model="w"/>
    </div>
    <div class="d-flex align-items-center">
      H: <editable-number :readonly="!isMaster" v-model="h"/>
    </div>
    <div class="d-flex align-items-center">
      Thick: <editable-number :readonly="!isMaster" v-model="thick"/>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, toRefs, triggerRef } from "vue";
import { WallComponent } from "../../ecs/systems/wallSystem";
import EditableNumber from "../util/EditableNumber.vue";
import { useComponentPiece } from "../vue";

export default defineComponent({
  components: { EditableNumber },
  props: {
    component: { type: Object as PropType<WallComponent>, required: true },
    isAdmin: { type: Boolean, default: false },
  },
  setup(props) {
    const { component } = toRefs(props);

    const vec = useComponentPiece(component, 'vec', [0, 0]);
    const thick = useComponentPiece(component, 'thickness', 5);

    const defineElement = (index: number) => computed({
      get: () => vec.value[index],
      set: (x: number) => {
        vec.value[index] = x;
        triggerRef(vec);
      }
    });

    const isMaster = inject<boolean>('isMaster')!;

    return {
      isMaster,
      w: defineElement(0),
      h: defineElement(1),
      thick,
    }
  }
});
</script>

<style>

</style>
