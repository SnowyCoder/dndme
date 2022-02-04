<template>
  <div class="px-3 d-flex flex-column">
    <template v-if="(battleRes as any)[isNull]">
      <ul class="list-group">
        <li class="list-group-item bg-dark text-light" v-for="x in entities">
          {{ x.name ?? x.id }}
        </li>
      </ul>

      <button class="btn btn-primary btn-xl" @click="startBattle">Start Battle</button>
    </template>
    <template v-else>
      <Battle :selectedEntities="entities" :battle-res="(battleRes as any)"></Battle>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, ShallowRef } from "vue";
import { World } from "../../../ecs/world";
import { SelectionSystem, SELECTION_TYPE } from "../../../ecs/systems/back/selectionSystem";
import { stupidRef, useEvent, useResourceReactive, isNull } from "../../vue";
import { NameComponent, NAME_TYPE } from "../../../ecs/component";
import { PIN_TYPE } from "../../../ecs/systems/pinSystem";
import { BATTLE_TYPE, STATS_TYPE } from "../../../ecs/systems/battleSystem";

import Battle from "./Battle.vue";

export default defineComponent({
  components: {Battle},
  setup() {
    const world = inject<ShallowRef<World>>('world')!.value;
    const sys = world.systems.get(SELECTION_TYPE) as SelectionSystem;

    const selectedEntities = stupidRef(sys.selectedEntities);

    useEvent(world, 'selection_update', () => {
      selectedEntities.value = sys.selectedEntities;
    });

    const entities = computed(() => {
      return [...selectedEntities.value]
        .filter(x => world.getComponent(x, STATS_TYPE) !== undefined)
        .map(x => {
          return {
            id: x,
            name: world.getComponent<NameComponent>(x, NAME_TYPE)?.name,
          }
        });
    });

    const battleRes = useResourceReactive(world, BATTLE_TYPE, {
      turnOf: undefined,
    });

    const startBattle = () => {
      world.events.emit('battle_begin');
    };

    return {
      entities, battleRes, isNull, startBattle
    }
  },
});
</script>
