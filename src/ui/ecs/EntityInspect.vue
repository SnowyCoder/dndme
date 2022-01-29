<template>
  <div v-show="data.components.length > 0">
    <div class="entity-inspect_component-btn-header">
      <div class="dropdown">
        <button class="btn btn-success rounded-0" type="button" :id="dropdownId" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="fas fa-plus"></i>
        </button>
        <ul class="dropdown-menu" :aria-labelledby="dropdownId">
          <li v-for="x in data.addable" :key="x.type" class="dropdown-item" @click="emitSpecial('addComponent', x.type)">
            {{ x.name }}
          </li>
        </ul>
      </div>
      <button class="btn btn-secondary rounded-0" :title="data.hidden ? 'Show entity' : 'Hide entity'" style="display: grid" v-if="world.isMaster"
              @click="emitSpecial('hidden', !data.hidden)">
        <div class="g11" :style="{visibility: data.hidden ? 'visible' : 'hidden'}"><i class="fas fa-eye-slash"/></div>
        <div class="g11" :style="{visibility: data.hidden ? 'hidden' : 'visible'}"><i class="fas fa-eye"/></div>
      </button>
      <button class="btn btn-danger rounded-0" v-if="world.isMaster" title="Delete entity"
              @click="emitSpecial('delete')">
        <i class="fas fa-trash"></i>
      </button>
      <button class="btn btn-danger rounded-0" v-if="world.isMaster"  title="Forget entity"
              @click="emitSpecial('forget')">
        <i class="fas fa-eraser"></i>
      </button>
    </div>

    <ecs-component-wrapper v-for="comp of data.components" v-bind:key="comp.type + ((comp as any).multiId || '')"
                           v-bind:component="comp"
                           @ecs-property-change="onEcsPropertyChange"/>
  </div>
</template>

<script lang="ts">
import EcsComponentWrapper from "./CompWrapper.vue";
import { World } from "../../ecs/world";

import {
  SELECTION_UI_TYPE,
  SelectionUiData,
  SelectionUiSystem,
} from "../../ecs/systems/back/selectionUiSystem";

import { defineComponent, inject, ShallowRef, shallowRef } from "vue";
import { uniqueId, useResource } from "../vue";

export default defineComponent({
  components: { EcsComponentWrapper },
  setup() {
    const world = inject('world') as ShallowRef<World>;

    const dropdownId = uniqueId('dropdown');

    const data = useResource<SelectionUiData>(world.value, SELECTION_UI_TYPE);

    const onEcsPropertyChange = (type: string, property: string, value: any, multiId?: number) => {
      let selSys = world.value.systems.get(SELECTION_UI_TYPE) as SelectionUiSystem;
      selSys.setProperty(data.value.selectedEntities, type, property, value, multiId);
    }

    const emitSpecial = (name: string, par?: unknown) => {
      onEcsPropertyChange('$', name, par);
    }

    return {
      world,
      dropdownId,
      data,
      onEcsPropertyChange,
      emitSpecial,
      shallowRef,
    }
  },
});
</script>

<style>
.entity-inspect_component-btn-header {
  margin: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: right;
}
</style>
