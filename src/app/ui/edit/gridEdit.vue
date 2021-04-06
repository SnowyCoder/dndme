<template>
  <div>
    Type:
    <b-radio-group id="grid-type-radio" v-model="grid.type" buttons>
      <b-radio value="none"><i class="fas fa-border-none"></i></b-radio>
      <b-radio value="square"><i class="far fa-square"></i></b-radio>
      <b-radio value="hex">
        <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"
             class="svg-inline--fa fa-hexagon fa-w-18">
          <path fill="currentColor"
                d="M441.5 39.8C432.9 25.1 417.1 16 400 16H176c-17.1 0-32.9 9.1-41.5 23.8l-112 192c-8.7 14.9-8.7 33.4 0 48.4l112 192c8.6 14.7 24.4 23.8 41.5 23.8h224c17.1 0 32.9-9.1 41.5-23.8l112-192c8.7-14.9 8.7-33.4 0-48.4l-112-192zM400 448H176L64 256 176 64h224l112 192-112 192z"
                class=""></path>
        </svg>
      </b-radio>
    </b-radio-group>

    <div v-if="grid.type !== 'none'">
      <div class="d-flex flex-row align-items-center">
        <div class="">Size:</div>
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

import {VComponent, VProp, Vue, VWatch} from "../vue";
import {GridType} from "../../game/grid";
import {GridResource, Resource} from "../../ecs/resource";
import string2hex = PIXI.utils.string2hex;
import {World} from "../../ecs/world";
import hex2string = PIXI.utils.hex2string;
import {ResourceEditCommand} from "../../ecs/systems/command/resourceEditCommand";

type RenderGridOpts = {
  type: string;
  size: number;
  offX: number;
  offY: number;
  color: string;
  opacity: number;
  thick: number;
}

@VComponent
export default class GridEdit extends Vue {
  @VProp({ required: true })
  world!: World;

  grid: RenderGridOpts = {
    type: "none",
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
    } else {
      cmd.edit['grid'] = {
        visible: false,
      };
    }
    this.world.events.emit('command_log', cmd);
  }
}
</script>