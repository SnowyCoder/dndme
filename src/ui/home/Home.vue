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
      <button class="btn btn-lg btn-info btn-entry" v-on:click="onEditMap">Edit Map</button>
    </div>

    <Modal v-model="showModal" hide-footer title="Gimme the map" center-vertical>
      <MapInput
          v-model="file"
          :state="Boolean(file)">
      </MapInput>
    </Modal>

    <footer-component></footer-component>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import SafeEventEmitter from "../../util/safeEventEmitter";
import FooterComponent from "../Footer.vue";
import MapInput from "./MapInput.vue";
import Modal from "../util/Modal.vue";

export default defineComponent({
  components: { MapInput, FooterComponent, Modal },
  props: {
    uiEvents: { type: Object as PropType<SafeEventEmitter>, required: true },
  },
  setup() {
  },
  data() {
    return {
      file: undefined as File | undefined,
      pendingOp: "",
      showModal: false,
    };
  },
  methods: {
    onCreateMap() {
      this.uiEvents.emit("create_map");
    },

    onEditMap() {
      this.pendingOp = 'edit';
      this.showModal = true;
      this.uiEvents.emit("edit_map");
    },

    mapLoadCancel() {
      this.showModal = false;
    },
  },
  watch: {
    file(val: File) {
      if (val === undefined) return;

      console.log("File dropped, loading: " + this.pendingOp);
      this.uiEvents.emit(this.pendingOp, this.file);
      this.file = undefined;
      this.mapLoadCancel();
    },
  }
});
</script>

<style>
.s-home-container {
  color: white;
}

.s-home-text {
  color: white;
}

.btn-entry {
  margin-bottom: 10px;
}

</style>
