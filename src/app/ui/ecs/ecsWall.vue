<template>
  <div>
    <div style="display: flex; align-items: center;">
      W <span v-if="!isAdmin" style="margin-left: 0.5rem;">{{ w }}</span>
      <b-input v-if="isAdmin" type="number" step="0.001" v-model="w" size="sm" @change="onChange"></b-input>
    </div>
    <div style="display: flex; align-items: center;">
      H: <span v-if="!isAdmin" style="margin-left: 0.5rem;">{{ h }}</span>
      <b-input v-if="isAdmin" type="number" step="0.001" v-model="h" size="sm" @change="onChange"></b-input>
    </div>
  </div>
</template>

<script lang="ts">


import {VComponent, VProp, Vue, VWatch} from "../vue";
import {WallComponent} from "../../ecs/systems/wallSystem";

@VComponent
export default class EcsWall extends Vue {
  @VProp({required: true})
  component!: WallComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  w: string;
  h: string;

  constructor() {
    super();
    this.w = this.component.vec[0] + '';
    this.h = this.component.vec[1] + '';
  }

  onChange() {
    let w = parseFloat(this.w);
    let h = parseFloat(this.h);
    if ((this.component.vec[0] !== w && this.w !== '') || (this.component.vec[1] !== h && this.h !== '')) {
      this.$emit('ecs-property-change', 'wall', 'vec', [w, h]);
    }
  }

  @VWatch('component.vec')
  onCxChanged(val: [number, number]) {
    this.w = val[0] + '';
    this.h = val[1] + '';
  }
}
</script>

<style scoped>

</style>