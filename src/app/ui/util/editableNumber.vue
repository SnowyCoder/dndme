<template>
  <editable-text v-bind:value="value" :readonly="readonly" :placeholder="placeholder"
                 @change="$emit('change', parseFloat($event))"
                 @input="$emit('input', $event)" :filter="filter"/>
</template>

<script lang="ts">

import {VComponent, VProp, Vue} from "../vue";
import EditableText from "./editableText.vue";

@VComponent({
  components: {
    EditableText
  }
})
export default class EditableNumber extends Vue {
  @VProp({required: true})
  value!: string;

  @VProp({default: false})
  readonly!: boolean;

  @VProp({default: ''})
  placeholder!: string;

  @VProp({default: true})
  canBeNegative!: boolean;

  filter = (s: string) => {
    let neg = false;
    if (s[0] === '-') {
      neg = this.canBeNegative;
      s = s.substr(1);
    }
    const prefix = neg ? '-' : '';
    return prefix + s.split('.', 2)
        .map(x => x.replace(/[^0-9]*/g, ''))
        .join('.');
  }

}

</script>

<style>
</style>

