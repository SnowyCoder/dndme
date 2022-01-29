<template>
  <div class="px-3">
    Type
    <div class="btn-group" role="radiogroup" aria-label="Grid Type">
      <input type="radio" id="grid-type-none"   class="btn-check" name="grid-type-radio" value="none"   v-model="grid.type">
      <label class="btn btn-secondary" for="grid-type-none"   aria-label="None"><i class="fas fa-border-none"/></label>

      <input type="radio" id="grid-type-square" class="btn-check" name="grid-type-radio" value="square" v-model="grid.type">
      <label class="btn btn-secondary" for="grid-type-square" aria-label="Square"><i class="far fa-square"/></label>

      <input type="radio" id="grid-type-hex"    class="btn-check" name="grid-type-radio" value="hex"    v-model="grid.type">
      <label class="btn btn-secondary" for="grid-type-hex"    aria-label="Hex"><hexagon-icon /></label>
    </div>

    <div v-if="grid.type !== 'none'">
      <div class="d-flex align-items-center">
        Unit
        <editable-text v-model="grid.unit"></editable-text>
      </div>

      <div class="d-flex align-items-center">
        Size
        <editable-range v-model="grid.size" :min="10" :max="512"></editable-range>
      </div>

      <div class="d-flex align-items-center">
        Xoffset
        <editable-range v-model="grid.offX" :min="0" :max="1" :step="0.001"></editable-range>
      </div>


      <div class="d-flex align-items-center">
        Yoffset
        <editable-range v-model="grid.offY" :min="0" :max="1" :step="0.001"></editable-range>
      </div>

      <div class="d-flex align-items-center">
        Color
        <editable-color v-model="grid.color"></editable-color>
      </div>

      <div class="d-flex align-items-center">
        Opacity
        <editable-range v-model="grid.opacity" :min="0" :max="1" :step="0.01"></editable-range>
      </div>

      <div class="d-flex align-items-center">
        Thickness
        <editable-range v-model="grid.thick" :min="0" :max="200"></editable-range>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import HexagonIcon from "../icons/HexagonIcon.vue";
import EditableText from "../util/EditableText.vue";

import { GridType } from "../../game/grid";
import { GridResource, Resource } from "../../ecs/resource";
import { World } from "../../ecs/world";

import { ResourceEditCommand } from "../../ecs/systems/command/resourceEditCommand";
import { defineComponent, inject, ShallowRef } from "vue";
import EditableRange from "../util/EditableRange.vue";
import EditableColor from "../util/EditableColor.vue";

type RenderGridOpts = {
  type: string;
  unit: string;
  size: number;
  offX: number;
  offY: number;
  color: number;
  opacity: number;
  thick: number;
}

export default defineComponent({
  components: { HexagonIcon, EditableText, EditableRange, EditableColor },
  setup() {
    const world = inject('world') as ShallowRef<World>;

    return { world };
  },
  data() {
    return {
      grid: {
        type: "none",
        unit: '0 m',
        size: 1,
        offX: 0,
        offY: 0,
        color: 0,
        opacity: 0.5,
        thick: 2,
      } as RenderGridOpts,
      disableWatchSave: false,
    };
  },
  watch: {
    grid: {
      deep: true,
      handler (newGrid: any) {
        if (this.disableWatchSave) return;
        newGrid.offX = Math.min(newGrid.offX, newGrid.size);
        newGrid.offY = Math.min(newGrid.offY, newGrid.size);

        let type;
        switch (newGrid.type) {
          case 'none':
            type = undefined;
            break;
          case 'hex':
            type = GridType.HEXAGON;
            break;
          case 'square':
            type = GridType.SQUARE;
            break;
        }
        let cmd = {
          kind: 'redit',
          add: [], remove: [],
          edit: {},
        } as ResourceEditCommand;
        if (type !== undefined) {
          cmd.edit['grid'] = {
            visible: true,
            gridType: type,
            size: newGrid.size,
            offX: newGrid.offX,
            offY: newGrid.offY,
            color: newGrid.color,
            opacity: newGrid.opacity,
            thick: newGrid.thick,
          } as GridResource;
          let unit = this.parseUnit(newGrid.unit);
          if (unit !== undefined) {
            let grid = cmd.edit.grid as GridResource;
            grid.unitMul = unit.mul;
            grid.unitName = unit.name;
          }
        } else {
          cmd.edit['grid'] = {
            visible: false,
          };
        }
        this.world.events.emit('command_log', cmd);
      }
    }
  },
  methods: {
    reloadGrid() {
      this.disableWatchSave = true;

      let grid = this.world.getResource('grid') as GridResource;
      switch (grid.gridType) {
        case GridType.HEXAGON:
          this.grid.type = 'hex'
          break;
        case GridType.SQUARE:
          this.grid.type = 'square'
          break;
      }

      if (!grid.visible) {
        this.grid.type = 'none';
      }
      let opts = grid;
      this.grid.unit = grid.unitMul + ' ' + grid.unitName;
      this.grid.size = opts.size;
      this.grid.offX = opts.offX;
      this.grid.offY = opts.offY;
      this.grid.color = opts.color;
      this.grid.opacity = opts.opacity;
      this.grid.thick = opts.thick;

      this.disableWatchSave = false;
    },
    onResourceEdited(res: Resource) {
      if (res.type === 'grid') this.reloadGrid();
    },
    parseUnit(s: string): { name: string, mul: number} | undefined {
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
    },
  },
  mounted() {
    this.reloadGrid();

    this.world.events.on('resource_edited', this.onResourceEdited, this);
  },
  unmounted() {
    this.world.events.off('resource_edited', this.onResourceEdited, this);
  },
});
</script>
