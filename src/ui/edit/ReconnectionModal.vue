<script setup lang="ts">
import { networkStatus, useResource, useWorld } from "../vue";
import { resetPhase } from "../../secondPhase";
import { computed, ref, watch } from "vue";
import Modal from "../util/Modal.vue";
import { DISCOVERY_CONFIG_TYPE, NETWORK_STATUS_TYPE } from "@/ecs/systems/back/NetworkSystem";

const world = useWorld();
const netStatus = useResource(world, NETWORK_STATUS_TYPE);
const bodyMessage = computed(() => {
  const net = netStatus.value;
  if (!networkStatus.isOnline) {
    return "Check your internet connection";
  }
  switch (net.statusDescription) {
    case 'starting':
    case 'connecting': return "Connecting to Server...";
    case 'joining': return "Joining room...";
    case 'creating': return "Creating room...";
    case 'downloading': return "Downloading data...";
    case 'name_occupied': return "Name already taken, are you running another tab?";
    case 'wrong_password': return "Server requires a password";
    case 'on_hold': return "Waiting for master...";
    case 'wrong_name': return "Invalid name, choose another one";
    case 'connected': return "Connected!";// unreachable
  }
});
const title = computed(() => {
  const net = netStatus.value;
  switch(net.discoveryStatus) {
    case 'starting':
    case 'connecting':
    case 'joining':
    case 'creating':
      console.log('DISCOVERY_STATUS', net.discoveryStatus);
      return "Connecting...";
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
    case 'name_occupied':
    case 'wrong_password':
    case 'wrong_name':
      return "Error";
    case 'on_hold':
      return "Waiting...";
  }
});

let isConfirmVisible = ref(false);
let placeholder = ref('');
let oldName = '';
watch(netStatus, (val) => {
  switch(val.discoveryStatus) {
    case 'name_occupied':
    case 'wrong_name':
      const discovery = world.getResource(DISCOVERY_CONFIG_TYPE)!;
      input.value = discovery.room;
      oldName = discovery.room;
      isConfirmVisible.value = true;
      placeholder.value = "New name (empty = auto)";
      break;
    case 'wrong_password':
      input.value = '';
      isConfirmVisible.value = true;
      placeholder.value = "Password";
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
