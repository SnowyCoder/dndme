<template>
  <div>
    <div>
      Type:
      <span v-if="!isAdmin">
        {{ this.doorTypeName }}
      </span>
      <b-form-select v-if="isAdmin" v-model="doorType" class="mb-3">
        <b-form-select-option value="normall">Normal</b-form-select-option>
        <b-form-select-option value="normalr">Normal right</b-form-select-option>
        <b-form-select-option value="rotate">Rotating</b-form-select-option>
      </b-form-select>
    </div>
    <div style="display: flex; align-items: center;">
      <span v-if="!isAdmin">{{ open ? "Open" : "Closed" }}</span>
      <span v-if="!isAdmin" v-show="this.locked" style="margin-left: 0.5rem;"><i class="fas fa-lock"></i></span>

      <b-button v-if="isAdmin" :pressed.sync="open">{{ open ? "Open" : "Closed" }}</b-button>
      <b-button v-if="isAdmin" :pressed.sync="locked">
        <div v-show="locked"><i class="fas fa-lock"></i></div>
        <div v-show="!locked"><i class="fas fa-lock-open"></i></div>
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import {DoorComponent, DoorType} from "../../ecs/systems/doorSystem";
import {VComponent, VWatchImmediate, VProp, Vue, VWatch} from "../vue";

@VComponent
export default class EcsDoor extends Vue {
  @VProp({required: true}) component!: DoorComponent;
  @VProp({required: true}) isAdmin!: boolean;

  doorType: DoorType = DoorType.NORMAL_RIGHT;
  open: boolean = false;
  locked: boolean = false;

  onChange() {
    if (this.component.doorType !== this.doorType) {
      this.$emit('ecs-property-change', 'door', 'doorType', this.doorType);
    }
    if (this.component.open !== this.open) {
      this.$emit('ecs-property-change', 'door', 'open', this.open);
    }
    if (this.component.locked !== this.locked) {
      this.$emit('ecs-property-change', 'door', 'locked', this.locked);
    }
  }

  get doorTypeName(): string {
    switch (this.doorType) {
      case DoorType.NORMAL_LEFT:
        return "Normal";
      case DoorType.NORMAL_RIGHT:
        return "Normal right";
      case DoorType.ROTATE:
        return "Rotating";
      default:
        return "Unknown??"
    }
  }

  @VWatchImmediate('component.doorType')
  onCDoorTypeChanged(val: DoorType) {
    this.doorType = val;
  }

  @VWatchImmediate('component.open')
  onCOpenChanged(val: boolean) {
    this.open = val;
  }

  @VWatchImmediate('component.locked')
  onCLockedChanged(val: boolean) {
    this.locked = val;
  }

  @VWatch('doorType')
  onDoorTypeChanged() {
    this.onChange();
  }

  @VWatch('open')
  onOpenChanged() {
    this.onChange();
  }

  @VWatch('locked')
  onLockedChanged() {
    this.onChange();
  }
}
</script>

<style scoped>

</style>