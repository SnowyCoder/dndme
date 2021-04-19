<template>
  <div>
    <div class="d-flex align-items-center">
      W: <editable-number :readonly="!this.isAdmin" v-model="w" @change="onChange"/>
    </div>
    <div class="d-flex align-items-center">
      H: <editable-number :readonly="!this.isAdmin" v-model="h" @change="onChange"/>
    </div>
  </div>
</template>

<script lang="ts">


import {VComponent, VWatchImmediate, VProp, Vue} from "../vue";
import {WallComponent} from "../../ecs/systems/wallSystem";
import EditableNumber from "../util/editableNumber.vue";

@VComponent({
  components: {
    EditableNumber,
  }
})
export default class EcsWall extends Vue {
  @VProp({required: true})
  component!: WallComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  w: string = '';
  h: string = '';

  onChange() {
    let w = parseFloat(this.w);
    let h = parseFloat(this.h);
    if ((this.component.vec[0] !== w && this.w !== '') || (this.component.vec[1] !== h && this.h !== '')) {
      this.$emit('ecs-property-change', 'wall', 'vec', [w, h]);
    }
  }

  @VWatchImmediate('component.vec')
  onCxChanged(vec: [number, number] | undefined) {
    if (vec === undefined) {
      this.w = '';
      this.h = '';
    } else {
      this.w = vec[0] + '';
      this.h = vec[1] + '';
    }
  }
}
</script>

<style>

</style>

