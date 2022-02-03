<template>
  <editable-text :modelValue="strValue" :modelModifiers="modelModifiers"
                 :readonly="readonly" :placeholder="placeholder" :size="digits" :filter="filter"
                 @update:modelValue="onUpdate"/>
</template>

<script lang="ts">

import { defineComponent } from "vue";
import EditableText from "./EditableText.vue";

export default defineComponent({
  components: { EditableText },
  props: {
    modelValue: { type: Number },
    modelModifiers: { type: Object, default: () => {} },
    readonly: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    canBeNegative: { type: Boolean, default: true },
    nullable: { type: Boolean, default: false },
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
      s = s.trim();
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
      x = x.trim();
      if (x === '' && this.nullable) {
        this.$emit('update:modelValue', undefined);
        return;
      }
      const parsed = parseFloat(x);
      if (isNaN(parsed)) return;
      this.$emit('update:modelValue', parsed);
    },
  }
});
</script>
