<template>
  <div class="d-flex flex-column">
    Thickness
    <editable-range :readonly="!isMaster" :model-value="thickness" @update:model-value="e => $emit('update:thickness', e)" :min="1" :max=50 :step="1"/>

    <div v-if="isMaster">
      <p class="mt-2 mb-1">Player Visibility Block:</p>
      <div class="btn-group" role="radiogroup" aria-label="Player Block">
        <input type="radio" id="player-block-both" class="btn-check" name="wall-settings-block-player" :value="BlockDirection.BOTH" v-model="blockPlayer">
        <label class="btn btn-secondary" for="player-block-both" aria-label="Block both">
          <wall-visibility state="eye" side="none" />
        </label>

        <input type="radio" id="player-block-ltr" class="btn-check" name="wall-settings-block-player" :value="BlockDirection.LEFT_TO_RIGHT" v-model="blockPlayer">
        <label class="btn btn-secondary" for="player-block-ltr" aria-label="Left to Right">
          <wall-visibility state="eye" side="left" />
        </label>

        <input type="radio" id="player-block-rtl" class="btn-check" name="wall-settings-block-player" :value="BlockDirection.RIGHT_TO_LEFT" v-model="blockPlayer">
        <label class="btn btn-secondary" for="player-block-rtl" aria-label="Right to Left">
          <wall-visibility state="eye" side="right"  />
        </label>

        <input type="radio" id="player-block-none" class="btn-check" name="wall-settings-block-player" :value="BlockDirection.NONE" v-model="blockPlayer">
        <label class="btn btn-secondary" for="player-block-none" aria-label="Don't block">
          <wall-visibility state="eye" side="both"  />
        </label>
      </div>

      <p class="mt-3 mb-1">Light Block:</p>
      <div class="btn-group" role="radiogroup" aria-label="Light Block">
        <input type="radio" id="light-block-both" class="btn-check" name="wall-settings-block-light" :value="BlockDirection.BOTH" v-model="blockLight">
        <label class="btn btn-secondary" for="light-block-both" aria-label="Block both">
          <wall-visibility state="sun" side="none" />
        </label>

        <input type="radio" id="light-block-ltr" class="btn-check" name="wall-settings-block-light" :value="BlockDirection.LEFT_TO_RIGHT" v-model="blockLight">
        <label class="btn btn-secondary" for="light-block-ltr" aria-label="Left to Right">
          <wall-visibility state="sun" side="left" />
        </label>

        <input type="radio" id="light-block-rtl" class="btn-check" name="wall-settings-block-light" :value="BlockDirection.RIGHT_TO_LEFT" v-model="blockLight">
        <label class="btn btn-secondary" for="light-block-rtl" aria-label="Right to Left">
          <wall-visibility state="sun" side="right" flipped />
        </label>

        <input type="radio" id="light-block-none" class="btn-check" name="wall-settings-block-light" :value="BlockDirection.NONE" v-model="blockLight">
        <label class="btn btn-secondary" for="light-block-none" aria-label="Don't block">
          <wall-visibility state="sun" side="both" flipped />
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EditableRange from "@/ui/util/EditableRange.vue";
import { BlockDirection } from "@/ecs/systems/back/VisibilitySystem";
import { computed } from "vue";
import WallVisibility from "@/ui/icons/WallVisibility.vue";

export interface Props {
  isMaster: boolean,
  thickness: number,
  blockLight: BlockDirection,
  blockPlayer: BlockDirection,
}
export type Events = {
  'update:thickness': [value: number],
  'update:blockLight': [value: BlockDirection],
  'update:blockPlayer': [value: BlockDirection],
};

const props = defineProps<Props>();
const emit = defineEmits<Events>();

const blockLight = computed({
  get: () => props.blockLight,
  set: (x: BlockDirection) => emit('update:blockLight', x),
});

const blockPlayer = computed({
  get: () => props.blockPlayer,
  set: (x: BlockDirection) => emit('update:blockPlayer', x),
});

</script>

<style scoped lang="scss">
</style>