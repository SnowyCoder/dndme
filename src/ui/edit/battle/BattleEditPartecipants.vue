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

<script lang="ts">
import { computed, defineComponent, inject, ShallowRef, toRefs } from "vue";
import { World } from "../../../ecs/world";
import { SelectionSystem, SELECTION_TYPE } from "../../../ecs/systems/back/selectionSystem";
import { stupidRef, useEvent, useResourceReactive, isNull } from "../../vue";
import { NameComponent, NAME_TYPE } from "../../../ecs/component";
import { BattleComponent, BATTLE_TYPE, STATS_TYPE } from "../../../ecs/systems/battleSystem";

import Battle from "./Battle.vue";

export default defineComponent({
  components: {Battle},
  emits: ['back'],
  props: {
    battleStarted: { type: Boolean, required: true },
  },
  setup(props, context) {
    const { battleStarted } = toRefs(props);
    const world = inject<ShallowRef<World>>('world')!.value;
    const sys = world.systems.get(SELECTION_TYPE) as SelectionSystem;

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
          const added = !isBattle || world.getComponent<BattleComponent>(x, BATTLE_TYPE) === undefined;
          return {
            id: x,
            name: world.getComponent<NameComponent>(x, NAME_TYPE)?.name,
            class: isBattle ? (added ? 'list-group-item-success' : 'list-group-item-danger') : '',
          }
        });
    });

    const battleRes = useResourceReactive(world, BATTLE_TYPE, {
      turnOf: undefined,
    });

    const startBattle = () => {
      world.events.emit('battle_begin');
      context.emit('back');
    };

    return {
      entities, battleRes, isNull, startBattle
    }
  },
});
</script>
