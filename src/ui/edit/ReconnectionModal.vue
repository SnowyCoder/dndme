<script setup lang="ts">
import { useResource, useWorld } from "../vue";
import { resetPhase } from "../../secondPhase";
import { computed, ref, watchEffect } from "vue";
import Modal from "../util/Modal.vue";
import { DISCOVERY_CONFIG_TYPE, NETWORK_STATUS_TYPE } from "@/ecs/systems/back/NetworkSystem";
import EditableText from "../util/EditableText.vue";

const world = useWorld();
const netStatus = useResource(world, NETWORK_STATUS_TYPE);
const bodyMessage = computed(() => {
  const net = netStatus.value;
  switch (net.discoveryStatus) {
    case 'starting':
    case 'connecting': return "Connecting to Server...";
    case 'joining': return "Joining room...";
    case 'creating': return "Creating room...";
    case 'wrong_password': return "Server requires a password";
    case 'on_hold': return "Waiting for master...";
    case 'in_room':
      switch(net.gameStatus) {
        case 'downloading':
          if (net.connectionCount === 0) return "Connecting to Master...";
          else return "Downloading...";
        case 'waiting':
          return "Waiting for connection?";
        case 'playing':
          return 'Done!';
      }
  }
});
const title = computed(() => {
  const net = netStatus.value;
  switch(net.discoveryStatus) {
    case 'starting':
    case 'connecting':
    case 'joining':
    case 'creating':
    case 'in_room':
      return "Connecting...";
    case 'wrong_password':
      return "Error";
    case 'on_hold':
      return "Waiting...";
  }
});

const isConfirmVisible = ref(false);
const hint = ref('');
let oldName = '';

watchEffect(() => {
  const net = netStatus.value;
  switch(net.discoveryStatus) {
    case 'wrong_password':
      input.value = '';
      isConfirmVisible.value = true;
      hint.value = net.statusDescription;
      break;
    default:
      isConfirmVisible.value = false;
  }
});

const isConfirmDisabled = computed(() => {
  return netStatus.value.discoveryStatus === 'wrong_name' && input.value == oldName;
})
const shouldBeShown = computed(() => {
  const net = netStatus.value;
  return net.connectionCount === 0;
});

const input = ref("");

function confirm() {
  let changes: object | undefined;
  switch(netStatus.value.discoveryStatus) {
    case 'name_occupied':
    case 'wrong_name':
      changes = {
        room: input.value
      };
      break;
    case 'wrong_password':
      changes = {
        password: input.value
      };
      break;
  }
  if (changes != undefined) {
    world.editResource(DISCOVERY_CONFIG_TYPE, changes);
  }
}

function stop() {
  history.pushState(null, "", "#");
  resetPhase();
}
</script>


<template>
  <Modal
    backdrop="static"
    :keyboard="false"
    header-class="border-bottom-0"
    footer-class="border-top-0"
    v-model="shouldBeShown" title="Connecting...">

    <template #header>
      <h5 class="modal-title">{{ title }}</h5>
    </template>
    {{ bodyMessage }}

    <span v-if="hint != ''"><br/>{{ hint }}</span>

    <EditableText v-if="isConfirmVisible" placeholder="Password" v-model="input" :is-password="true" @enter="confirm()"/>

    <template #footer>
      <button class="btn btn-sm btn-outline-primary" v-if="isConfirmVisible" :disabled="isConfirmDisabled" @click="confirm()">
        Confirm
      </button>
      <button class="btn btn-sm btn-outline-secondary" @click="stop()">
        Cancel
      </button>
    </template>
  </Modal>
</template>

<style>
</style>
