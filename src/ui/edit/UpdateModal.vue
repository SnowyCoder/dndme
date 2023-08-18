<script setup lang="ts">
import { useWorld } from "../vue";
import { shallowRef, watch } from "vue";
import Modal from "../util/Modal.vue";
import { versionReady } from "@/swClient";

const world = useWorld();

const shouldBeShown = shallowRef(false);
watch(versionReady, _ => {
    shouldBeShown.value = true;
});

function updatePage() {
    // TODO: if master then we should save the world and reopen it in the new version.
    window.location.reload();
}
</script>


<template>
  <Modal
    backdrop="static"
    :keyboard="false"
    hide-header
    header-class="border-bottom-0"
    footer-class="border-top-0"
    v-model="shouldBeShown"
    title="Update!">

    A new version of dndme is available!
    Reload to switch to {{ versionReady }}.

    <template #footer>
      <button class="btn btn-sm btn-outline-primary" @click="updatePage()">
        Reload
      </button>
      <button class="btn btn-sm btn-outline-secondary" @click="shouldBeShown = false">
        Cancel
      </button>
    </template>
  </Modal>
</template>

<style>
</style>
