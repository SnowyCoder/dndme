<template>
  <div class="d-flex align-items-center w-fit-content">
    <input class="util_editable-range_slider" type="range"
           v-bind:value="value" :disabled="readonly" :min="min" :max="max" :step="step"
           @input="onEvent('input', $event)" @change="onEvent('change', $event)" />

    <editable-number v-bind:value="value" :readonly="readonly" :digits="String(max).length"
                     @change="$emit('change', parseFloat($event))"
                     @input="$emit('input', $event)"/>

  </div>
</template>

<script lang="ts">

import {VComponent, VProp, Vue} from "../vue";
import EditableNumber from "./editableNumber.vue";

@VComponent({
  components: {
    EditableNumber
  }
})
export default class EditableRange extends Vue {
  @VProp({required: true})
  value!: number;

  @VProp({default: false})
  readonly!: boolean;

  @VProp({required: true})
  min!: number;

  @VProp({required: true})
  max!: number;

  @VProp({default: 1})
  step!: number;

  onEvent(ev: string, event: InputEvent) {
    const et = event.target as any;
    this.$emit(ev, et.value);
  }
}

</script>

<style>

.util_editable-range_slider {
  min-width: 1px;
  flex-grow: 1;
}

</style>
