<template>
  <div>
    <div>
      <div class="cwrapper_component-header">
        <div @click="visible = !visible"> {{ component.typeName }}</div>
        <div class="cwrapper_component-arrow" :class="{cwrapper_rotate: visible}" ></div>
        <div style="width: 100%"></div>
        <b-button v-if="isAdmin" squared size="sm" style="display: grid;"
                  :title="component.clientVisible ? 'Hide component' : 'Show component'"
                  v-show="component.clientVisible !== undefined"
                  @click="$emit('ecs-property-change', component.type, 'clientVisible', !component.clientVisible)">
          <div class="g11" v-show="component.clientVisible"><i class="fas fa-eye"/></div>
          <div class="g11" v-show="!component.clientVisible"><i class="fas fa-eye-slash"/></div>
        </b-button>
        <b-button v-if="isAdmin" squared size="sm" variant="primary" title="Fullscreen"
                  v-show="component._isFullscreen !== undefined" @click="component._isFullscreen = true">
          <i class="fas fa-expand"/>
        </b-button>
        <b-button v-if="isAdmin" squared size="sm" variant="danger" title="Delete" v-show="component._canDelete"
                  @click="$emit('ecs-property-change', '$', 'removeComponent', component.type, component.multiId)">
          <i class="fas fa-trash"/>
        </b-button>
      </div>
    </div>
    <b-collapse v-model="visible" class="cwrapper_component-body" visible>
      <component v-bind:is="componentType" v-bind:component="component" v-bind:isAdmin="isAdmin"
                 v-on:ecs-property-change="$emit('ecs-property-change', arguments[0], arguments[1], arguments[2], arguments[3])">

      </component>
    </b-collapse>
  </div>
</template>

<script lang="ts">
import ecsName from "./ecsName.vue";
import ecsNote from "./ecsNote.vue";
import ecsPosition from "./ecsPosition.vue";
import ecsWall from "./ecsWall.vue";
import ecsBackgroundImage from "./ecsBackgroundImage.vue";
import ecsPin from "./ecsPin.vue";
import ecsTransform from "./ecsTransform.vue";
import ecsLight from "./ecsLight.vue";
import ecsPlayer from "./ecsPlayer.vue";
import ecsDoor from "./ecsDoor.vue";
import ecsProp from "./ecsProp.vue";
import ecsPropTeleport from "./ecsPropTeleport.vue";
import {Component} from "../../ecs/component"
import {Vue, VComponent, VProp} from "../vue";

@VComponent({
  components: {
    ecsName, ecsNote, ecsPosition, ecsWall, ecsBackgroundImage, ecsPin, ecsTransform, ecsLight, ecsPlayer, ecsDoor,
    ecsProp, ecsPropTeleport
  }
})
export default class EcsComponentWrapper extends Vue {
  @VProp({required: true})
  component!: Component;

  @VProp({default: false})
  isAdmin!: boolean;

  visible = true;

  get componentType(): string {
    return 'ecs-' + this.component.type.replace('_', '-');
  }
}
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