<template>
  <canvas v-if="!readonly" ref="previewCanvas" class="util_eimage master" width="128" height="128" style="width: 7rem"
        @click="onClick" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop"
        v-tooltip.right="'Upload image'"
        :class="{
          'util_eimage_drag': isDragging,
        }">
    Canvas error
  </canvas>
  <canvas v-else ref="previewCanvas" class="util_eimage" width="128" height="128" style="width: 7rem">
    Canvas error
  </canvas>
  <button class="btn btn-outline-danger ms-2" v-if="!readonly" @click="removeImage">Remove</button>


  <ImageCropper :show="imgBlob != null" :blob="imgBlob" is-round
      @crop="onCropped" @cancel="onCropCancel"></ImageCropper>
</template>

<script setup lang="ts">

import { ref, toRefs, watch, watchEffect } from 'vue';
import { useWorld, vTooltip } from '../vue';
import { FileIndex } from '@/map/FileDb';
import { ImageRenderer } from '@/ecs/systems/back/pixi/ImageRenderer';
import ImageCropper from './ImageCropper.vue';

export interface Props {
  modelValue: FileIndex | undefined,
  readonly: boolean,

  border?: {
    color: string,
    width: number,
  }
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  border: () => ({
    color: 'white',
    width: 1,
  })
});

const { modelValue } = toRefs(props);

const emit = defineEmits<{
  'update:modelValue': [fileId: FileIndex | undefined],
}>();

const previewCanvas = ref<HTMLCanvasElement |  null>(null);

const world = useWorld();
type Status = 'init' | 'no_image' | 'err_unused' | 'loading' | ImageBitmap;
const texstatus = ref<Status>('init')


// Update canvas
watchEffect(() => {
  const cnv = previewCanvas.value;
  if (cnv == null) return;
  const ctx = cnv.getContext('2d', {
    alpha: true,
  });
  if (ctx == null) return;

  const margin = (1 - props.border.width) * 128 / 2;
  ctx.clearRect(0, 0, 128, 128);
  ctx.moveTo(64, 64);
  ctx.fillStyle = props.border.color;
  ctx.arc(64, 64, 64, 0, 2*Math.PI);
  ctx.fill();

  const status = texstatus.value;

  switch (status) {
    case 'init':
    case 'no_image':
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 10;
      const l = 20;
      ctx.beginPath();
      ctx.moveTo(64 - l, 64 - l);
      ctx.lineTo(64 + l, 64 + l);
      ctx.moveTo(64 + l, 64 - l);
      ctx.lineTo(64 - l, 64 + l);
      ctx.stroke();
      break;
    case 'err_unused':
      ctx.fillText('?', 64, 64);
      break;
    case 'loading':
      ctx.fillText('...', 64, 64);
      break;
    default:
      ctx.drawImage(status, margin, margin, 128 - margin*2, 128 - margin*2);
  }
});

function setStatus(x: Status) {
  texstatus.value = x;
}

watch(modelValue, value => {
  if (value === undefined) {
    texstatus.value = 'no_image';
    return;
  }
  setStatus('loading');
  world.requireSystem('pixi_graphic').getTexture(value).then(tex => {
    if (tex === 'unused') {
    setStatus('err_unused');
      return;
    }
    const bmp = tex.baseTexture.resource.source as ImageBitmap;
    setStatus(bmp);
  });

}, { immediate: true})



function onClick() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*'

  input.onchange = e => {
    const f = input.files;
    if (f == null || f.length == 0) return;

    imgBlob.value = f[0];
  }

  input.click();
}

const isDragging = ref(false);
const imgBlob = ref<Blob | null>(null);

async function onDrop(event: DragEvent) {
  isDragging.value = false;
  console.log('DRAG OVER', event.dataTransfer);
  if (event.dataTransfer == null) return;

  event.stopPropagation();
  event.stopImmediatePropagation();
  event.preventDefault();

  let res = [];

  if (event.dataTransfer.items) {
    for (let f of event.dataTransfer.items) {
      let file = f.getAsFile();
      if (file != null) {
        res.push(file);
      }
    }

  } else {
    res.push(...event.dataTransfer.files);
  }
  if (res.length === 0) return;
  const file = res[0];
  if (!file.type.startsWith('image/')) return;

  imgBlob.value = file;
}

async function onCropped(blob: Blob) {
  imgBlob.value = null;

  const data = new Uint8Array(await blob.arrayBuffer());
  const dataId = await ImageRenderer.preloadTexture(world, data, blob.type);
  if (dataId === props.modelValue) {
    // Nothing to do :/
  } else {
    emit('update:modelValue', dataId);
  }
}

function onCropCancel() {
  imgBlob.value = null;
}


function onDragLeave() {
  isDragging.value = false;
}

function onDragOver(event: DragEvent) {
  const dt = event.dataTransfer;
  if (!(dt?.items ?? dt?.files)?.length) return;
  event.stopPropagation();
  event.stopImmediatePropagation();
  event.preventDefault();
  isDragging.value = true;

  event.dataTransfer!.dropEffect = "copy";
  return false;
}

function removeImage() {
  emit('update:modelValue', undefined);
}

</script>

<style lang="scss">
.util_eimage {
  aspect-ratio: 1 / 1;

  background-color: transparent !important;

  border-radius: 50%;

  padding: 0.125rem;
  margin-left: 0.5em;

  &.master {
    transition: 0.1s filter linear, 0.1s -webkit-filter linear;

    &:hover {
      filter: blur(5px) brightness(50%);
    }
  }
}


.util_eimage_drag {
  filter: blur(5px) brightness(50%);
}
</style>
