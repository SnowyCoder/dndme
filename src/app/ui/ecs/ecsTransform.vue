<template>
  <div>
    <div class="d-flex align-items-center">
      Angle: <editable-number :readonly="!isAdmin" v-model="rotation" @change="onChange"/>
    </div>
    <div class="d-flex align-items-center">
      Scale: <editable-number :readonly="!isAdmin" v-model="scale" @change="onChange"/>
    </div>
  </div>
</template>

<script lang="ts">
import {DEG_TO_RAD, RAD_TO_DEG} from "pixi.js";

import {VComponent, VWatchImmediate, VProp, Vue} from "../vue";
import {TransformComponent} from "../../ecs/component";
import EditableNumber from "../util/editableNumber.vue";

@VComponent({
  components: {
    EditableNumber,
  }
})
export default class EcsTransform extends Vue {
  @VProp({required: true})
  component!: TransformComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  rotation: string = '';
  scale: string = '';

  onChange() {
    if (this.rotation !== '') {
      let r = (((parseFloat(this.rotation) % 360) + 360) % 360);
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

<style>

</style>