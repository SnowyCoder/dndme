<template>
  <div>
    <div style="display: flex; align-items: center;">
      X: <span v-if="!isAdmin" style="margin-left: 0.5rem;">{{ x }}</span>
      <b-input v-if="isAdmin" type="number" step="0.001" v-model="x" size="sm" @change="onChange"></b-input>
    </div>
    <div style="display: flex; align-items: center;">
      Y: <span v-if="!isAdmin" style="margin-left: 0.5rem;"> {{ y }}</span>
      <b-input v-if="isAdmin" type="number" step="0.001" v-model="y" size="sm" @change="onChange"></b-input>
    </div>
  </div>
</template>

<script lang="ts">
import {VComponent, VWatchImmediate, VProp, Vue} from "../vue";
import {PositionComponent} from "../../ecs/component";

@VComponent
export default class EcsPosition extends Vue {
  @VProp({required: true})
  component!: PositionComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  x: string = '';
  y: string = '';

  onChange() {
    let x = parseFloat(this.x);
    if (this.component.x !== x && this.x !== '') {
      this.$emit('ecs-property-change', 'position', 'x', x);
    }
    let y = parseFloat(this.y);
    if (this.component.y !== y && this.y !== '') {
      this.$emit('ecs-property-change', 'position', 'y', y);
    }
  }

  @VWatchImmediate('component.x')
  onCxChanged(val: number | undefined) {
    this.x = (val ?? '') + '';
  }

  @VWatchImmediate('component.y')
  onCyChanged(val: number | undefined) {
    this.y = (val ?? '') + '';
  }
}
</script>

<style scoped>

</style>