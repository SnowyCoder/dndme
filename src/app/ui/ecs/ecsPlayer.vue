<template>
  <div>
    <div style="display: flex; align-items: center;">
      Night vision:
      <b-form-checkbox v-if="isAdmin" v-model="nightVision" @input="onChange"></b-form-checkbox>
      <span v-else style="margin-left: 0.5rem;">{{ nightVision ? "yes" : "no" }}</span>
    </div>
    <div style="display: flex; align-items: center;">
      Visibility Range: <span v-if="!isAdmin" style="margin-left: 0.5rem;">{{ range }}</span>
      <b-input v-if="isAdmin" type="number" step="1" min="0" v-model="range" size="sm" @change="onChange"></b-input>
    </div>
  </div>
</template>

<script lang="ts">

import {VComponent, VProp, Vue, VWatch} from "../vue";
import {PlayerComponent} from "../../ecs/systems/playerSystem";

@VComponent
export default class EcsPlayer extends Vue {
  @VProp({required: true})
  component!: PlayerComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  nightVision: boolean;
  range: string;

  constructor() {
    super();
    this.nightVision = this.component.nightVision;
    this.range = this.component.range + '';
  }

  onChange() {
    if (this.component.nightVision !== this.nightVision) {
      this.$emit('ecs-property-change', 'player', 'nightVision', this.nightVision);
    }
    let c = parseInt(this.range);
    if (this.component.range !== c && this.range !== '') {
      this.$emit('ecs-property-change', 'player', 'range', c);
    }
  }

  @VWatch('component.nightVision')
  onCNightVisionChanged(val: boolean) {
    this.nightVision = val;
  }

  @VWatch('component.range')
  onCRangeChanged(val: number) {
    this.range = val + '';
  }
}
</script>

<style scoped>

</style>