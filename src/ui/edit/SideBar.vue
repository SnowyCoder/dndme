<template>
  <transition enter-active-class="slide" enter-to-class="show" leave-class="show" leave-active-class="slide">
    <div v-if="open" id="sidebar-right" aria-label="Sidebar" class="bg-dark text-light shadow under-navbar">
      <div class="sidebar-body">
      <component :is="sideBar.current" v-bind="sideBar.currentProps" v-if="sideBar.current !== undefined"></component>
      </div>

      <footer class="sidebar-footer">
        {{ networkStatus.trackerCount }}
        <div style="margin-left: 0.2rem">
          <i class="fas fa-server"></i>
        </div>
        {{ networkStatus.connectionCount }}
        <div v-bind:class="{ rotate: networkStatus.isBuffering }" style="margin-left: 0.2rem">
          <i class="fas fa-sync-alt"></i>
        </div>
      </footer>
    </div>
  </transition>
</template>

<script lang="ts">
import { World } from "../../ecs/world";
import { NETWORK_STATUS_TYPE, NetworkStatusResource } from "../../ecs/systems/back/networkSystem";
import { computed, defineComponent, inject, ShallowRef } from "vue";
import { useResource } from "../vue";
import { SidebarResource, SIDEBAR_TYPE } from "../../ecs/systems/toolbarSystem";

export default defineComponent({
  setup() {
    const world = inject<ShallowRef<World>>("world")!.value;
    const sideBar = useResource<SidebarResource>(world, SIDEBAR_TYPE);
    const networkStatus = useResource<NetworkStatusResource>(world, NETWORK_STATUS_TYPE);

    const open = computed({
      get() {
        return sideBar.value?.open ?? true;
      },
      set(x: boolean) {
        world.editResource(SIDEBAR_TYPE, {
          open: x,
        });
      }
    })

    return {
      sideBar, networkStatus,
      open,
    }
  },
});

function shallowRef(arg0: boolean) {
throw new Error("Function not implemented.");
}
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
