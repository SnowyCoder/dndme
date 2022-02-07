<template>
  <div class="util_editable-text_div w-fit-content">
    <input type="text" :value="modelValue"
           @input="onEvent('input', $event as InputEvent)" @change="onEvent('change', $event as InputEvent)"
           :size="size" :readonly="readonly" :placeholder="placeholder"
           class="form-control-plaintext hprior util_editable-text_input">
    <span class="util_editable-text_border"></span>
  </div>
</template>

<script lang="ts">

import { defineComponent } from "vue";

export default defineComponent({
  props: {
    modelValue: { type: String, required: true },
    modelModifiers: { type: Object, default: () => {} },
    readonly: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    size: { type: Number },
    filter: { type: Function, default: undefined},// (text: string) => String
  },
  emits: ['update:modelValue'],
  methods: {
    onEvent(ev: string, event: InputEvent) {
      const et = event.target as HTMLInputElement;
      if ((ev === 'input') == !!this.modelModifiers?.lazy) {
        return;
      }
      if (this.filter !== undefined) {
        et.value = this.filter(et.value);
      }
      this.$emit('update:modelValue', et.value);
    }
  }
})

</script>

<style lang="scss">
@import "@/style/vars";

.util_editable-text_div {
  position: relative;
  margin: 5px;
  width: 100%;
}

.util_editable-text_border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;

  border: 1px solid transparent;
  transition: width 0.2s, border 0s 0.2s;
}

.util_editable-text_input {
  &:focus ~ .util_editable-text_border {
    border-color: #4285F4;
    width: 100%;
    transition: width 0.3s;
  }
  &::placeholder {
    color: $input-placeholder-color;
    opacity: 1;
  }
}

.hprior.util_editable-text_input {
  color: white;
  padding: 3px 5px;
  margin: 0;
  border-bottom: solid 1px #eeeeee;
  outline: none;
}
</style>
