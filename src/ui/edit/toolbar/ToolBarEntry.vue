<template>
  <button :title="title" class="btn" :class="buttonClass" @click="onClick">
    <component :is="icon" v-if="isComponent" />
    <i class="fas" :class="icon" v-else />
  </button>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, inject, PropType, ShallowRef, toRefs } from "vue";
import { World } from "../../../ecs/world";
import { VueComponent } from "../../vue";

export default defineComponent({
    props: {
        icon: { required: true, type: [String, Object] as PropType<string | VueComponent> },
        title: { required: true, type: String },
        toolName: { type: String, default: undefined },
        customClass: {
            type: Object as PropType<{
                color?: string,
                name?: string,
                activeName?: string,
            }>,
            default: {
                color: undefined,
                name: undefined,
                activeName: undefined,
            },
        },
    },
    emits: ['click'],
    setup(props, context) {
        const { toolName, icon, customClass } = toRefs(props);
        const world = inject('world') as ShallowRef<World>;
        const currentTool = inject('currentTool') as ComputedRef<string>;

        const onClick = () => {
            const clickUseful = currentTool.value !== toolName.value;
            context.emit('click', clickUseful);
            if (currentTool.value !== toolName.value) {
                world.value.editResource('tool', { tool: toolName.value });
            }
        };

        const isComponent = computed(() => typeof icon.value !== 'string');

        const buttonClass = computed(() => {
            const cc = customClass.value;
            const a = [];

            a.push(cc.color ?? 'toolbar-btn')

            if (toolName.value === currentTool.value) {
                a.push(cc.activeName ?? 'active');
            } else if (cc.name !== undefined) {
                a.push(cc.name);
            }
            return a;
        });

        return {
            onClick, 
            isComponent, buttonClass,
        };
    },
});
</script>

<style lang="scss">
.toolbar-btn {
  color: #fff;
  background-color: #2C3E50;
  border-color: #2C3E50;
  &:hover {
    color: #fff;
  }
  &:focus {
    box-shadow: 0 0 0 0.20rem #2C3E50;
  }
  &.active {
    background-color: #545b62;
    border-color: #4e555b;
    &:focus {
      box-shadow: 0 0 0 0.20rem #4e555b;
    }
  }
}
</style>
