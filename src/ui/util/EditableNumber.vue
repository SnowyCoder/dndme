<template>
  <editable-text :modelValue="String(modelValue)" :modelModifiers="modelModifiers"
                 :readonly="readonly" :placeholder="placeholder" :size="digits" :filter="filter"
                 @update:modelValue="onUpdate"/>
</template>

<script lang="ts">

import { defineComponent } from "vue";
import EditableText from "./EditableText.vue";

export default defineComponent({
  components: { EditableText },
  props: {
    modelValue: { type: Number, required: true },
    modelModifiers: { type: Object, default: () => {} },
    readonly: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    canBeNegative: { type: Boolean, default: true },
    digits: { type: Number },
  },
  emits: ['update:modelValue'],
  computed: {
    strValue() {
      if (this.modelValue == null || isNaN(this.modelValue)) return "";
      return String(this.modelValue);
    }
  },
  methods: {
    filter(s: string) {
      let neg = false;
      if (s[0] === '-') {
        neg = this.canBeNegative;
        s = s.substring(1);
      }
      const prefix = neg ? '-' : '';
      return prefix + s.split('.', 2)
          .map(x => x.replace(/[^0-9]*/g, ''))
          .join('.');
    },
    onUpdate(x: string) {
      const parsed = parseFloat(x);
      if (isNaN(parsed)) return;
      this.$emit('update:modelValue', parsed);
    },
  }
});

</script>

<style>
</style>
