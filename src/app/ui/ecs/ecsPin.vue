<template>
  <div>
    <b-input type="color" v-model="color" @change="onChange" :readonly="!isAdmin"></b-input>
    <b-input v-model="label" :readonly="!isAdmin" placeholder="Label" @change="onChange"/>
  </div>
</template>

<script lang="ts">
import PIXI from "../../PIXI";

import {VComponent, VProp, Vue, VWatch} from "../vue";
import {PinComponent} from "../../ecs/systems/pinSystem";
import hex2string = PIXI.utils.hex2string;
import string2hex = PIXI.utils.string2hex;

@VComponent
export default class EcsPin extends Vue {
  @VProp({required: true})
  component!: PinComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  color: string;
  label: string;

  constructor() {
    super();
    this.color = hex2string(this.component.color);
    this.label = this.component.label ?? "";
  }

  onChange() {
    let c = string2hex(this.color);
    if (this.component.color !== c && this.color !== '') {
      this.$emit('ecs-property-change', 'pin', 'color', c);
    }
    let label: string | undefined = this.label;
    if (!label) label = undefined;
    if (label !== this.component.label) {
      this.$emit('ecs-property-change', 'pin', 'label', label);
    }
  }

  @VWatch('component.color')
  onCColorChanged(val: number) {
    this.color = hex2string(val);
  }

  @VWatch('component.label')
  onCLabelChanged(val: string | undefined) {
    this.label = val ?? "";
  }
}
</script>

<style scoped>

</style>