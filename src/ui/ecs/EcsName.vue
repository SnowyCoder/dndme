<template>
  <editable-text v-model="component.name" :readonly="!isMaster" placeholder="Entity name"/>
</template>

<script lang="ts">
import { defineComponent, inject, PropType, toRefs } from "vue";
import { NameComponent } from "../../ecs/component";
import EditableText from "../util/EditableText.vue";
import { useComponentPiece } from "../vue";

export default defineComponent({
  components: { EditableText },
  props: {
    component: { type: Object as PropType<NameComponent>, required: true },
  },
  setup(props) {
    const { component } = toRefs(props);
    const isMaster = inject<boolean>('isMaster');
    return {
      isMaster,
      name: useComponentPiece(component, 'name', ''),
    }
  }
});
</script>

<style>

</style>
