<template>
  <div>
    <textarea placeholder="Write something here..." v-model.lazy="note" :readonly="!isMaster" class="form-control hprior ecs-note_textarea"/>
    <Modal title="Note" v-model="isFullscreen" hide-header
           dialog-class="modal-fullscreen" content-class="modal-content-dark">
      <textarea placeholder="Write something here..." v-model.lazy="note" :readonly="!isMaster"
                style="height: 100%; width: 100%; resize: none;" class="hprior ecs-note_textarea"/>
    </Modal>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, PropType, ShallowRef, toRefs } from "vue";
import { NoteComponent } from "../../ecs/component";
import { useComponentPiece } from "../vue";
import Modal from "../util/Modal.vue";

export default defineComponent({
  components: { Modal },
  props: {
    component: { type: Object as PropType<NoteComponent>, required: true },
  },
  setup(props) {
    const { component } = toRefs(props);
    const isMaster = inject<boolean>('isMaster')!;
    const isFullscreen = inject<ShallowRef<boolean>>('isFullscreen')!;
    isFullscreen.value = false;

    return {
      isMaster, isFullscreen,
      note: useComponentPiece(component, 'note', ''),
    }
  }
});
</script>

<style>

.modal-content-dark {
  background-color: var(--bs-body-color) !important;
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
