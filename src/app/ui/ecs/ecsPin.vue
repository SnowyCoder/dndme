<template>
  <div>
    <template v-if="isAdmin">
      <div class="d-flex align-items-center">
        Color:
        <editable-color :readonly="!isAdmin" v-model="color" @change="onChange"/>
      </div>
      <div class="d-flex align-items-center">
        Size:
        <input type="checkbox" title="Specify" v-model="sizeSpecify" :readonly="!isAdmin" @change="onChange"/>
        <editable-range :readonly="!isAdmin || !sizeSpecify" v-model="size"
                        min="0.5" max=10 step="0.1" @input="onChange"/>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import PIXI from "../../PIXI";

import {VComponent, VWatchImmediate, VProp, Vue} from "../vue";
import {PinComponent} from "../../ecs/systems/pinSystem";
import hex2string = PIXI.utils.hex2string;
import string2hex = PIXI.utils.string2hex;

import EditableText from "../util/editableText.vue";
import EditableColor from "../util/editableColor.vue";
import EditableRange from "../util/editableRange.vue";

@VComponent({
  components: {
    EditableText, EditableColor, EditableRange
  }
})
export default class EcsPin extends Vue {
  @VProp({required: true})
  component!: PinComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  color: string = '';

  sizeSpecify: boolean = false;
  size: number = 1;

  onChange() {
    let c = string2hex(this.color);
    if (this.component.color !== c && this.color !== '') {
      this.$emit('ecs-property-change', 'pin', 'color', c);
    }
    let size = this.sizeSpecify ? this.size : undefined;
    if (this.component.size !== size) {
      this.$emit('ecs-property-change', 'pin', 'size', size);
    }
  }

  @VWatchImmediate('component.color')
  onCColorChanged(val: number | undefined) {
    this.color = val === undefined ? "" : hex2string(val);
  }

  @VWatchImmediate('component.size')
  onCSizeChanged(val: number | undefined) {
    this.sizeSpecify = val !== undefined && val !== 0;
    // val cannot be undefined
    this.size = this.sizeSpecify ? val as number : 1;
  }
}
</script>

<style>

</style>
