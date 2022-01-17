<template>
  <div style="display: flex; align-items: center;" v-if="currentTool == 'create_pin'">
    Default size
    <editable-range v-model="pinDefaultSize"
                    min="0.5" max=10 step="0.1" @input="onPinSizeChanged"/>
  </div>
</template>

<script lang="ts">

import { VComponent, Vue } from "../vue";
import { Resource } from "../../ecs/resource";
import { World } from "../../ecs/world";
import { PinResource, PIN_TYPE } from "../../ecs/systems/pinSystem";
import EditableRange from "../util/editableRange.vue";
import { ResourceEditCommand } from "../../ecs/systems/command/resourceEditCommand";

@VComponent({
  components: {
    EditableRange,
  },
  inject: ['world'],
})
export default class GridEdit extends Vue {
  world!: World;

  pinDefaultSize: number = 1;

  mounted() {
    this.world.events.on('resource_edited', this.onResourceEdited, this);
  }

  unmounted() {
    this.world.events.off('resource_edited', this.onResourceEdited, this);
  }

  onPinSizeChanged() {
    let cmd = {
      kind: 'redit',
      add: [], remove: [],
      edit: {},
    } as ResourceEditCommand;

    cmd.edit[PIN_TYPE] = {
      defaultSize: this.pinDefaultSize,
    };
    this.world.events.emit('command_log', cmd);
  }

  onResourceEdited(res: Resource) {
    if (res.type == PIN_TYPE) {
      this.pinDefaultSize = (res as PinResource).defaultSize;
    }
  }
}
</script>
