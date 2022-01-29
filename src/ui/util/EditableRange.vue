<template>
  <div class="d-flex align-items-center w-100">
    <input class="util_editable-range_slider" type="range"
           :value="modelValue" :disabled="readonly" :min="min" :max="max" :step="step"
           @input="onEvent('input', $event as InputEvent)" @change="onEvent('change', $event as InputEvent)" />

    <editable-number :modelValue="modelValue" :modelModifiers="modelModifiers" :readonly="readonly" :digits="maxDigits"
                     @update:modelValue="$emit('update:modelValue', $event)" style="width: auto;" />

  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EditableNumber from "./EditableNumber.vue";


export default defineComponent({
  components: { EditableNumber },
  props: {
    modelValue: { type: Number, required: true },
    modelModifiers: { type: Object, default: () => {} },
    readonly: { type: Boolean, default: false },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    step: { type: Number, default: 1 },
  },
  methods: {
    onEvent(ev: string, event: InputEvent) {
      const et = event.target as any;
      if (ev === 'input' == !!this.modelModifiers?.lazy) {
        return;
      }
      this.$emit('update:modelValue', parseFloat(et.value));
    }
  },
  computed: {
    maxDigits() {
      return Math.max(String(this.max).length, String(this.max - this.step).length) - 1
    }
  }
});

</script>

<style>

.util_editable-range_slider {
  min-width: 1px;
  flex-grow: 1;
  width: 1px;
}

</style>
