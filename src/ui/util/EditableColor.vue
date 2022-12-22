<template>
  <input type="color" v-bind:value="value" @input="onEvent('input', $event)" @change="onEvent('change', $event)"
         :disabled="readonly" :placeholder="placeholder"
         class="util_ecolor">
</template>

<script lang="ts">
import { utils } from "pixi.js";
import { defineComponent } from "vue";
import string2hex = utils.string2hex;
import hex2string = utils.hex2string;

export default defineComponent({
  props: {
    modelValue: { type: Number, required: true },
    modelModifiers: { type: Object, default: () => {} },
    readonly: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  methods: {
    onEvent(name: string, event: Event) {
      if ((name === 'input') == !!this.modelModifiers?.lazy) {
        return;
      }
      this.$emit('update:modelValue', string2hex((event.target as HTMLInputElement).value));
    }
  },
  computed: {
    value() {
      return hex2string(this.modelValue);
    }
  }
});

</script>

<style>
.util_ecolor {
  background-color: transparent !important;
  outline: none !important;
  border: none !important;
  padding: 0.125rem !important;
  box-shadow: none !important;
  height: calc(1.5em + 0.75rem + 2px);
  width: calc(1.5em + 0.75rem + 2px);
  margin-left: 0.5em;

  -webkit-appearance: none;
}

.util_ecolor::-moz-color-swatch, .util_ecolor::-webkit-color-swatch, .util_ecolor::-webkit-color-swatch-wrapper {
  border: 0;
  padding: 0;
}
</style>
