<template>
  <span>Your regular background image</span>
</template>

<script lang="ts">
import {Vue, VComponent, VProp} from "../vue";
import {Component} from "../../ecs/component";
import {BackgroundImageComponent} from "../../ecs/systems/backgroundSystem";

@VComponent
export default class EcsBackgroundImage extends Vue {
  @VProp({required: true}) component!: BackgroundImageComponent;
}
</script>

<style scoped>

</style>