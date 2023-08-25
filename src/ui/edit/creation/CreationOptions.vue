<script setup lang="ts">
import { CREATION_INFO_TYPE } from "@/ecs/resource";
import { PropType, VueElementConstructor } from "vue";
import { ResourceUpdateHistory, useResourcePiece } from "@/ui/vue";

const props = defineProps<{
  additionalOptions: PropType<VueElementConstructor>,
}>();

const exitAfterCreation = useResourcePiece(CREATION_INFO_TYPE, 'exitAfterCreation', true, ResourceUpdateHistory.QUICK_UPDATE);
</script>

<template>
  <div>
    <div style="display: flex; align-items: center;">
      Create once:
      <input type="checkbox" class="form-check-input" v-model="exitAfterCreation">
    </div>
    <component :is="additionalOptions" v-if="additionalOptions !== undefined"></component>
  </div>
</template>
