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
        <svg class="svg-inline--fa fa-w-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 234.809 234.809"
             xml:space="preserve">
                    <path fill="currentColor" d="M7.5,53.988c-4.135,0-7.5-3.364-7.5-7.5V20.571c0-4.136,3.365-7.5,7.5-7.5h94.904c4.135,0,7.5,3.364,7.5,7.5v25.917
                      c0,4.136-3.365,7.5-7.5,7.5H7.5z M227.309,53.988c4.135,0,7.5-3.364,7.5-7.5V20.571c0-4.136-3.365-7.5-7.5-7.5h-94.904
                      c-4.135,0-7.5,3.364-7.5,7.5v25.917c0,4.136,3.365,7.5,7.5,7.5H227.309z M164.856,109.904c4.135,0,7.5-3.365,7.5-7.5V76.488
                      c0-4.136-3.365-7.5-7.5-7.5H69.952c-4.135,0-7.5,3.364-7.5,7.5v25.917c0,4.135,3.365,7.5,7.5,7.5H164.856z M39.952,109.904
                      c4.136,0,7.5-3.364,7.5-7.5V76.488c0-4.136-3.364-7.5-7.5-7.5H8.048c-4.136,0-7.5,3.364-7.5,7.5v25.917c0,4.136,3.364,7.5,7.5,7.5
                      H39.952z M226.761,109.904c4.136,0,7.5-3.364,7.5-7.5V76.488c0-4.136-3.364-7.5-7.5-7.5h-31.904c-4.136,0-7.5,3.364-7.5,7.5v25.917
                      c0,4.136,3.364,7.5,7.5,7.5H226.761z M102.404,165.821c4.135,0,7.5-3.364,7.5-7.5v-25.917c0-4.135-3.365-7.5-7.5-7.5H7.5
                      c-4.135,0-7.5,3.365-7.5,7.5v25.917c0,4.136,3.365,7.5,7.5,7.5H102.404z M227.309,165.821c4.135,0,7.5-3.364,7.5-7.5v-25.917
                      c0-4.135-3.365-7.5-7.5-7.5h-94.904c-4.135,0-7.5,3.365-7.5,7.5v25.917c0,4.136,3.365,7.5,7.5,7.5H227.309z M164.856,221.738
                      c4.135,0,7.5-3.364,7.5-7.5v-25.917c0-4.136-3.365-7.5-7.5-7.5H69.952c-4.135,0-7.5,3.364-7.5,7.5v25.917c0,4.136,3.365,7.5,7.5,7.5
                      H164.856z M39.952,221.738c4.136,0,7.5-3.364,7.5-7.5v-25.917c0-4.136-3.364-7.5-7.5-7.5H8.048c-4.136,0-7.5,3.364-7.5,7.5v25.917
                      c0,4.136,3.364,7.5,7.5,7.5H39.952z M226.761,221.738c4.136,0,7.5-3.364,7.5-7.5v-25.917c0-4.136-3.364-7.5-7.5-7.5h-31.904
                      c-4.136,0-7.5,3.364-7.5,7.5v25.917c0,4.136,3.364,7.5,7.5,7.5H226.761z"/>
          </svg>
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

@VComponent
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