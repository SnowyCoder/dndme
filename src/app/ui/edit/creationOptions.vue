<template>
  <div>
    <div style="display: flex; align-items: center;">
      Create once:
      <b-form-checkbox v-model="exitAfterCreation" @input="onChange"></b-form-checkbox>
    </div>
    <component :is="additionalOptions" v-if="additionalOptions !== undefined"></component>
  </div>
</template>

<script lang="ts">

import {VComponent, VProp, Vue} from "../vue";
import {CreationInfoResource, CREATION_INFO_TYPE, Resource} from "../../ecs/resource";
import {World} from "../../ecs/world";
import { VueConstructor } from "vue/types/umd";

@VComponent({
  inject: ['world'],
})
export default class GridEdit extends Vue {
  world!: World;

  @VProp({ default: undefined })
  additionalOptions: VueConstructor | undefined;

  exitAfterCreation: boolean = false;


  reloadResource() {
    const info = this.world.getResource(CREATION_INFO_TYPE) as CreationInfoResource | undefined;
    this.exitAfterCreation = info?.exitAfterCreation ?? true;
  }

  onChange() {
    this.world.addResource({
        type: CREATION_INFO_TYPE,
        exitAfterCreation: this.exitAfterCreation,
    } as CreationInfoResource, 'update');
  }

  mounted() {
    this.reloadResource();

    this.world.events.on('resource_edited', this.onResourceEdited, this);
  }

  unmounted() {
    this.world.events.off('resource_edited', this.onResourceEdited, this);
  }

  onResourceEdited(res: Resource) {
    if (res.type === CREATION_INFO_TYPE) this.reloadResource();
  }
}
</script>
