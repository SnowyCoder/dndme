<template>
  <div>
    Type:
    <b-radio-group id="grid-type-radio" v-model="grid.type" buttons>
      <b-radio value="none"><i class="fas fa-border-none"></i></b-radio>
      <b-radio value="square"><i class="far fa-square"></i></b-radio>
      <b-radio value="hex">
        <hexagon-icon />
      </b-radio>
    </b-radio-group>

    <div v-if="grid.type !== 'none'">
      <div class="d-flex flex-row align-items-center">
        <div>Unit:</div>
        <div class="p-2">
          <b-input type="string" v-model="grid.unit" size="sm"></b-input>
        </div>
      </div>

      <div class="d-flex flex-row align-items-center">
        <div>Size:</div>
        <div class="p-2">
          <b-input type="number" v-model="grid.size" min="10" max="512" size="sm"></b-input>
        </div>
      </div>
      <b-input type="range" min="10" max="512" v-model="grid.size"></b-input>

      <div class="d-flex flex-row align-items-center">
        <div>Xoffset:</div>
        <div class="p-2">
          <b-input type="number" v-model="grid.offX" min="0" max="1" step="0.001" size="sm"></b-input>
        </div>
      </div>
      <b-input type="range" min="0" max="1" step="0.001" v-model="grid.offX"></b-input>


      <div class="d-flex flex-row align-items-center">
        <div class="">Yoffset:</div>
        <div class="p-2">
          <b-input type="number" v-model="grid.offY" min="0" max="1" step="0.001" size="sm"></b-input>
        </div>
      </div>
      <b-input type="range" min="0" max="1" step="0.001" v-model="grid.offY"></b-input>

      Color: {{ grid.color }}
      <b-input type="color" v-model="grid.color"></b-input>

      <div class="d-flex flex-row align-items-center">
        <div class="">Opacity:</div>
        <div class="p-2">
          <b-input type="number" v-model="grid.opacity" min="0" max="1" step="0.001" size="sm"></b-input>
        </div>
      </div>
      <b-input type="range" min="0" max="1" step="0.001" v-model="grid.opacity"></b-input>

      <div class="d-flex flex-row align-items-center">
        <div class="">Thickness:</div>
        <div class="p-2">
          <b-input type="number" v-model="grid.thick" min="1" max="200" size="sm"></b-input>
        </div>
      </div>
      <b-input type="range" min="1" max="200" v-model="grid.thick"></b-input>
    </div>
  </div>
</template>

<script lang="ts">

import HexagonIcon from "../icons/hexagonIcon.vue";

import {VComponent, VProp, Vue, VWatch} from "../vue";
import {GridType} from "../../game/grid";
import {GridResource, Resource} from "../../ecs/resource";
import string2hex = PIXI.utils.string2hex;
import {World} from "../../ecs/world";
import hex2string = PIXI.utils.hex2string;
import {ResourceEditCommand} from "../../ecs/systems/command/resourceEditCommand";

type RenderGridOpts = {
  type: string;
  unit: string;
  size: number;
  offX: number;
  offY: number;
  color: string;
  opacity: number;
  thick: number;
}

@VComponent({
  components: { HexagonIcon }
})
export default class GridEdit extends Vue {
  @VProp({ required: true })
  world!: World;

  grid: RenderGridOpts = {
    type: "none",
    unit: '0 m',
    size: 1,
    offX: 0,
    offY: 0,
    color: '#000000',
    opacity: 0.5,
    thick: 2,
  };
  disableWatchSave: boolean = false;

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
    this.grid.color = hex2string(opts.color);
    this.grid.opacity = opts.opacity;
    this.grid.thick = opts.thick;

    this.disableWatchSave = false;
  }

  mounted() {
    this.reloadGrid();

    this.world.events.on('resource_edited', this.onResourceEdited, this);
  }

  unmounted() {
    this.world.events.off('resource_edited', this.onResourceEdited, this);
  }

  onResourceEdited(res: Resource) {
    if (res.type === 'grid') this.reloadGrid();
  }

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
  }

  @VWatch('grid', { deep: true })
  onGridChange(newGrid: any) {
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
        color: string2hex(newGrid.color),
        opacity: parseFloat(newGrid.opacity),
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
</script>