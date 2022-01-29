<template>
  <div>
    <div style="display: flex; align-items: center;">
      Target: <span @click="focusTarget">{{ component.targetProp }}</span>
    </div>
    <template v-if="isMaster">
      <button class="btn btn-secondary" @click="link">Link</button>
      <button class="btn btn-secondary" @click="use">Use</button>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, PropType, ShallowRef, toRefs } from "vue";
import { PropTeleport } from "../../ecs/systems/propSystem";
import { World } from "../../ecs/world";

export default defineComponent({
  props: {
    component: { type: Object as PropType<PropTeleport>, required: true },
  },
  setup(props) {
    const { component } = toRefs(props);
    const world = inject<ShallowRef<World>>("world")!;
    const isMaster = inject<boolean>('isMaster');

    return {
      isMaster,
      link: () => world.value.events.emit('prop_teleport_link', component.value.entity),
      use: () => world.value.events.emit('prop_use', component.value.entity),
      focusTarget: () => console.log("TODO: Focus Target not implemented"), // TODO
    }
  }
});
</script>

<style scoped>

</style>
