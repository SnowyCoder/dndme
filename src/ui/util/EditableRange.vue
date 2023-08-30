<template>
  <div class="d-flex align-items-center w-100">
    <input class="util_editable-range_slider" type="range"
           :value="modelValue" :disabled="readonly" :min="min" :max="max" :step="step"
           @input="onEvent('input', $event as InputEvent)" @change="onEvent('change', $event as InputEvent)" />

    <editable-number :modelValue="modelValue" :modelModifiers="modelModifiers" :readonly="readonly" :digits="maxDigits"
                     @update:modelValue="$emit('update:modelValue', $event)" style="width: auto;" />

  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import EditableNumber from "./EditableNumber.vue";


export interface Props {
  modelValue: number,
  modelModifiers?: {
    lazy?: boolean,
  },
  readonly?: boolean,
  min: number,
  max: number,
  step?: number,
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  step: 1,
  modelModifiers: () => ({})
});

const emit = defineEmits<{
  'update:modelValue': [value: number],
}>();

function onEvent(ev: string, event: InputEvent) {
  const et = event.target as any;
  if (ev === 'input' == !!props.modelModifiers.lazy) {
    return;
  }
  emit('update:modelValue', parseFloat(et.value));
}

const maxDigits = computed(() => {
  return Math.max(String(props.max).length, String(props.max - props.step).length) - 1
});

</script>

<style>

.util_editable-range_slider {
  min-width: 1px;
  flex-grow: 1;
  width: 1px;
}

</style>
