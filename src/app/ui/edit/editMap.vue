<template>
  <div class="game">

    <b-button-toolbar type="dark" variant="info" class="bg-dark"
                      style="width: 100%; height: var(--topbar-height); z-index: 1000;" justify>
      <b-button-group v-if="isAdmin" style="margin-right: 2rem">
        <b-button title="Undo" squared class="toolbar-btn undo-redo-btn" :disabled="!this.canUndo" v-on:click="undo()">
          <i class="fas fa-undo"></i>
        </b-button>
        <b-button title="Redo" squared class="toolbar-btn undo-redo-btn" :disabled="!this.canRedo" v-on:click="redo()">
          <i class="fas fa-redo"></i>
        </b-button>
      </b-button-group>

      <b-button-group>
        <b-button title="Inspect" squared class="toolbar-btn" v-on:click="changeTool('inspect')">
          <i class="fas fa-hand-pointer"></i>
        </b-button>
        <b-button title="Add wall" squared class="toolbar-btn" v-on:click="changeTool('create_wall')" v-if="isAdmin">
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
        </b-button>
        <b-button title="Add object" squared class="toolbar-btn" v-on:click="changeTool('create_prop')" v-if="isAdmin">
          <i class="fas fa-plus"></i>
        </b-button>
        <b-button title="Add pin" squared class="toolbar-btn" v-on:click="changeTool('create_pin')" v-if="isAdmin">
          <i class="fas fa-thumbtack"></i>
        </b-button>
        <b-button title="Edit grid" squared class="toolbar-btn" v-on:click="changeTool('grid')" v-if="isAdmin">
          <i class="fas fa-border-all"/>
        </b-button>
        <b-button title="Light settings" squared class="toolbar-btn" v-on:click="changeTool('light')" v-if="isAdmin">
          <i class="fas fa-lightbulb"/>
        </b-button>
      </b-button-group>
      <b-button title="Export map" squared variant="success" class="btn-xs" v-on:click="phase.exportMap()"
                v-if="isAdmin">
        <i class="fas fa-download"/>
      </b-button>

      <div style="flex: 1 1 0;"/> <!-- Spacing -->
      <b-button title="Toggle sidebar" variant="warning" class="btn-xs" v-b-toggle.sidebar-right>
        <i class="fas fa-angle-double-right"/>
      </b-button>
    </b-button-toolbar>


    <div id="canvas-container" style="width: 100%; height: calc(100vh - var(--topbar-height));">

    </div>

    <!----------------------------------------------------------------------------------------      SIDEBAR      -->

    <b-sidebar id="sidebar-right" title="Sidebar"
               bg-variant="dark" text-variant="light" right visible no-header shadow
               sidebar-class="under-navbar">
      <!----------------------------------      GRID CONTROL      ---------------------------------->
      <grid-edit class="px-3 py-2" v-show="tool === 'grid'" v-bind:world="world"/>
      <!----------------------------------      ENTITY INSPECTOR      ---------------------------------->
      <div v-show="tool === 'inspect'">
        <entity-inspect
            v-bind:components="this.selectedComponents"
            v-bind:entity="this.selectedEntityOpts"
            v-bind:isAdmin="isAdmin"
            v-bind:selectedAddable="selectedAddable"
            @ecs-property-change="onEcsPropertyChange"/>
      </div>
      <!----------------------------------      LIGHT SETTINGS      ---------------------------------->
      <div class="px-3 py-2" v-show="tool === 'light'">
        <div class="d-flex flex-row align-items-center">
          <div class="">Light:</div>
          <b-input type="color" v-model="light.ambientLight" :readonly="!isAdmin"
                   @change="onAmbientLightChange"></b-input>
        </div>
        <div class="d-flex flex-row align-items-center">
          <div class="">Needs light:</div>
          <b-form-checkbox v-model="light.needsLight" @input="onAmbientLightChange"
                           :readonly="!isAdmin"></b-form-checkbox>
        </div>
        <div class="d-flex flex-row align-items-center">
          <div class="">Vision type:</div>
          <b-button :pressed.sync="light.roleplayVision" :readonly="!isAdmin">
            {{ light.roleplayVision ? "Roleplayer" : "Master" }}
          </b-button>
        </div>
        <div class="d-flex flex-row align-items-center">
          <div class="">Background:</div>
          <b-input type="color" v-model="light.background" :readonly="!isAdmin"
                   @change="onAmbientLightChange"></b-input>
        </div>
        <div>
          <b-button @click="onLightSettingsReset">Reset</b-button>
        </div>
      </div>

      <template v-slot:footer>
        <div class="sidebar-footer">
          {{ connectionCount }}
          <div v-bind:class="{ rotate: connectionBuffering }" style="margin-left: 0.2rem">
            <i class="fas fa-sync-alt"></i>
          </div>
        </div>
      </template>
    </b-sidebar>

    <a id="hidden-download-link" style="display: none;"/>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import EntityInspect from "../ecs/entityInspect.vue";
