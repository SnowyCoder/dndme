<template>
  <div>
    <div>
      Color:
      <editable-color :readonly="!isAdmin" v-model="color" @change="onChange"></editable-color>
    </div>
    <div style="display: flex; align-items: center;">
      Visibility Range:
      <editable-number :readonly="!isAdmin" v-model="range" @change="onChange" isNegative="false"></editable-number>
    </div>
  </div>
</template>

<script lang="ts">
import PIXI from "../../PIXI";
import {VComponent, VWatchImmediate, VProp, Vue} from "../vue";
import {LightComponent} from "../../ecs/systems/lightSystem";
import hex2string = PIXI.utils.hex2string;
import string2hex = PIXI.utils.string2hex;
import EditableColor from "../util/editableColor.vue";
import EditableNumber from "../util/editableNumber.vue";

@VComponent({
  components: {
    EditableColor, EditableNumber,
  }
})
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
    let r = parseFloat(this.range);
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

<style>

</style>