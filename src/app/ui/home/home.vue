<template>
  <div class="phase-container text-center flex-column align-items-center justify-content-center row" style="height: 100vh; margin: 0;">
    <div class="text-white">
      <p class="title" style="font-size: 3.5em; margin: 0;">DRAW&DICE</p>
      <p class="" style="font-size: 2em;">Dnd made ez!</p>
    </div>

    <div>
      <b-button variant="warning" size="lg" class="btn-entry" v-on:click="onCreateMap">Create Map</b-button>
    </div>
    <div>
      <b-button variant="info" size="lg" class="btn-entry" v-on:click="onEditMap">Edit Map</b-button>
    </div>

    <b-modal ref="map-load-modal" hide-footer title="Gimme the map">
      <b-form-file
          v-model="file"
          :state="Boolean(file)"
          placeholder="Choose a file or drop it here..."
          drop-placeholder="Drop file here..."
          accept=".dndm"
      ></b-form-file>
    </b-modal>

    <footer-component></footer-component>
  </div>
</template>

<script lang="ts">
import FooterComponent from "../footer.vue";
import MapInput from "./mapInput.vue";


import {VComponent, Vue, PhaseVue, VWatch, VRef} from "../vue";
import EventEmitter = PIXI.utils.EventEmitter;
import {BModal} from "bootstrap-vue";

@VComponent({
  components: { MapInput, FooterComponent }
})
export default class HomeComponent extends Vue implements PhaseVue {
  @VRef('map-load-modal') readonly mapLoadModal!: BModal;

  file: any = null;
  pendingOp: string = "";
  eventEmitter!: EventEmitter;

  onCreateMap() {
    this.eventEmitter.emit("create_map");
  }

  onEditMap() {
    this.pendingOp = 'edit';
    this.mapLoadModal.show();
    this.eventEmitter.emit("edit_map");
  }

  mapLoadCancel() {
    this.mapLoadModal.hide();
  }

  @VWatch('file')
  onFileChanged(val: any) {
    if (val == null) return;

    console.log("File dropped, loading: " + this.pendingOp);
    this.eventEmitter.emit(this.pendingOp, this.file);
    this.file = null;
    this.mapLoadCancel();
  }
}
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
