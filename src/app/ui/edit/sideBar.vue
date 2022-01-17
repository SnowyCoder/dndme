<template>
  <b-sidebar id="sidebar-right" title="Sidebar"
             bg-variant="dark" text-variant="light" right visible no-header shadow
             sidebar-class="under-navbar">
    <!--
    < !----------------------------------      GRID CONTROL      ---------------------------------- >
    <grid-edit class="px-3 py-2" v-show="tool === 'grid'"/>
    < !----------------------------------      ENTITY INSPECTOR      ---------------------------------- >
    <div v-show="tool === 'inspect'">
      <entity-inspect/>
    </div>
    < !----------------------------------      LIGHT SETTINGS      ---------------------------------- >
    <light-settings-edit  v-show="tool === 'light'"/>
    < !----------------------------------      CREATION OPTIONS      ---------------------------------- >
    <creation-options class="px-3 py-2"/>
    -->
    <component :is="compType" v-bind="compProps" v-if="compType !== undefined"></component>

    <template v-slot:footer>
      <div class="sidebar-footer">
        {{ trackerCount }}
        <div style="margin-left: 0.2rem">
          <i class="fas fa-server"></i>
        </div>
        {{ connectionCount }}
        <div v-bind:class="{ rotate: connectionBuffering }" style="margin-left: 0.2rem">
          <i class="fas fa-sync-alt"></i>
        </div>
      </div>
    </template>
  </b-sidebar>
</template>

<script lang="ts">

import {shallowRef, ShallowRef, VComponent, Vue} from "../vue";
import {Resource} from "../../ecs/resource";
import {World} from "../../ecs/world";
import {NETWORK_STATUS_TYPE, NetworkStatusResource} from "../../ecs/systems/back/networkSystem";
import { VueConstructor } from "vue/types/umd";
import { SidebarResource, SIDEBAR_TYPE } from "../../ecs/systems/toolbarSystem";

@VComponent({
  inject: ['world'],
})
export default class ToolBar extends Vue {
  world!: World;

  compType: VueConstructor | undefined;
  compProps: ShallowRef<object> = shallowRef({});

  connectionCount = 0;
  trackerCount = 0;
  connectionBuffering = false;

  mounted() {
    this.world.events.on('resource_edited', this.onResourceEdited, this);
  }

  unmounted() {
    this.world.events.off('resource_edited', this.onResourceEdited, this);
  }

  onResourceEdited(res: Resource) {
    if (res.type === SIDEBAR_TYPE) {
      const r = res as SidebarResource;
      this.compType = r.current;
      this.compProps.value = r.currentProps ?? {};
    } else if (res.type === NETWORK_STATUS_TYPE) {
      let r = res as NetworkStatusResource;
      this.trackerCount = r.trackerCount;
      this.connectionCount = r.connectionCount;
      this.connectionBuffering = r.isBuffering;
    }
  }
}
</script>


<style>

.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: right;
}
</style>
