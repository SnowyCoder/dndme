<script setup lang="ts">
import WallSettings from "../settings/WallSettings.vue";
import { ResourceUpdateHistory, useResourceReactive, useWorld } from "@/ui/vue";
import { BlockDirection } from "@/ecs/systems/back/VisibilitySystem";

const world = useWorld();
const res = useResourceReactive(world, 'wall_creation', {
  'thickness': 5,
  'blockLight': BlockDirection.BOTH,
  'blockPlayer': BlockDirection.BOTH,
}, ResourceUpdateHistory.REGISTER_COMMAND_IN_HISTORY);

</script>

<template>
  <div style="px-5">
    <WallSettings :is-master="true"
        v-model:thickness="res.thickness"
        v-model:block-light="res.blockLight"
        v-model:block-player="res.blockPlayer" />
  </div>
</template>
