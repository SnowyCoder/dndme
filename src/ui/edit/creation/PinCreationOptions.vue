<script setup lang="ts">
import EditableRange from "@/ui/util/EditableRange.vue";
import { ResourceUpdateHistory, useResourcePiece } from "@/ui/vue";
import { PIN_TYPE } from "@/ecs/systems/pinSystem";

const defaultSize = useResourcePiece(PIN_TYPE, 'defaultSize', 1, ResourceUpdateHistory.REGISTER_COMMAND_IN_HISTORY);
</script>

<template>
  <div style="display: flex; align-items: center;">
    Default size
    <editable-range v-model="defaultSize" :min="0.5" :max=10 :step="0.1"/>
  </div>
</template>
