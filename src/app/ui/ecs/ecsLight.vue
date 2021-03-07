<template>
  <div>
    <div>
      Color:
      <b-input v-if="isAdmin" type="color" v-model="color" @change="onChange"></b-input>
      <span v-else>{{ color }}</span>
    </div>
    <div style="display: flex; align-items: center;">
      Visibility Range: <span v-if="!isAdmin" style="margin-left: 0.5rem;">{{ range }}</span>
      <b-input v-if="isAdmin" type="number" step="1" min="0" v-model="range" size="sm" @change="onChange"></b-input>
    </div>
  </div>
</template>

<script lang="ts">
import PIXI from "../../PIXI";
import {VComponent, VWatchImmediate, VProp, Vue} from "../vue";
import {LightComponent} from "../../ecs/systems/lightSystem";
import hex2string = PIXI.utils.hex2string;
import string2hex = PIXI.utils.string2hex;

@VComponent
export default class EcsLight extends Vue {
  @VProp({required: true})
  component!: LightComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  color: string = '';
  range: string = '';

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

  @VWatchImmediate('component.color')
  onCColorChanged(val: number | undefined) {
    this.color = val === undefined ? '' : hex2string(val);
  }

  @VWatchImmediate('component.range')
  onCRangeChanged(val: number | undefined) {
    this.range = (val ?? '') + '';
  }
}
</script>

<style scoped>

</style>