<template>
  <div class="util_editable-text_div">
    <input type="text" v-bind:value="value" v-on:input="onEvent('input', $event)"
             :readonly="readonly" :placeholder="placeholder" @change="onEvent('change', $event)"
             class="form-control-plaintext hprior util_editable-text_input">
    <span class="util_editable-text_border"></span>
  </div>
</template>

<script lang="ts">

import {VComponent, VProp, Vue} from "../vue";

@VComponent
export default class EditableText extends Vue {
  @VProp({required: true})
  value!: string;

  @VProp({default: false})
  readonly!: boolean;

  @VProp({default: ''})
  placeholder!: string

  @VProp({default: undefined})
  filter?: (text: string) => string;

  onEvent(ev: string, event: InputEvent) {
    const et = event.target as any;
    if (this.filter !== undefined) {
      et.value = this.filter(et.value);
    }
    this.$emit(ev, et.value);
  }
}

</script>

<style>
.util_editable-text_div {
  position: relative;
  margin: 5px;
  width: 100%;
}

.util_editable-text_border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;

  border: 1px solid transparent;
  transition: width 0.2s, border 0s 0.2s;
}

.util_editable-text_input:focus ~ .util_editable-text_border {
  border-color: #4285F4;
  width: 100%;
  transition: width 0.3s;
}

.hprior.util_editable-text_input {
  color: white;
  padding: 3px 10px;
  margin: 0;
  border-bottom: solid 1px #eeeeee;
  outline: none;
}
</style>

