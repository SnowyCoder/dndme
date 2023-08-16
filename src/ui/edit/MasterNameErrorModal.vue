<script setup lang="ts">
import { useResource, useWorld } from "../vue";
import { resetPhase } from "../../secondPhase";
import { computed, ref, watch, watchEffect } from "vue";
import Modal from "../util/Modal.vue";
import { DISCOVERY_CONFIG_TYPE, NETWORK_STATUS_TYPE } from "@/ecs/systems/back/NetworkSystem";
import EditableText from "../util/EditableText.vue";

const world = useWorld();
const netStatus = useResource(world, NETWORK_STATUS_TYPE);
const bodyMessage = computed(() => {
  const net = netStatus.value;
  switch (net.discoveryStatus) {
    case 'name_occupied': return "Name already taken, are you running another tab?";
    case 'wrong_name': return "Invalid name, choose another one";
  }
  return "Nothing to say";
});

let oldName = '';

watchEffect(() => {
  const net = netStatus.value;
  switch(net.discoveryStatus) {
    case 'name_occupied':
    case 'wrong_name':
      const discovery = world.getResource(DISCOVERY_CONFIG_TYPE)!;
      input.value = discovery.room;
      oldName = discovery.room;
      break;
  }
});

const isConfirmDisabled = computed(() => {
  return input.value == oldName;
});

const shouldBeShown = computed(() => {
  const status = netStatus.value.discoveryStatus;
  return status == 'name_occupied' || status == 'wrong_name';
});


const input = ref("");

function confirm() {
  const sys = world.requireSystem('host_network');
  world.editResource(DISCOVERY_CONFIG_TYPE, {
    room: input.value
  });
  // tryCreateRoom is automatic
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
      <h5 class="modal-title">Name Error</h5>
    </template>
    {{ bodyMessage }}
    {{ netStatus.discoveryStatus }}

    <EditableText placeholder="New name (empty = auto)" v-model="input"/>

    <template #footer>
      <button class="btn btn-sm btn-outline-primary" :disabled="isConfirmDisabled" @click="confirm()">
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
