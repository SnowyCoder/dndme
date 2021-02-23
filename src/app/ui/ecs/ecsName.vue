<template>
  <b-input v-model="component.name" :readonly="!isAdmin" placeholder="Entity name" @change="onChange"/>
</template>

<script lang="ts">
import {Vue, VComponent, VProp, VWatch} from "../vue";
import {NameComponent} from "../../ecs/component";

@VComponent
export default class EcsName extends Vue {
  @VProp({required: true})
  component!: NameComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  name: string;

  constructor() {
    super();
    this.name = this.component.name;
  }

  @VWatch('component.name')
  onCNameChanged(val: string) {
    this.name = val;
  }

  onChange() {
    this.$emit('ecs-property-change', 'name', 'name', this.name, this.component.multiId);
  }
}
</script>

<style scoped>

</style>