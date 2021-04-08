<template>
</template>

<script lang="ts">
import {Vue, VComponent, VProp} from "../vue";
import {PropComponent} from "../../ecs/systems/propSystem";

@VComponent
export default class EcsBackgroundImage extends Vue {
  @VProp({required: true}) component!: PropComponent;
}
</script>

<style scoped>

</style>