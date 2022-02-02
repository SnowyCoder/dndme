<template>
  <div>
    <div>
      <div class="cwrapper_component-header">
        <div @click="visible = !visible"> {{ name }}</div>
        <div class="cwrapper_component-arrow" :class="{cwrapper_rotate: visible}" ></div>
        <div style="width: 100%"></div>
        <button v-if="isMaster && component.clientVisible !== undefined" type="button" class="btn btn-secondary btn-sm rounded-0" style="display: grid;"
                  :title="component.clientVisible ? 'Hide component' : 'Show component'"
                  @click="$emit('ecs-property-change', component.type, 'clientVisible', !component.clientVisible, component.multiId)">
          <div class="g11" v-show="component.clientVisible"><i class="fas fa-eye"/></div>
          <div class="g11" v-show="!component.clientVisible"><i class="fas fa-eye-slash"/></div>
        </button>
        <button v-if="isMaster" class="btn btn-primary btn-sm rounded-0" title="Fullscreen"
                  v-show="isFullscreen !== undefined"
                  @click="isFullscreen = true">
          <i class="fas fa-expand"/>
        </button>
        <button v-if="isMaster" class="btn btn-danger btn-sm rounded-0" title="Delete" v-show="canDelete"
                  @click="$emit('ecs-property-change', '$', 'removeComponent', component.type, component.multiId)">
          <i class="fas fa-trash"/>
        </button>
      </div>
    </div>
    <Collapse v-model="visible" class="cwrapper_component-body">
      <component :is="panel" :component="component"
                 v-on:ecs-property-change="onEcsPropertyChange">
      </component>
    </Collapse>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, PropType, provide, ShallowRef, shallowRef, toRefs, watch } from "vue";
import { Component, HideableComponent, MultiComponent } from "../../ecs/component";
import { COMPONENT_INFO_PANEL_TYPE } from "../../ecs/systems/back/selectionUiSystem";
import { World } from "../../ecs/world";
import Collapse from "../util/Collapse.vue";

//TODO: make this dynamic
export default defineComponent({
  components: { Collapse },
  props: {
    component: { type: Object as PropType<Component & Partial<HideableComponent & MultiComponent>>, required: true },
  },
  setup(props, context) {
    const { component } = toRefs(props);
    const world = inject<ShallowRef<World>>("world")!.value;
    const isMaster = inject<boolean>("isMaster");

    const isFullscreen = shallowRef<boolean | undefined>(undefined);
    provide('isFullscreen', isFullscreen);

    const onEcsPropertyChange = (...args: any[]) => {
      context.emit("ecs-property-change", ...args);
    };

    const visible = shallowRef((component.value as any)._open ?? true);
    watch(visible, (newVisible) => {
      if (component.value.multiId !== undefined) return;

        world.editComponent((component.value as any)._infoPanelId, COMPONENT_INFO_PANEL_TYPE, {
          isOpen: newVisible,
        });
    });

    const c = component.value as any;
    const name = c._name;
    const panel = c._panel;
    const canDelete = c._canDelete;

    return {
      isMaster, name, panel, canDelete, isFullscreen,
      onEcsPropertyChange, visible,
    };
  },
});
</script>

<style>
.cwrapper_component-header {
  display: flex;
  align-items: center;
  margin-left: 5px;
  margin-bottom: 2px;
}

.cwrapper_component-arrow {
  width: 0;
  height: 0;
  border-top: 0.3em solid transparent;
  border-bottom: 0.3em solid transparent;
  border-right: 0.3em solid #eeeeee;
  margin-left: 0.3em;
  margin-top: 0.175em;
  transition: 0.3s;
}

.cwrapper_component-header button:last-child {
  margin-right: 10px;
}

.cwrapper_component-body {
  margin-left: 6px;
  border-left: 4px solid #545b62;
  padding-left: 6px;
  border-radius: 0 0 0 4px;
  margin-right: 12px;
}

.cwrapper_rotate {
  transform: rotate(-90deg);
  transition: 0.3s ease;
}
</style>
