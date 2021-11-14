<template>
  <b-sidebar id="sidebar-right" title="Sidebar"
             bg-variant="dark" text-variant="light" right visible no-header shadow
             sidebar-class="under-navbar">
    <!----------------------------------      GRID CONTROL      ---------------------------------->
    <grid-edit class="px-3 py-2" v-show="tool === 'grid'" v-bind:world="world"/>
    <!----------------------------------      ENTITY INSPECTOR      ---------------------------------->
    <div v-show="tool === 'inspect'">
      <entity-inspect v-bind:world="world"/>
    </div>
    <!----------------------------------      LIGHT SETTINGS      ---------------------------------->
    <light-settings-edit  v-show="tool === 'light'" v-bind:world="world"/>
    <!----------------------------------      CREATION OPTIONS      ---------------------------------->
    <creation-options class="px-3 py-2" v-bind:world="world"/>

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

import {VComponent, VProp, Vue, VWatch} from "../vue";
import {Resource} from "../../ecs/resource";
import {World} from "../../ecs/world";
import {TOOL_TYPE, ToolResource} from "../../ecs/systems/back/toolSystem";
import GridEdit from "./gridEdit.vue";
import CreationOptions from "./creationOptions.vue";
import LightSettingsEdit from "./lightSettingsEdit.vue";
import EntityInspect from "../ecs/entityInspect.vue";
import {NETWORK_STATUS_TYPE, NetworkStatusResource} from "../../ecs/systems/back/networkSystem";

@VComponent({
  components: {
    GridEdit, EntityInspect, LightSettingsEdit, CreationOptions
  }
})
export default class ToolBar extends Vue {
  @VProp({ required: true })
  world!: World;

  tool = 'inspect';
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
    if (res.type === TOOL_TYPE) {
      this.tool = (res as ToolResource).tool!;
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