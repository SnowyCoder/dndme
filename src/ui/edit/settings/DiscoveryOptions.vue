<script setup lang="ts">
import { computed, shallowRef, watchEffect } from "vue";
import { useResource, useWorld } from "@/ui/vue";
import EditableText from "@/ui/util/EditableText.vue";
import CButton from "@/ui/util/CButton.vue";
import { RoomRenamePromiseResult } from "@/network/discovery/ServerSignaler";
import { getLogger } from "@/ecs/systems/back/log/Logger";

const world = useWorld();
const config = useResource(world, 'disvocery_config');
const net = world.requireSystem('host_network');

const roomName = shallowRef(config.value.room);
const password = shallowRef(config.value.password);
const hint = shallowRef(config.value.hint);

const errorMessage = shallowRef<string | null>(null);
const isLoading = shallowRef(false);

const buttonName = computed(() => {
  if (roomName.value != config.value.room) {
    return 'Rename'
  } else {
    return 'Edit passowrd'
  }
});
const isButtonAvailable = computed(() => {
  if (isLoading.value) return false;
  return roomName.value !== config.value.room ||
      password.value !== config.value.password ||
      hint.value !== config.value.hint;
});

async function changeThings(): Promise<RoomRenamePromiseResult> {
  if (roomName.value !== config.value.room) {
    const res = await net.tryRename(roomName.value);
    if (res != 'ok') return res;
  }
  if (password.value !== config.value.password || hint.value !== config.value.password) {
    await net.tryEditPassword(password.value, hint.value);
  }
  return 'ok';
}

function onClick() {
  if (!isButtonAvailable.value) return;
  isLoading.value = true;
  changeThings()
    .then((x) => {
      let err = null;
      if (x == 'ok') {
      } else if (x == 'invalid_name') {
        err = 'Invalid name';
      } else if (x == 'name_already_taken') {
        err = 'Name already taken';
      } else {
        err = x;
      }
      errorMessage.value = err;
      isLoading.value = false;
    })
    .catch((e) => {
      getLogger('ui.discovery_options').error('Error while calling changeThings', e);
      errorMessage.value = 'Unhandled error while editing name';
      isLoading.value = false;
    })
}

</script>

<template>
  <div>
    <div style="display: flex; align-items: center;">
      Room name:
      <EditableText v-model="roomName" :readonly="isLoading" @enter="onClick()" placeholder="Automatic"/>
    </div>
    <div style="display: flex; align-items: center;">
      Password:
      <EditableText v-model="password" :is-password="true" :readonly="isLoading" placeholder="Password"  @enter="onClick()"/>
    </div>
    <div style="display: flex; align-items: center;">
      Hint:
      <EditableText v-model="hint" :readonly="isLoading" @enter="onClick()" placeholder="Speak Friend and Enter"/>
    </div>
    <div v-if="errorMessage != null">
      {{ errorMessage }}
    </div>
    <div style="display: flex; align-items: center; justify-content: center;">
      <CButton class="btn-primary" :readonly="!isButtonAvailable" @click="onClick">
        {{ buttonName }}
      </CButton>
    </div>
  </div>
</template>
