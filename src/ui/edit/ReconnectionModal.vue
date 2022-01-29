
<template>
  <Modal
    backdrop="static"
    :keyboard="false"
    header-class="border-bottom-0 bg-dark text-light"
    body-class="bg-dark text-light"
    footer-class="border-top-0 bg-dark text-light"

      v-model="shouldBeShown" title="Connecting...">
    <template #header>
      <h5 class="modal-title">Connecting...</h5>
    </template>

    {{ bodyMessage }}

    <template #footer>
      <button class="btn btn-sm btn-outline-secondary" @click="stop()">
        Cancel
      </button>
    </template>
  </Modal>
</template>


<script lang="ts">
import { NetworkStatusResource, NETWORK_STATUS_TYPE } from "../../ecs/systems/back/networkSystem";
import { World } from "../../ecs/world";
import { networkStatus, useResource } from "../vue";
import { onHashChange } from "../../secondPhase";
import { computed, defineComponent, inject, ShallowRef } from "vue";
import Modal from "../util/Modal.vue";

export default defineComponent({
  components: { Modal },
  setup() {
    const world = inject<ShallowRef<World>>("world")!;
    const netStatus = useResource<NetworkStatusResource>(world.value, NETWORK_STATUS_TYPE);
    const bodyMessage = computed(() => {
      let msg = "Connecting...";
      const net = netStatus.value;
      if (!networkStatus.isOnline) {
        msg = "Check your internet connection";
      }
      else if (net.trackerCount === 0 && net.connectionCount === 0) {
        msg = "Connecting to trackers...";
      }
      else if (net.connectionCount === 0) {
        msg = "Waiting for master...";
      }
      else if (!net.isBootstrapDone) {
        msg = "Downloading data...";
      }
      return msg;
    });
    const shouldBeShown = computed(() => {
      const net = netStatus.value;
      return !networkStatus.isOnline || net.connectionCount === 0 || !net.isBootstrapDone;
    });
    return {
      bodyMessage,
      shouldBeShown,
    };
  },
  methods: {
    stop() {
      history.pushState(null, "", "#");
      onHashChange();
    },
  },
});
</script>

<style>
</style>
