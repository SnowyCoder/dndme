<script setup lang="ts">
import { DEFAULT_LIGHT_SETTINGS, LightSettings, LIGHT_SETTINGS_TYPE, LOCAL_LIGHT_SETTINGS_TYPE } from "@/ecs/systems/lightSystem";
import { computed } from "vue";
import CButton from "@/ui/util/CButton.vue";
import EditableColor from "@/ui/util/EditableColor.vue";
import { useResourcePiece, useResourceReactive, useWorld } from "@/ui/vue";

const world = useWorld();

const light = useResourceReactive(world, LIGHT_SETTINGS_TYPE, {
  ambientLight: 0,
  needsLight: true,
  background: 0,
});

const visionType = useResourcePiece(LOCAL_LIGHT_SETTINGS_TYPE, 'visionType', 'dm');
const roleplayVision = computed({
  get: () => {
    return visionType.value === 'rp';
  },
  set: (x: boolean) => visionType.value = x ? 'rp' : 'dm',
});

function onLightSettingsReset() {
  world.addResource(Object.assign({
    type: 'light_settings',
  }, DEFAULT_LIGHT_SETTINGS) as LightSettings, 'update');
}
</script>


<template>
  <div class="px-3 py-2">
    <div class="d-flex align-items-center">
      Light:
      <EditableColor v-model="light.ambientLight" :readonly="!world.isMaster"></EditableColor>
    </div>
    <div class="d-flex align-items-center gap-2">
      <div class="">Needs light:</div>
      <input type="checkbox" class="form-check-input" v-model="light.needsLight" :readonly="!world.isMaster">
    </div>
    <div class="d-flex align-items-center gap-2">
      <div class="">Vision type:</div>
      <CButton class="btn-secondary" v-model:pressed="roleplayVision" :readonly="!world.isMaster">
        {{ roleplayVision ? "Roleplayer" : "Master" }}
      </CButton>
    </div>
    <div class="d-flex align-items-center">
      Background:
      <EditableColor v-model="light.background" :readonly="!world.isMaster"></EditableColor>
    </div>
    <div>
      <button class="btn btn-secondary" @click="onLightSettingsReset">Reset</button>
    </div>
  </div>
</template>
