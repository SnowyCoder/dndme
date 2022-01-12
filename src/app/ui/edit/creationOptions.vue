<template>
  <section v-if="visible">
    <div style="display: flex; align-items: center;">
      Create once:
      <b-form-checkbox v-model="exitAfterCreation" @input="onChange"></b-form-checkbox>
    </div>
    <div style="display: flex; align-items: center;" v-if="currentTool == 'create_pin'">
      Default size
      <editable-range v-model="pinDefaultSize"
                      min="0.5" max=10 step="0.1" @input="onPinSizeChanged"/>
    </div>
  </section>
</template>

<script lang="ts">

import {VComponent, VProp, Vue} from "../vue";
import {CreationInfoResource, CREATION_INFO_TYPE, Resource} from "../../ecs/resource";
import {World} from "../../ecs/world";
import { ToolSystem } from "../../ecs/systems/back/toolSystem";
import { PinResource, PIN_TYPE } from "../../ecs/systems/pinSystem";
import EditableRange from "../util/editableRange.vue";
import { ResourceEditCommand } from "../../ecs/systems/command/resourceEditCommand";

@VComponent({
  components: {
    EditableRange
  }
})
export default class GridEdit extends Vue {
  @VProp({ required: true })
  world!: World;

  currentTool: string = "";
  visible: boolean = false;
  exitAfterCreation: boolean = false;

  pinDefaultSize: number = 1;

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
    if (res.type === CREATION_INFO_TYPE) this.reloadResource();
    else if (res.type === 'tool') {
      const toolSys = this.world.systems.get('tool') as ToolSystem;
      this.currentTool = toolSys.currentTool ?? "uninitialized";
      this.visible = toolSys.isToolPartEnabled('creation_flag');
    } else if (res.type == PIN_TYPE) {
      this.pinDefaultSize = (res as PinResource).defaultSize;
    }
  }
}
</script>
