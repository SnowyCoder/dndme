<template>
  <input type="color" v-bind:value="value" v-on:input="$emit('input', $event.target.value)"
         :readonly="readonly" :placeholder="placeholder" @change="$emit('change')"
         class="util_ecolor">
</template>

<script lang="ts">

import {VComponent, VProp, Vue} from "../vue";

@VComponent
export default class EditableColor extends Vue {
  @VProp({required: true})
  value!: string;

  @VProp({default: false})
  readonly!: boolean;

  @VProp({default: ''})
  placeholder!: string;
}

</script>

<style>
.util_ecolor {
  background-color: transparent !important;
  outline: none !important;
  border: none !important;
  padding: 0.125rem !important;
  box-shadow: none !important;
  height: calc(1.5em + 0.75rem + 2px);
  width: calc(1.5em + 0.75rem + 2px);
  margin-left: 0.5em;

  -webkit-appearance: none;
}

.util_ecolor::-moz-color-swatch, .util_ecolor::-webkit-color-swatch, .util_ecolor::-webkit-color-swatch-wrapper {
  border: 0;
  padding: 0;
}
</style>

