<template>
  <div class="" @dragenter="onDragEnter" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
    <label for="map-input-form" class="form-label">
      <span style="pointer-events: none;">{{labelContent}}</span>
    </label>
    <input type="file" accept=".dndm" class="form-control form-control-lg" id="map-input-form"
           @change="onChange($event as InputEvent)">
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  props: {
    modelValue: { default: undefined, type: Object as PropType<File | undefined> },
  },
  data() {
    return {
      dragging: false,
    };
  },
  methods: {
    onChange(event: InputEvent | DragEvent) {
      const { dataTransfer } = event;

      // Always emit original event
      this.$emit('change', event);

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
      this.$emit('update:modelValue', file);
    },
    onDragEnter(event: DragEvent) {
      this.dragging = true;
      event.dataTransfer!.dropEffect = 'copy';
    },
    onDragOver(event: DragEvent) {
      this.dragging = true;
      event.dataTransfer!.dropEffect = 'copy';
    },
    onDragLeave() {
      this.$nextTick(() => {
        this.dragging = false;
      });
    },
    onDrop(event: DragEvent) {
      this.dragging = false;
      this.onChange(event);
    },
  },
  computed: {
    labelContent() {
      return this.dragging ? "Drop it here" : "Choose a file and drop it here";
    }
  }
});
</script>

<style>
</style>
