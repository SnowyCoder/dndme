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

    <component v-bind:is="entry.icon" v-bind="entry.iconProps.value" v-for="entry in entries" :key="entry.id"></component>

    <!--b-radio-group buttons v-model="tool">
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
    </b-radio-group-->
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

import { shallowRef, ShallowRef, VComponent, Vue } from "../vue";
import { Resource } from "../../ecs/resource";
import { World } from "../../ecs/world";
import { BACKGROUND_LAYER_TYPE, BackgroundLayerResource } from "../../ecs/systems/back/layerSystem";
import { TOOL_TYPE, ToolResource } from "../../ecs/systems/back/toolSystem";

import MouseTrailIcon from "../icons/mouseTrailIcon.vue";
import WallIcon from "../icons/wallIcon.vue";
import { VueConstructor } from "vue";
import { ToolbarItemComponent, TOOLBAR_ITEM_TYPE } from "../../ecs/systems/toolbarSystem";
import { SingleEcsStorage } from "../../ecs/storage";
import { Component } from "../../ecs/component";
import { arrayRemoveIf } from "../../util/array";

interface EntryData {
  id: number;
  icon: VueConstructor | string;
  iconProps: ShallowRef<object>;
  priority: number;
}


@VComponent({
  components: {MouseTrailIcon, WallIcon},
  provide() {
    return {
      currentTool: (this as any).currentTool,
    }
  },
  inject: ['world'],
})
export default class ToolBar extends Vue {
  world!: World;

  currentTool = shallowRef('inspect');
  backgroundLocked: boolean = true;

  entries: EntryData[] = [];

  canUndo = false;
  canRedo = false;

  mounted() {
    this.world.events.on('resource_edited', this.onResourceEdited, this);
    this.world.events.on('command_history_change', this.onCommandHistoryChange, this);

    let x = (this.$refs.radioinspect as Vue);
    x.$el.addEventListener('click', (e) => {
      if (!(e.target instanceof HTMLInputElement)) return;
      if (this.currentTool.value === 'inspect') {
        let locked = (this.world.getResource(BACKGROUND_LAYER_TYPE) as BackgroundLayerResource).locked;
        this.world.editResource(BACKGROUND_LAYER_TYPE, { locked: !locked });
      }
    });

    this.entries = [];
    const toolbarStorage = this.world.getStorage(TOOLBAR_ITEM_TYPE) as SingleEcsStorage<ToolbarItemComponent>;
    for (let x of toolbarStorage.getComponents()) {
      this.entries.push({
        id: x.entity,
        icon: x.icon,
        iconProps: shallowRef(x.iconProps),
        priority: x.priority,
      })
    }
    this.world.events.on('component_add', this.onComponentAdd, this);
    this.world.events.on('component_edited', this.onComponentEdited, this);
    this.world.events.on('component_remove', this.onComponentRemove, this);
  }

  sortEntries() {
    this.entries.sort((a, b) => a.priority - b.priority);
  }

  onComponentAdd(c: Component) {
    if (c.type === TOOLBAR_ITEM_TYPE) {
      const e = c as ToolbarItemComponent;
      this.entries.push({
        id: e.entity,
        icon: e.icon,
        iconProps: shallowRef(e.iconProps),
        priority: e.priority,
      });
      this.sortEntries();
    }
  }

  onComponentEdited(c: Component) {
    if (c.type === TOOLBAR_ITEM_TYPE) {
      const e = this.entries.find(x => x.id == c.entity);
      if (e === undefined) return;
      const x = c as ToolbarItemComponent;
      e.icon = x.icon;
      e.priority = x.priority;
      e.iconProps = shallowRef(x.iconProps);
      this.sortEntries();
    }
  }

  onComponentRemove(c: Component) {
    if (c.type === TOOLBAR_ITEM_TYPE) {
      arrayRemoveIf(this.entries, e => e.id == c.entity);
    }
  }

  beforeDestroy() {
    this.world.events.off('resource_edited', this.onResourceEdited, this);
    this.world.events.off('command_history_change', this.onCommandHistoryChange, this);
    this.world.events.off('component_add', this.onComponentAdd, this);
    this.world.events.off('component_edited', this.onComponentEdited, this);
    this.world.events.off('component_remove', this.onComponentRemove, this);
  }

  onCommandHistoryChange(canUndo: boolean, canRedo: boolean) {
    this.canUndo = canUndo;
    this.canRedo = canRedo;
  }

  onResourceEdited(res: Resource) {
    if (res.type === BACKGROUND_LAYER_TYPE) {
      this.backgroundLocked = (res as BackgroundLayerResource).locked;
    } else if (res.type === TOOL_TYPE) {
      this.currentTool.value = (res as ToolResource).tool!;
    }
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
.plz-prioritize.undo-redo-btn.disabled, .plz-prioritize.undo-redo-btn:disabled {
  background-color: #343a40;
  border-color: #343a40;
  box-shadow: none;
}
</style>
