<template>
  <div>
    <div class="d-flex align-items-center">
      Dex:
      <editable-number :readonly="!isMaster" v-model="comp.initiativeModifier" nullable />
    </div>
    <div class="d-flex align-items-center">
      HP:
      <editable-number :readonly="!isMaster" v-model="comp.hitPoints" />
    </div>
    <div class="d-flex align-items-center">
      <span class="text-nowrap">Max HP:</span>
      <editable-number :readonly="!isMaster" v-model="comp.maxHitPoints" />
    </div>
    <div class="d-flex align-items-center">
      AC:
      <editable-number :readonly="!isMaster" v-model="comp.armorClass" />
    </div>
    <div class="d-flex align-items-center">
      Speed:
      <editable-number :readonly="!isMaster" v-model="comp.speed" />
    </div>
  </div>
</template>

<script lang="ts">

import { defineComponent, inject, PropType, toRefs } from "vue";
import { useComponentReactive } from "../vue";
import { StatsComponent } from "../../ecs/systems/battleSystem";
import EditableNumber from "../util/EditableNumber.vue";

export default defineComponent({
  components: { EditableNumber },
  props: {
    component: { type: Object as PropType<StatsComponent>, required: true },
  },
  setup(props) {
    const { component } = toRefs(props);

    const isMaster = inject<boolean>('isMaster');

    const comp = useComponentReactive(component, {
      initiativeModifier: undefined,
      hitPoints: 0,
      maxHitPoints: 0,
      armorClass: 0,
      speed: 0,
    });
    return {
      comp, isMaster,
    }
  },
});
</script>

<style>
</style>
