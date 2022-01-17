
<template>
  <b-modal
      no-close-on-backdrop no-close-on-esc hide-header-close
      header-bg-variant="dark"
      header-text-variant="light"
      header-class="border-bottom-0"
      body-bg-variant="dark"
      body-text-variant="light"
      footer-bg-variant="dark"
      footer-text-variant="light"
      footer-class="border-top-0"
      v-model="shouldBeShown" title="Connecting...">
    {{ bodyMessage }}

    <template #modal-footer>
      <b-button size="sm" variant="outline-secondary" @click="stop()">
        Cancel
      </b-button>
    </template>
  </b-modal>
</template>


<script lang="ts">
import { Resource } from "../../ecs/resource";
import { NetworkStatusResource, NETWORK_STATUS_TYPE } from "../../ecs/systems/back/networkSystem";
import { World } from "../../ecs/world";
import {networkStatus, VComponent, VProp, Vue} from "../vue";
import { onHashChange } from "../../index";

@VComponent({
  inject: ['world']
})
export default class ReconnectionModal extends Vue {
  world!: World;
  trackerCount: number = 0;
  connectionCount: number = 0;
  isBootstrapped: boolean = false;

  get shouldBeShown(): boolean {
    return !networkStatus.isOnline || this.connectionCount === 0 || !this.isBootstrapped;
  }

  get bodyMessage(): string {
    let msg = 'Connecting...';
    if (!networkStatus.isOnline) {
      msg = 'Check your internet connection';
    } else if (this.trackerCount === 0 && this.connectionCount === 0) {
      msg = 'Connecting to trackers...';
    } else if (this.connectionCount === 0) {
      msg = 'Waiting for master...';
    } else if (!this.isBootstrapped) {
      msg = 'Downloading data...';
    }
    return msg;
  }

  stop() {
    history.pushState(null, "", '#');
    onHashChange();
  }

  onResourceEdited(res: Resource) {
    if (res.type === NETWORK_STATUS_TYPE) {
      const status = res as NetworkStatusResource;
      this.trackerCount = status.trackerCount;
      this.connectionCount = status.connectionCount;
      this.isBootstrapped = status.isBootstrapDone;
    }
  }

  mounted() {
    this.world.events.on('resource_edited', this.onResourceEdited, this);
  }

  unmounted() {
    this.world.events.off('resource_edited', this.onResourceEdited, this);
  }
}
</script>

<style>
</style>
