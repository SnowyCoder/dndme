<template>
  <div>
    <div>
      Color:
      <b-input type="color" v-model="color" @change="onChange" :readonly="!isAdmin"></b-input>
    </div>
    <div style="display: flex; align-items: center;">
      Visibility Range: <span v-if="!isAdmin" style="margin-left: 0.5rem;">{{ range }}</span>
      <b-input v-if="isAdmin" type="number" step="1" min="0" v-model="range" size="sm" @change="onChange"></b-input>
    </div>
  </div>
</template>

<script lang="ts">
import PIXI from "../../PIXI";
import hex2string = PIXI.utils.hex2string;
import string2hex = PIXI.utils.string2hex;
import {Vue, VComponent, VProp, VWatch} from "../vue";
import {LightComponent} from "../../ecs/systems/lightSystem";

@VComponent
export default class EcsLight extends Vue {
  @VProp({required: true})
  component!: LightComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  color: string;
  range: string;

  constructor() {
    super();
    this.color = hex2string(this.component.color)
    this.range = this.component.range + '';
  }

  onChange() {
    let c = string2hex(this.color);
    if (this.component.color !== c && this.color !== '') {
      this.$emit('ecs-property-change', 'light', 'color', c);
    }
    let r = parseInt(this.range);
    if (this.component.range !== r && this.range !== '') {
      this.$emit('ecs-property-change', 'light', 'range', r);
    }
  }

  @VWatch('component.color')
  onCColorChanged(val: number) {
    this.color = hex2string(val);
  }

  @VWatch('component.range')
  onCRangeChanged(val: number) {
    this.range = val + '';
  }
}
</script>

<style scoped>

</style>