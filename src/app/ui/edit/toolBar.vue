<template>
  <b-button-toolbar type="dark" variant="info" class="bg-dark"
                    style="width: 100%; height: var(--topbar-height); z-index: 1000;" justify>
    <b-button-group v-if="world.isMaster" style="margin-right: 2rem">
      <b-button title="Undo" squared class="toolbar-btn plz-prioritize undo-redo-btn" :disabled="!this.canUndo" v-on:click="undo()">
        <i class="fas fa-undo"></i>
      </b-button>
      <b-button title="Redo" squared class="toolbar-btn plz-prioritize undo-redo-btn" :disabled="!this.canRedo" v-on:click="redo()">
        <i class="fas fa-redo"></i>
      </b-button>
    </b-button-group>

    <b-radio-group buttons v-model="tool">
      <b-radio ref="radioinspect" title="Inspect" value="inspect" squared
               :class="{'toolbar-btn': this.backgroundLocked, 'btn-warning': !this.backgroundLocked}">
        <i class="fas fa-hand-pointer"></i>
      </b-radio>
      <b-radio v-if="world.isMaster" title="Add wall" value="create_wall" squared class="toolbar-btn plz-prioritize">
        <wall-icon/>
      </b-radio>
      <b-radio v-if="world.isMaster" title="Add prop" value="create_prop" squared class="toolbar-btn plz-prioritize">
        <i class="fas fa-couch"></i>
      </b-radio>
      <b-radio v-if="world.isMaster" title="Add pin" value="create_pin" squared class="toolbar-btn plz-prioritize">
        <i class="fas fa-thumbtack"></i>
      </b-radio>
      <b-radio v-if="world.isMaster" title="Edit grid" value="grid" squared class="toolbar-btn plz-prioritize">
        <i class="fas fa-border-all"/>
      </b-radio>
      <b-radio v-if="world.isMaster" title="Light settings" value="light" squared class="toolbar-btn plz-prioritize">
        <i class="fas fa-lightbulb"/>
      </b-radio>
      <b-radio v-if="world.isMaster" title="Measure" value="measure" squared class="toolbar-btn plz-prioritize">
        <i class="fas fa-ruler"/>
      </b-radio>
      <b-radio title="Mouse trail" value="mouse_trail" squared class="toolbar-btn plz-prioritize">
        <mouse-trail-icon/>
      </b-radio>
    </b-radio-group>
    <b-button title="Export map" squared variant="success" class="btn-xs"
              v-on:click="world.events.emit('export_map')" v-if="world.isMaster">
      <i class="fas fa-download"/>
    </b-button>

    <div style="flex: 1 1 0;"/> <!-- Spacing -->
    <b-button title="Toggle sidebar" variant="warning" class="btn-xs" v-b-toggle.sidebar-right>
      <i class="fas fa-angle-double-right"/>
    </b-button>
  </b-button-toolbar>
</template>

<script lang="ts">

import {VComponent, VProp, Vue, VWatch} from "../vue";
import {Resource} from "../../ecs/resource";
import {World} from "../../ecs/world";
import {BACKGROUND_LAYER_TYPE, BackgroundLayerResource} from "../../ecs/systems/back/layerSystem";
import {TOOL_TYPE, ToolResource} from "../../ecs/systems/back/toolSystem";
import {Tool} from "../../ecs/tools/toolType";

import MouseTrailIcon from "../icons/mouseTrailIcon.vue";
import WallIcon from "../icons/wallIcon.vue";


@VComponent({
  components: {MouseTrailIcon, WallIcon}
})
export default class ToolBar extends Vue {
  @VProp({ required: true })
  world!: World;

  tool = 'inspect';
  backgroundLocked: boolean = true;

  canUndo = false;
  canRedo = false;

  mounted() {
    this.world.events.on('resource_edited', this.onResourceEdited, this);
    this.world.events.on('command_history_change', this.onCommandHistoryChange, this);

    let x = (this.$refs.radioinspect as Vue);
    x.$el.addEventListener('click', (e) => {
      if (!(e.target instanceof HTMLInputElement)) return;
      if (this.tool === 'inspect') {
        let locked = (this.world.getResource(BACKGROUND_LAYER_TYPE) as BackgroundLayerResource).locked;
        this.world.editResource(BACKGROUND_LAYER_TYPE, { locked: !locked });
      }
    });
  }

  unmounted() {
    this.world.events.off('resource_edited', this.onResourceEdited, this);
    this.world.events.off('command_history_change', this.onCommandHistoryChange, this);
  }

  onCommandHistoryChange(canUndo: boolean, canRedo: boolean) {
    this.canUndo = canUndo;
    this.canRedo = canRedo;
  }

  onResourceEdited(res: Resource) {
    if (res.type === BACKGROUND_LAYER_TYPE) {
      this.backgroundLocked = (res as BackgroundLayerResource).locked;
    } else if (res.type === TOOL_TYPE) {
      this.tool = (res as ToolResource).tool!;
    }
  }

  @VWatch('tool')
  onToolEdit(tool: Tool) {
    this.world.editResource('tool', {tool});
  }

  undo() {
    this.world.events.emit('command_undo');
  }

  redo() {
    this.world.events.emit('command_redo');
  }
}
</script>

<style>

.toolbar-btn.plz-prioritize {
  color: #fff;
  background-color: #2C3E50;
  border-color: #2C3E50;
}


.plz-prioritize.undo-redo-btn.disabled, .plz-prioritize.undo-redo-btn:disabled {
  background-color: #343a40;
  border-color: #343a40;
  box-shadow: none;
}
</style>