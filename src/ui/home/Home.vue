<template>
  <div class="phase-container text-center flex-column align-items-center justify-content-center row" style="height: 100vh; margin: 0;">
    <div class="text-white">
      <p class="title" style="font-size: 3.5em; margin: 0;">DRAW&DICE</p>
      <p class="" style="font-size: 2em;">Dnd made ez!</p>
    </div>

    <div>
      <button class="btn btn-lg btn-warning btn-entry" v-on:click="onCreateMap">Create Map</button>
    </div>
    <div>
      <button class="btn btn-lg btn-info btn-entry" v-on:click="showFileModal= true">Edit Map</button>
    </div>

    <Modal v-model="showFileModal" hide-footer title="Gimme the map" center-vertical>
      <MapInput
          v-model="file"
          :state="Boolean(file)">
      </MapInput>
    </Modal>

    <Modal
        backdrop="static"
        :keyboard="false"
        header-class="border-bottom-0"
        hide-footer
        :model-value="loadingProgress !== undefined" title="Loading...">
      <template #header>
        <h5 class="modal-title">Loading...</h5>
      </template>

      <div class="progress">
        <div class="progress-bar progress-bar-fast" role="progressbar" :style="`width: ${loadingProgress ?? 0}%;`" :aria-valuenow="loadingProgress" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    </Modal>

    <footer-component></footer-component>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, shallowRef, watch } from "vue";
import SafeEventEmitter from "../../util/safeEventEmitter";
import FooterComponent from "../Footer.vue";
import MapInput from "./MapInput.vue";
import Modal from "../util/Modal.vue";

export default defineComponent({
  components: { MapInput, FooterComponent, Modal },
  props: {
    uiEvents: { type: Object as PropType<SafeEventEmitter>, required: true },
  },
  setup(props) {
    const { uiEvents } = props;

    const file = shallowRef<File | undefined>(undefined);
    const showFileModal = shallowRef(false);
    const loadingProgress = shallowRef<number | undefined>(undefined);
    const isMapLoading = shallowRef(false);

    watch(file, val => {
      if (val === undefined || loadingProgress.value !== undefined || isMapLoading.value) return;
      isMapLoading.value = true;
      console.log("File dropped, loading...");
      loadingProgress.value = 0;
      uiEvents.emit('edit', val, (x: number) => {
        loadingProgress.value = x;
      }, (err: string) => {
        loadingProgress.value = undefined;
        alert(err);
        file.value = undefined;
        isMapLoading.value = false;
      });
      file.value = undefined;
      showFileModal.value = false;
    });

    const onCreateMap = () => {
      uiEvents.emit("create_map");
    };

    return {
      file, showFileModal, loadingProgress,
      onCreateMap,
    }
  },
});
</script>

<style>
.btn-entry {
  margin-bottom: 10px;
}

</style>
