<template>
  <div class="" @dragenter="onDragEnter" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
    <label for="map-input-form" class="form-label">
      <span style="pointer-events: none;">{{labelContent}}</span>
    </label>
    <input ref="input" type="file" accept=".dndm" class="form-control form-control-lg" id="map-input-form"
           @change="onChange($event as InputEvent)">
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, PropType, ref, shallowRef, toRef, watch } from 'vue';

export default defineComponent({
  props: {
    modelValue: { default: undefined, type: Object as PropType<File | undefined> },
  },
  setup(props, context) {
    const dragging = shallowRef(true);

    const modelValue = toRef(props, 'modelValue');

    const onChange = (event: InputEvent | DragEvent) => {
      const { dataTransfer } = event;

      // Always emit original event
      context.emit('change', event);

      let file;
      if (!dataTransfer) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
          file = input.files[0];
        } else {
          return;
        }
      } else if (dataTransfer.items) {
        file = dataTransfer.items[0].getAsFile();
      } else {
        file = dataTransfer.files[0];
      }
      context.emit('update:modelValue', file);
    };
    const onDragEnter = (event: DragEvent) => {
      dragging.value = true;
      event.dataTransfer!.dropEffect = 'copy';
    };
    const onDragOver = (event: DragEvent) => {
      dragging.value = true;
      event.dataTransfer!.dropEffect = 'copy';
    };
    const onDragLeave = () => {
      nextTick(() => {
        dragging.value = false;
      });
    };
    const onDrop = (event: DragEvent) => {
      dragging.value = false;
      onChange(event);
    };

    const input = ref<HTMLInputElement | null>(null);
    onMounted(() => {
      input.value!.value = "";
    })

    const labelContent = computed(() => dragging.value ? "Drop it here" : "Choose a file and drop it here");
    return {
      onDragEnter, onDragOver, onDragLeave, onDrop, onChange, labelContent, input
    }
  },
});
</script>

<style>
</style>
