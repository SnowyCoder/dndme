<template>
  <div>
    <template v-if="isAdmin">
      <div class="d-flex align-items-center">
        Color:
        <editable-color :readonly="!isAdmin" v-model="color" @change="onChange"/>
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

@VComponent({
  components: {
    EditableText, EditableColor
  }
})
export default class EcsPin extends Vue {
  @VProp({required: true})
  component!: PinComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  color: string = '';

  onChange() {
    let c = string2hex(this.color);
    if (this.component.color !== c && this.color !== '') {
      this.$emit('ecs-property-change', 'pin', 'color', c);
    }
  }

  @VWatchImmediate('component.color')
  onCColorChanged(val: number | undefined) {
    this.color = val === undefined ? "" : hex2string(val);
  }
}
</script>

<style>

</style>