<template>
  <button :title="this.title" class="toolbar-btn plz-prioritize" :class="buttonClass" @click="onClick">
    <component :is="icon" v-if="isComponent" />
    <i class="fas" :class="fontAwesomeClass" v-else />
  </button>
</template>

<script lang="ts">
import { VueConstructor } from "vue/types/umd";
import { World } from "../../ecs/world";
import { ShallowRef, VComponent, VProp, Vue } from "../vue";


@VComponent({
    inject: ['currentTool', 'world'],
})
export default class ToolBarEntry extends Vue {
    @VProp({ required: true })
    icon!: VueConstructor | string;

    @VProp({ required: true, type: String })
    title!: string;

    @VProp({ required: false, type: String, default: undefined })
    toolName: string | undefined;

    @VProp({ required: false, default: {}})
    customClass!: {
        name?: string,
        activeName?: string,
    };

    currentTool!: { value: string };
    world!: World;

    get isComponent() {
        return this.icon instanceof Vue;
    }

    get fontAwesomeClass() {
        const a = [];
        a.push('fa-' + this.icon);
        return a;
    }

    get buttonClass() {
        const a = [];
        if (this.toolName == this.currentTool.value) {
            a.push(this.customClass.activeName !== undefined ? this.customClass.activeName : 'active');
        } else if (this.customClass.name !== undefined) {
            a.push(this.customClass.name);
        }
        return a;
    }

    onClick() {
        this.world.editResource('tool', { tool: this.toolName });
    }
}
</script>

<style>
.toolbar-btn.plz-prioritize {
  color: #fff;
  background-color: #2C3E50;
  border-color: #2C3E50;
}
.toolbar-btn.plz-prioritize.active {
  color: #fff;
  background-color: #545b62;
  border-color: #4e555b;
}
</style>
