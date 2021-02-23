<template>
  <div>
    <div style="display: flex; align-items: center;">
      Angle: <span v-if="!isAdmin" style="margin-left: 0.5rem;">{{ rotation }}</span>
      <b-input v-if="isAdmin" type="number" step="0.001" v-model="rotation" size="sm" @change="onChange"></b-input>
    </div>
    <div style="display: flex; align-items: center;">
      Scale: <span v-if="!isAdmin" style="margin-left: 0.5rem;">{{ scale }}</span>
      <b-input v-if="isAdmin" type="number" step="0.001" v-model="scale" size="sm" @change="onChange"></b-input>
    </div>
  </div>
</template>

<script lang="ts">
import {DEG_TO_RAD, RAD_TO_DEG} from "pixi.js";

import {VComponent, VProp, Vue, VWatch} from "../vue";
import {TransformComponent} from "../../ecs/component";

@VComponent
export default class EcsTransform extends Vue {
  @VProp({required: true})
  component!: TransformComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  rotation: string;
  scale: string;

  constructor() {
    super();
    this.rotation = this.component.rotation * RAD_TO_DEG + '';
    this.scale = this.component.scale + '';
  }

  onChange() {
    if (this.rotation !== '') {
      let r = Math.min(Math.max(parseFloat(this.rotation), 0), 360);
      if (this.component.rotation !== r) {
        this.$emit('ecs-property-change', 'transform', 'rotation', r * DEG_TO_RAD);
      }
    }
    if (this.scale !== '') {
      let s = parseFloat(this.scale);
      if (this.component.scale !== s) {
        this.$emit('ecs-property-change', 'transform', 'scale', s);
      }
    }
  }

  @VWatch('component.rotation')
  onCRotationChanged(val: number) {
    this.rotation = val * RAD_TO_DEG + '';
  }

  @VWatch('component.scale')
  onCScaleChanged(val: number) {
    this.scale = val + '';
  }
}
</script>

<style scoped>

</style>