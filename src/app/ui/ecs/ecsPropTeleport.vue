<template>
  <div>
    <div style="display: flex; align-items: center;">
      Target: <span @click="focusTarget">{{ this.component.targetProp }}</span>
    </div>
    <b-button @click="link">Link</b-button>
    <b-button @click="use">Use</b-button>
  </div>
</template>

<script lang="ts">
import {VComponent, VProp, Vue} from "../vue";
import {PropTeleport} from "../../ecs/systems/propSystem";

@VComponent
export default class EcsPropTeleport extends Vue {
  @VProp({required: true})
  component!: PropTeleport;

  @VProp({required: true})
  isAdmin!: boolean;

  focusTarget() {
    console.warn("TODO: focus target")
  }

  link() {
    this.$emit('ecs-property-change', '@', 'prop_teleport_link', this.component.entity);
  }

  use() {
    this.$emit('ecs-property-change', '@', 'prop_use', this.component.entity);
  }
}
</script>

<style scoped>

</style>