import {Component} from "../../ecs/component";
import {Resource} from "../../ecs/resource";
import {AddComponent} from "../../ecs/systems/selectionSystem";
import {DEFAULT_LIGHT_SETTINGS, LightSettings, LocalLightSettings} from "../../ecs/systems/lightSystem";
import {SelectionSystem} from "../../ecs/systems/selectionSystem";
import PIXI from "../../PIXI";
import hex2string = PIXI.utils.hex2string;
import string2hex = PIXI.utils.string2hex;
import {Tool} from "../../ecs/tools/toolType";
import {ToolResource} from "../../ecs/systems/toolSystem";
import GridEdit from "./gridEdit.vue";

export default Vue.extend({
  components: {GridEdit, EntityInspect},
  props: ['phase', 'world', 'isAdmin'],
  data() {
    return {
      tool: 'inspect',
      connectionCount: 0,
      connectionBuffering: false,
      light: {
        ambientLight: '#000000',
        needsLight: true,
        roleplayVision: false,
        background: '#000000'
      },
      selectedComponents: new Array<Component>(),
      selectedEntityOpts: {},
      selectedAddable: new Array<AddComponent>(),
      canUndo: false,
      canRedo: false,
    };
  },
  methods: {
    changeTool(tool: Tool) {
      this.phase.world.editResource('tool', {tool});
    },

    onEcsPropertyChange(type: string, property: string, value: any, multiId: number) {
      let selectionSys = this.phase.world.systems.get('selection') as SelectionSystem;
      selectionSys.setProperty(type, property, value, multiId);
    },

    onAmbientLightChange() {
      this.phase.world.addResource({
        type: 'light_settings',
        ambientLight: string2hex(this.light.ambientLight),
        needsLight: this.light.needsLight,
        background: string2hex(this.light.background),
      } as LightSettings, 'update');
    },
    onLightSettingsReset() {
      this.phase.world.addResource(Object.assign({
        type: 'light_settings',
      }, DEFAULT_LIGHT_SETTINGS) as LightSettings, 'update');
      this.reloadLight();
    },
    reloadLight() {
      let light = this.phase.world.getResource('light_settings') as LightSettings;
      this.light.ambientLight = hex2string(light.ambientLight);
      this.light.needsLight = light.needsLight;
      this.light.background = hex2string(light.background);
      let llight = this.phase.world.getResource('local_light_settings') as LocalLightSettings;
      this.light.roleplayVision = llight.visionType === 'rp';
    },
    onResourceEdited(res: Resource) {
      if (res.type === 'light_settings' || res.type === 'local_light_settings') this.reloadLight();
      else if (res.type === 'tool') this.tool = (res as ToolResource).tool!;
    },
    undo() {
      this.phase.world.events.emit('command_undo');
    },
    redo() {
      this.phase.world.events.emit('command_redo');
    }
  },
  watch: {
    'light.roleplayVision': function () {
      let visionType = this.light.roleplayVision ? 'rp' : 'dm';

      this.phase.world.editResource('local_light_settings', {visionType});
    }
  },
  mounted() {
    //this.world = this.phase.world;
    this.reloadLight();

    this.phase.world.events.on('resource_edited', this.onResourceEdited);
  },
  /*unmounted() {// TODO: vue3
    this.phase.world.events.off('resource_edited', this.onResourceEdited);
  },*/
});
</script>

<style scoped>
.game {
  user-select: none;
}

.toolbar-btn {
  color: #fff;
  background-color: #2C3E50;
  border-color: #2C3E50;
}

.sidebar-footer {
  display: flex;
  align-items: center;
  justify-content: right;
}

.undo-redo-btn.disabled, .undo-redo-btn:disabled {
  background-color: #343a40;
  border-color: #343a40;
  box-shadow: none;
}
</style>
