<template>
  <div v-show="data.components.length > 0">
    <div class="entity-inspect_component-btn-header">
      <b-dropdown toggle-class="rounded-0" variant="success" v-if="world.isMaster">
        <template v-slot:button-content>
          <i class="fas fa-plus"></i>
        </template>
        <b-dropdown-item v-for="x in data.addable" :key="x.type" @click="emitSpecial('addComponent', x.type)">
          {{ x.name }}
        </b-dropdown-item>
      </b-dropdown>
      <b-button squared :title="data.hidden ? 'Show entity' : 'Hide entity'" style="display: grid" v-if="world.isMaster"
                @click="emitSpecial('hidden', !data.hidden)">
        <div class="g11" :style="{visibility: data.hidden ? 'visible' : 'hidden'}"><i class="fas fa-eye-slash"/></div>
        <div class="g11" :style="{visibility: data.hidden ? 'hidden' : 'visible'}"><i class="fas fa-eye"/></div>
      </b-button>
      <b-button v-if="world.isMaster" variant="danger" title="Delete entity" squared
                @click="emitSpecial('delete')">
        <i class="fas fa-trash"></i>
      </b-button>
    </div>

    <ecs-component-wrapper v-for="comp of data.components" v-bind:key="comp.type + (comp.multiId || '')"
                           v-bind:component="comp" v-bind:isAdmin="world.isMaster"
                           @ecs-property-change="onEcsPropertyChange(arguments[0], arguments[1], arguments[2], arguments[3])"/>
  </div>
</template>

<script lang="ts">
import EcsComponentWrapper from "./compWrapper.vue";
import {VComponent, VProp, Vue} from "../vue";
import {Component} from "../../ecs/component";
import {World} from "../../ecs/world";
import {
  SELECTION_TYPE,
  SELECTION_UI_DATA_TYPE,
  SelectionSystem,
  SelectionUiData
} from "../../ecs/systems/back/selectionSystem";
import {Resource} from "../../ecs/resource";
import {componentClone} from "../../ecs/ecsUtil";

@VComponent({
  components: {
    EcsComponentWrapper,
  }
})
export default class EntityInspect extends Vue {
  @VProp({required: true})
  world!: World;

  data: SelectionUiData = {
    type: SELECTION_UI_DATA_TYPE,
    selectedEntities: [],
    hidden: false,
    addable: [],
    components: [],
    _save: false,
    _sync: false,
  };

  onEcsPropertyChange(type: string, property: string, value: any, multiId?: number) {
    let selectionSys = this.world.systems.get(SELECTION_TYPE) as SelectionSystem;
    selectionSys.setProperty(this.data.selectedEntities, type, property, value, multiId);
  }

  emitSpecial(name: string, par: unknown) {
    this.onEcsPropertyChange('$', name, par);
  }

  onResourceEdited(res: Resource) {
    if (res.type === SELECTION_UI_DATA_TYPE) {
      this.data = componentClone(res) as SelectionUiData;
    }
  }

  mounted() {
    this.data = componentClone(this.world.getResource(SELECTION_UI_DATA_TYPE) as SelectionUiData);
    this.world.events.on('resource_edited', this.onResourceEdited, this);
  }

  unmounted() {
    this.world.events.off('resource_edited', this.onResourceEdited, this);
  }
}
</script>

<style>
.entity-inspect_component-btn-header {
  margin: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: right;
}
</style>