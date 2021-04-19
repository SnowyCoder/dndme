<template>
  <div>
    <b-textarea placeholder="Write something here..." v-model="note" :readonly="!isAdmin" class="hprior ecs-note_textarea"
                @change="onChange"/>
    <b-modal title="Note" v-model="component._isFullscreen" hide-footer hide-header
             dialog-class="modal-fullscreen modal-xxl" content-class="modal-content-dark">
      <b-textarea placeholder="Write something here..." v-model="note" :readonly="!isAdmin"
                  @change="onChange" style="height: 100%; resize: none;" class="hprior ecs-note_textarea"/>
      <template v-slot:modal-footer>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts">
import {VComponent, VWatchImmediate, VProp, Vue} from "../vue";
import {NoteComponent} from "../../ecs/component";

@VComponent
export default class EcsNote extends Vue {
  @VProp({required: true})
  component!: NoteComponent;

  @VProp({required: true})
  isAdmin!: boolean;

  note: string = '';

  @VWatchImmediate('component.note')
  onCNoteChanged(val: string) {
    this.note = val;
  }

  onChange() {
    this.$emit('ecs-property-change', 'note', 'note', this.note, this.component.multiId);
  }
}
</script>

<style>

.modal-content-dark {
  background-color: #545b62 !important;
}

.hprior.ecs-note_textarea {
  color: white !important;
  background-color: transparent !important;
  outline: none;
  border-radius: 0;
  border-color: transparent;
}

.hprior.ecs-note_textarea::placeholder {
  color: #eeeeee;
}

</style>