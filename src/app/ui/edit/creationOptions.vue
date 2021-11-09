<template>
  <section v-if="visible">
    <div style="display: flex; align-items: center;">
      Create once:
      <b-form-checkbox v-model="exitAfterCreation" @input="onChange"></b-form-checkbox>
    </div>
  </section>
</template>

<script lang="ts">

import {VComponent, VProp, Vue} from "../vue";
import {CreationInfoResource, CREATION_INFO_TYPE, GridResource, Resource} from "../../ecs/resource";
import {World} from "../../ecs/world";
import { ToolSystem } from "../../ecs/systems/back/toolSystem";

@VComponent
export default class GridEdit extends Vue {
  @VProp({ required: true })
  world!: World;

  visible: boolean = false;
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
    else if (res.type === 'tool') {
        this.visible = (this.world.systems.get('tool') as ToolSystem).isToolPartEnabled('creation_flag');
    }
  }
}
</script>