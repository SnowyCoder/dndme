<template>
  <div class="collapse" :class="class" ref="element" :aria-expanded="modelValue">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Collapse } from 'bootstrap';
import { defineComponent, onMounted, onUnmounted, ref, shallowRef, toRefs, watch } from 'vue';

export default defineComponent({
  props: {
    modelValue: { required: true, type: Boolean },
    class: { default: '', type: [Object, String] },
  },
  setup(props, context) {
    const { modelValue } = toRefs(props);
    const element = ref<HTMLDivElement>();

    const collapse = shallowRef<Collapse>();

    const onShowHide = (val: boolean) =>{
      if (modelValue.value == val) return;
      context.emit('update:modelValue', val);
    }

    onMounted(() => {
      const htmlElement = element.value!;
      if (modelValue.value) {
        htmlElement.classList.add('show');
      }
      collapse.value = new Collapse(htmlElement, {
          toggle: false,
      });

      htmlElement.addEventListener('show.bs.collapse', () => onShowHide(true));
      htmlElement.addEventListener('hide.bs.collapse', () => onShowHide(false));
    });

    watch(modelValue, val => {
      if (val) {
        collapse.value?.show();
      } else {
        collapse.value?.hide();
      }
    });

    /*onUnmounted(() => {
        collapse.value?.dispose();
    });*/

    return {
      element,
    }
  },
});
</script>

<style>
</style>
