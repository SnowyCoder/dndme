<script setup lang="ts">
import { onUnmounted, ref, toRefs, watch, watchEffect } from 'vue';
import Modal from './Modal.vue';
import Cropper from 'cropperjs';
import { read } from 'fs';

export interface Props {
    blob: Blob | null,
    show: boolean,
    isRound?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  isRound: false,
});

const {show, blob} = toRefs(props);

const emit = defineEmits<{
    'crop': [Blob],
    'cancel': [],
}>();

const imgLoaded = ref(false);
let cropper: Cropper | undefined = undefined;

const img = ref<HTMLCanvasElement |  null>(null);
const isOpen = ref(false);
const isShown = ref(false);
const ready = ref(false);

watch(blob, b => {
  imgLoaded.value = false;
  cropper?.destroy();
  cropper = undefined;
  ready.value = false;
  isShown.value = false;

  if (b === null) return;

  createImageBitmap(b).then(x => {
    img.value!.width = x.width;
    img.value!.height = x.height;
    const ctx = img.value?.getContext('bitmaprenderer');
    ctx?.transferFromImageBitmap(x);

    imgLoaded.value = true;
  });
})

watchEffect(() => {
  if (isShown.value && imgLoaded.value && cropper == null) {
    const options: Cropper.Options = {
      responsive: true,
      ready: () => {
        ready.value = true
      },
    };
    if (props.isRound) {
      options.aspectRatio = 1;
    }
    cropper = new Cropper(img.value!, options);
  }
})

onUnmounted(() => {
  cropper?.destroy();
});

watch(show, x => {
  isOpen.value = x;
});

watch(isOpen, x => {
  if (!x && props.show) emit('cancel');
})

function getRoundedCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  canvas.width = width;
  canvas.height = height;
  context.imageSmoothingEnabled = true;
  context.drawImage(sourceCanvas, 0, 0, width, height);
  context.globalCompositeOperation = 'destination-in';
  context.beginPath();
  context.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI, true);
  context.fill();

  return canvas;
}

function onCrop(): void {
  let canvas = cropper!.getCroppedCanvas();

  if (props.isRound) {
    canvas = getRoundedCanvas(canvas);
  }

  canvas.toBlob(blob => {
    if (blob) {
        console.error('Cannot crop image');
        emit('crop', blob);
    }
  }, 'image/webp', 0.8);
}


</script>


<template>
  <Modal title="Crop image" v-model="isOpen" dialog-class="modal-xl" :scrollable="false" hide-footer hide-header @shown="isShown = true">
    <div class="imgcropper-canvas" :class="{
      'cropper-round': $props.isRound,
      'hidden': !ready,
    }">
      <canvas ref="img" alt="Image to crop"></canvas>
    </div>
    <div class="d-flex mt-3">
      <button type="button" class="btn btn-outline-danger me-auto" @click="isOpen = false">Cancel</button>
      <div class="btn-group" role="group" aria-label="Basic example">
        <button type="button" class="btn btn-outline-primary" @click="cropper?.rotate(45)"><i class="fas fa-undo-alt" /></button>
        <button type="button" class="btn btn-outline-primary" @click="cropper?.scaleX(-1)"><i class="fas fa-arrows-alt-h" /></button>
        <button type="button" class="btn btn-outline-primary" @click="cropper?.scaleY(-1)"><i class="fas fa-arrows-alt-v" /></button>
      </div>
      <button type="button" class="btn btn-outline-primary ms-auto" @click="onCrop">Crop</button>
    </div>
  </Modal>
</template>

<style lang="scss">

.cropper-round {
  .cropper-view-box, .cropper-face {
    border-radius: 50%;
  }
}


.imgcropper-canvas {
  align-items: center;
  display: flex;
  height: 70vh;
  width: 100%;
  justify-content: center;

  & > canvas, img {
    display: block;
    max-height: 100%;
    max-width: 100%;
  }
}

</style>