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

import {VComponent, VWatchImmediate, VProp, Vue} from "../vue";
import {TransformComponent} from "../../ecs/component";

@VComponent
export default class EcsTransform extends Vue {
  @VProp({required: true})
  component!: TransformComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  rotation: string = '';
  scale: string = '';

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

  @VWatchImmediate('component.rotation')
  onCRotationChanged(val: number | undefined) {
    this.rotation = (val ?? 0) * RAD_TO_DEG + '';
  }

  @VWatchImmediate('component.scale')
  onCScaleChanged(val: number | undefined) {
    this.scale = (val ?? 0) + '';
  }
}
</script>

<style scoped>

</style>