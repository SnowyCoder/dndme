<script setup lang="ts">
import EditableRange from "@/ui/util/EditableRange.vue";
import { useResourcePiece } from "@/ui/vue";

const thickness = useResourcePiece('wall_creation', 'thickness', 5);
</script>

<template>
  <div style="display: flex; align-items: center;">
    Thickness
    <editable-range v-model="thickness" :min="1" :max=50 :step="1"/>
  </div>
</template>
