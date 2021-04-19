<template>
  <div>
    <div class="d-flex align-items-center">
      X: <editable-number :readonly="!isAdmin" v-model="x" @change="onChange"/>
    </div>
    <div class="d-flex align-items-center">
      Y: <editable-number :readonly="!isAdmin" v-model="y" @change="onChange"/>
    </div>
  </div>
</template>

<script lang="ts">
import {VComponent, VWatchImmediate, VProp, Vue} from "../vue";
import {PositionComponent} from "../../ecs/component";
import EditableNumber from "../util/editableNumber";

@VComponent({
  components: {
    EditableNumber,
  }
})
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

<style>
</style>