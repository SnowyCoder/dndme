<template>
  <button class="btn" :class="[activeClass, classProp]" :aria-pressed="pressed"
          :readonly="readonly" @click="onClick">
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from 'vue';

export default defineComponent({
  props: {
    pressed: { default: null, type: Boolean },
    class: { default: '', type: [Object, String] },
    readonly: { default: false, type: Boolean },
  },
  setup(props, context) {
    const { pressed } = toRefs(props);
    const classProp = toRefs(props).class;

    const activeClass = computed(() => {
      return {
        active: !!pressed.value
      }
    });

    const onClick = () => {
      if (pressed.value !== null) {
        context.emit('update:pressed', !pressed.value);
      }

      context.emit('click');
    };

    return {
      activeClass, onClick, classProp
    }
  },
});
</script>

<style>
</style>
