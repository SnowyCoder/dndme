<template>
  <transition enter-active-class="slide" enter-to-class="show" leave-from-class="show" leave-active-class="slide">
    <div v-if="open" id="sidebar-right" aria-label="Sidebar" class="bg-dark text-light shadow under-toolbar">
      <div class="sidebar-body">
      <component :is="sideBar.current" v-bind="sideBar.currentProps" v-if="sideBar.current !== undefined"></component>
      </div>

      <footer class="sidebar-footer">
        <div title="Server connection status" class="sidebar-footer">
          {{ networkStatus.signalerConnected ? 'ok' : 'err' }}
          <div style="margin-left: 0.2rem; margin-right: 0.6rem">
            <i class="fas fa-server"></i>
          </div>
        </div>

        <div title="Peer connection count" class="sidebar-footer">
          {{ networkStatus.connectionCount }}
          <div v-bind:class="{ rotate: networkStatus.isBuffering }" style="margin-left: 0.2rem">
            <i class="fas fa-sync-alt"></i>
          </div>
        </div>
      </footer>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { NETWORK_STATUS_TYPE } from "@/ecs/systems/back/NetworkSystem";
import { computed } from "vue";
import { useResource, useWorld } from "../vue";
import { SIDEBAR_TYPE } from "@/ecs/systems/toolbarSystem";

const world = useWorld();
const sideBar = useResource(world, SIDEBAR_TYPE);
const networkStatus = useResource(world, NETWORK_STATUS_TYPE);

const open = computed({
  get() {
    return sideBar.value?.open ?? true;
  },
  set(x: boolean) {
    world.editResource(SIDEBAR_TYPE, {
      open: x,
    });
  }
});
</script>


<style lang="scss">

#sidebar-right {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  width: 320px;
  max-width: 100%;
  max-height: 100%;
  margin: 0;
  outline: 0;
  transform: translateX(0);

  &.slide {
    transition: transform 0.3s ease-in-out;
    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  left: auto;
  right: 0;

  &.slide:not(.show) {
    transform: translateX(100%);
  }

  .sidebar-body {
    flex-grow: 1;
    height: 100%;
    overflow-y: auto;
  }
  .sidebar-footer {
    display: flex;
    align-items: center;
    justify-content: right;
  }
}
</style>
../../ecs/systems/back/NetworkSystem
../../ecs/World
