<template>
  <div>
    <div style="display: flex; align-items: center;">
      Night vision:
      <b-form-checkbox v-if="isAdmin" v-model="nightVision" @input="onChange"></b-form-checkbox>
      <span v-else style="margin-left: 0.5rem;">{{ nightVision ? "yes" : "no" }}</span>
    </div>
    <div style="display: flex; align-items: center;">
      Visibility Range:
      <editable-number :readonly="!isAdmin" isNegative="false" v-model="range" @change="onChange"/>
    </div>
  </div>
</template>

<script lang="ts">

import {VComponent, VWatchImmediate, VProp, Vue} from "../vue";
import {PlayerComponent} from "../../ecs/systems/playerSystem";
import EditableNumber from "../util/editableNumber.vue";

@VComponent({
  components: {
    EditableNumber
  }
})
export default class EcsPlayer extends Vue {
  @VProp({required: true})
  component!: PlayerComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  nightVision: boolean = false;
  range: string = '';

  onChange() {
    if (this.component.nightVision !== this.nightVision) {
      this.$emit('ecs-property-change', 'player', 'nightVision', this.nightVision);
    }
    let c = parseFloat(this.range);
    if (this.component.range !== c && this.range !== '') {
      this.$emit('ecs-property-change', 'player', 'range', c);
    }
  }

  @VWatchImmediate('component.nightVision')
  onCNightVisionChanged(val: boolean) {
    this.nightVision = val;
  }

  @VWatchImmediate('component.range')
  onCRangeChanged(val: number) {
    this.range = val + '';
  }
}
</script>

<style>

</style>