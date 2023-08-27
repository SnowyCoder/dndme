<template>
  <div class="px-3">
    Type
    <div class="btn-group" role="radiogroup" aria-label="Grid Type">
      <input type="radio" id="grid-type-none"   class="btn-check" name="grid-type-radio" value="none"   v-model="gridType">
      <label class="btn btn-secondary" for="grid-type-none"   aria-label="None"><i class="fas fa-border-none"/></label>

      <input type="radio" id="grid-type-square" class="btn-check" name="grid-type-radio" value="square" v-model="gridType">
      <label class="btn btn-secondary" for="grid-type-square" aria-label="Square"><i class="far fa-square"/></label>

      <input type="radio" id="grid-type-hex"    class="btn-check" name="grid-type-radio" value="hex"    v-model="gridType">
      <label class="btn btn-secondary" for="grid-type-hex"    aria-label="Hex"><hexagon-icon /></label>
    </div>

    <div v-if="gridType !== 'none'">
      <div class="d-flex align-items-center">
        Unit
        <editable-text v-model="gridUnit"></editable-text>
      </div>

      <div class="d-flex align-items-center">
        Size
        <editable-range v-model="gridSize" :min="0.5" :max="2" :step="0.001"></editable-range>
      </div>

      <div class="d-flex align-items-center">
        Xoffset
        <editable-range v-model="gridRes.offX" :min="0" :max="1" :step="0.001"></editable-range>
      </div>


      <div class="d-flex align-items-center">
        Yoffset
        <editable-range v-model="gridRes.offY" :min="0" :max="1" :step="0.001"></editable-range>
      </div>

      <div class="d-flex align-items-center">
        Color
        <editable-color v-model="gridRes.color"></editable-color>
      </div>

      <div class="d-flex align-items-center">
        Opacity
        <editable-range v-model="gridRes.opacity" :min="0" :max="1" :step="0.01"></editable-range>
      </div>

      <div class="d-flex align-items-center">
        Thickness
        <editable-range v-model="gridRes.thick" :min="0" :max="200"></editable-range>
      </div>

      <div v-if="gridSize < 0.5" class="alert alert-warning" role="alert">
        This tool is not design to have a grid this small, you'll see any issue from blurry text to pixelated walls. Please consider scaling the images instead to have a better experience
      </div>

      <button class="btn btn-primary" title="Export" @click="isExporting = true">
        Export
      </button>
    </div>

    <modal v-model="isExporting" >
      <div class="d-flex align-items-center">
        <editable-number v-model="exportSize.width" />x<editable-number v-model="exportSize.height"/>
      </div>
      <template #footer>
        <button type="button" class="btn btn-primary" @click="onExport()">Export</button>
        <button type="button" class="btn btn-secondary" @click="isExporting = false">Close</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">

import HexagonIcon from "@/ui/icons/HexagonIcon.vue";
import EditableText from "@/ui/util/EditableText.vue";

import { GridType, STANDARD_GRID_OPTIONS } from "@/game/grid";

import { computed, ref, shallowRef, watch } from "vue";
import EditableRange from "@/ui/util/EditableRange.vue";
import EditableColor from "@/ui/util/EditableColor.vue";
import EditableNumber from "@/ui/util/EditableNumber.vue";
import Modal from "@/ui/util/Modal.vue";
import { ResourceUpdateHistory, useResourceReactive, useWorld } from "@/ui/vue";

const DEFAULT_GRID_SIZE = {
  width: 2480,
  height: 3508,
}

const world = useWorld();

const isExporting = shallowRef(false);
const exportSize = ref(Object.assign({}, DEFAULT_GRID_SIZE));


//const gridRes = useResource(world, 'grid');

const gridRes = useResourceReactive(world, 'grid', {
  gridType: GridType.SQUARE,
  unitMul: 0,
  unitName: 'm',
  size: 1,
  offX: 0,
  offY: 0,
  color: 0,
  opacity: 0.5,
  thick: 2,
  visible: false,
}, ResourceUpdateHistory.REGISTER_COMMAND_IN_HISTORY);

const gridType = computed({
  get: () => {
    if (!gridRes.visible) return 'none';
    switch (gridRes.gridType) {
    case GridType.SQUARE: return 'square';
    case GridType.HEXAGON: return 'hex';
    }
  },
  set: (x: 'none' | 'square' | 'hex') => {
    switch (x) {
    case 'square':
      gridRes.visible = true;
      gridRes.gridType = GridType.SQUARE;
      break;
    case 'hex':
      gridRes.visible = true;
      gridRes.gridType = GridType.HEXAGON;
      break;
    case 'none':
      gridRes.visible = false;
      break;
    }
  }
});

const gridUnit = computed({
  get: () => gridRes.unitMul + ' ' + gridRes.unitName,
  set: (x) => {
    const res = parseUnit(x);
    if (res == undefined) return;
    gridRes.unitName = res.name;
    gridRes.unitMul = res.mul;
  }
});

const gridSize = computed({
  get: () => gridRes.size / STANDARD_GRID_OPTIONS.size,
  set: (x) => gridRes.size = x * STANDARD_GRID_OPTIONS.size,
})

const onExport = () => {
  world.events.emit('grid_export', exportSize.value.width, exportSize.value.height);
  isExporting.value = false;
};
watch(isExporting, newVal => {
  if (newVal) {
    Object.assign(exportSize.value, DEFAULT_GRID_SIZE);
  }
});

function parseUnit(s: string): { name: string, mul: number} | undefined {
  const pattern = /^\s*([0-9.,]+)(.+)$/g;

  let res = pattern.exec(s);
  if (res == null) return undefined;
  let mul = 1;
  try {
    mul = parseFloat(res[1]);
  } catch(e) {}

  return {
    name: res[2].trim(),
    mul,
  }
}


</script>
