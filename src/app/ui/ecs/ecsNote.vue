<template>
  <div>
    <b-textarea placeholder="Write something here..." v-model="note" :readonly="!isAdmin"
                @change="onChange"/>
    <b-modal title="Note" v-model="component._isFullscreen" dialog-class="modal-fullscreen modal-xxl" hide-footer
             hide-header>
      <b-textarea placeholder="Write something here..." v-model="note" :readonly="!isAdmin"
                  @change="onChange" style="height: 100%; resize: none;"/>
      <template v-slot:modal-footer>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import {Vue, VComponent, VProp, VWatch} from "../vue";
import {NoteComponent} from "../../ecs/component";

@VComponent
export default class EcsNote extends Vue {
  @VProp({required: true})
  component!: NoteComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  note: string;

  constructor() {
    super();
    this.note = this.component.note;
  }

  @VWatch('component.note')
  onCNoteChanged(val: string) {
    this.note = val;
  }

  onChange() {
    this.$emit('ecs-property-change', 'note', 'note', this.note, this.component.multiId);
  }
}
</script>

<style scoped>

</style>