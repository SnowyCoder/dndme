<template>
  <b-input v-model="component.name" :readonly="!isAdmin" placeholder="Entity name" @change="onChange"/>
</template>

<script lang="ts">
import {VComponent, VWatchImmediate, VProp, Vue} from "../vue";
import {NameComponent} from "../../ecs/component";

@VComponent
export default class EcsName extends Vue {
  @VProp({required: true})
  component!: NameComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  name: string = '';

  @VWatchImmediate('component.name')
  onCNameChanged(val: string | undefined) {
    this.name = val ?? '';
  }

  onChange() {
    this.$emit('ecs-property-change', 'name', 'name', this.name, this.component.multiId);
  }
}
</script>

<style>

</style>