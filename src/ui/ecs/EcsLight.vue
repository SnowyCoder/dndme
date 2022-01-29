<template>
  <div>
    <div>
      Color:
      <editable-color :readonly="!isMaster" v-model="color"></editable-color>
    </div>
    <div style="display: flex; align-items: center;">
      Visibility Range:
      <editable-number :readonly="!isMaster" v-model="range" isNegative="false"></editable-number>
    </div>
  </div>
</template>

<script lang="ts">
import { LightComponent } from "../../ecs/systems/lightSystem";
import EditableColor from "../util/EditableColor.vue";
import EditableNumber from "../util/EditableNumber.vue";
import { defineComponent, inject, PropType, toRefs } from "vue";
import { useComponentPiece } from "../vue";

export default defineComponent({
  components: { EditableColor, EditableNumber },
  props: {
    component: { type: Object as PropType<LightComponent>, required: true },
  },
  setup(props) {
    const { component } = toRefs(props);
    const isMaster = inject<boolean>('isMaster');
    const color = useComponentPiece(component, 'color', 0xffffff);
    const range = useComponentPiece(component, 'range', 0);
    return {
      color, range,
      isMaster,
    };
  }
});
</script>

<style>

</style>
