<template>
  <div class="d-flex flex-column">
    <ul class="list-group list-group-flush mb-4">
        <li class="list-group-item" v-for="x in entities" :class="x.class">
            {{ x.name ?? x.id }}
        </li>
    </ul>

    <button class="btn btn-primary btn-xl" @click="startBattle">{{ battleStarted ? 'Change partecipants' : 'Start battle' }}</button>
    <button v-if="battleStarted" class="btn btn-secondary btn-xl" @click="$emit('back')">Go back</button>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import { SELECTION_TYPE } from "../../../ecs/systems/back/SelectionSystem";
import { stupidRef, useEvent, useResourceReactive, useWorld } from "../../vue";
import { NAME_TYPE } from "../../../ecs/component";
import { BATTLE_TYPE, STATS_TYPE } from "../../../ecs/systems/BattleSystem";

const props = defineProps<{
  battleStarted: boolean
}>();
const emits = defineEmits<{
  (event: 'back'): void
}>();

const { battleStarted } = toRefs(props);
const world = useWorld();
const sys = world.requireSystem(SELECTION_TYPE);

const selectedEntities = stupidRef(sys.selectedEntities);

useEvent(world, 'selection_update', () => {
  selectedEntities.value = sys.selectedEntities;
});

const entities = computed(() => {
  const isBattle = battleStarted.value;
  return [...selectedEntities.value]
    .filter(x => world.getComponent(x, STATS_TYPE) !== undefined)
    .map(x => {
      // Avoid lookup if there is no battle
      const added = !isBattle || world.getComponent(x, BATTLE_TYPE) === undefined;
      return {
        id: x,
        name: world.getComponent(x, NAME_TYPE)?.name,
        class: isBattle ? (added ? 'list-group-item-success' : 'list-group-item-danger') : '',
      }
    });
});

const battleRes = useResourceReactive(world, BATTLE_TYPE, {
  turnOf: undefined,
});

const startBattle = () => {
  world.events.emit('battle_begin');
  emits('back');
};
</script>
