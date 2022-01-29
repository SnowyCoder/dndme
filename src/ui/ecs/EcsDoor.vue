<template>
  <div>
    <div>
      Type:
      <span v-if="!isMaster">
        {{ doorTypeName }}
      </span>
      <select v-if="isMaster" v-model="doorType" class="form-select mb-3">
        <option value="normall">Normal</option>
        <option value="normalr">Normal right</option>
        <option value="rotate">Rotating</option>
      </select>
    </div>
    <div style="display: flex; align-items: center;">
      <span v-if="!isMaster">{{ open ? "Open" : "Closed" }}</span>
      <span v-if="!isMaster" v-show="locked" style="margin-left: 0.5rem;"><i class="fas fa-lock"></i></span>

      <c-button class="btn-secondary" v-if="isMaster" v-model:pressed="open">{{ open ? "Open" : "Closed" }}</c-button>
      <c-button class="btn-secondary" v-if="isMaster" v-model:pressed="locked">
        <div v-show="locked"><i class="fas fa-lock"></i></div>
        <div v-show="!locked"><i class="fas fa-lock-open"></i></div>
      </c-button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, PropType, toRefs } from "vue";
import { DoorComponent, DoorType } from "../../ecs/systems/doorSystem";
import { useComponentPiece } from "../vue";
import CButton from "../util/CButton.vue";

export default defineComponent({
  components: { CButton },
  props: {
    component: { type: Object as PropType<DoorComponent>, required: true },
  },
  setup(props) {
    const { component } = toRefs(props);
    const doorType = useComponentPiece(component, 'doorType', DoorType.NORMAL_RIGHT);
    const doorTypeName = computed(() => {
      switch (doorType.value) {
        case DoorType.NORMAL_LEFT:
          return "Normal";
        case DoorType.NORMAL_RIGHT:
          return "Normal right";
        case DoorType.ROTATE:
          return "Rotating";
        default:
          return "Unknown??"
      }
    });

    const open = useComponentPiece(component, 'open', false);
    const locked = useComponentPiece(component, 'locked', false);
    const isMaster = inject<boolean>("isMaster")!;

    return {
      isMaster, doorType, doorTypeName, open, locked,
    }
  }
});
</script>

<style>

</style>
