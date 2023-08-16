<script setup lang="ts">
import { computed, defineComponent, toRefs } from 'vue';

export interface Props {
  pressed?: boolean,
  class: object | string,
  readonly: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
  readonly: false
});

const emits = defineEmits<{
  (event: 'update:pressed', value: boolean): void
  (event: 'click'): void
}>();

const { pressed } = toRefs(props);
const classProp = toRefs(props).class;

const activeClass = computed(() => {
  return {
    active: !!pressed?.value
  }
});

const onClick = () => {
  if (pressed?.value !== null) {
    emits('update:pressed', !pressed?.value);
  }

  emits('click');
};
</script>

<template>
  <button class="btn" :class="[activeClass, classProp]" :aria-pressed="pressed"
          :disabled="readonly" @click="onClick">
    <slot></slot>
  </button>
</template>
