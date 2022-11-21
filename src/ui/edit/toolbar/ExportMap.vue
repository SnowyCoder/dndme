<template>
<button class="btn btn-success rounded-0" title="Export map"
        @click="doExport">
    <i class="fas fa-download"/>
</button>

<!-- Teleported -->
<Modal
    backdrop="static"
    :keyboard="false"
    header-class="border-bottom-0"
    hide-footer
    :model-value="progress !== undefined" title="Exporting...">
    <template #header>
        <h5 class="modal-title">Exporting...</h5>
    </template>

    <div class="progress">
        <div class="progress-bar progress-bar-fast" role="progressbar" :style="`width: ${progress ?? 0}%;`" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
</Modal>
</template>

<script lang="ts">
import { defineComponent, inject, ShallowRef, shallowRef } from "vue";
import { World } from "../../../ecs/world";
import Modal from "../../util/Modal.vue";

export default defineComponent({
    components: { Modal },
    setup() {
        const world = inject<ShallowRef<World>>('world')!.value;

        const progress = shallowRef<number | undefined>(undefined);

        const doExport = () => {
            progress.value = 0;
            world.events.emit('export_map', (prog: number) => progress.value = prog, () => {
                progress.value = undefined;
                console.log("Done")
            });
        };

        return {
            doExport, progress,
        }
    }
});
</script>
