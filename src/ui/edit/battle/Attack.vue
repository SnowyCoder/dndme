<template>
  <div class="px-3 d-flex flex-column">
    <BattleEditPartecipants v-if="showPartecipants" :battleStarted="!(battleRes as any)[isNull]" @back="partecipantsOpen = false"/>
    <Battle v-else :battle-res="(battleRes as any)" @partecipants="partecipantsOpen = true"/>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, ref, ShallowRef } from "vue";
import { World } from "../../../ecs/world";
import { useResourceReactive, isNull } from "../../vue";
import { BATTLE_TYPE } from "../../../ecs/systems/battleSystem";

import Battle from "./Battle.vue";
import BattleEditPartecipants from "./BattleEditPartecipants.vue";

export default defineComponent({
  components: { Battle, BattleEditPartecipants },
  setup() {
    const world = inject<ShallowRef<World>>('world')!.value;

    const battleRes = useResourceReactive(world, BATTLE_TYPE, {
      turnOf: undefined,
    });

    const partecipantsOpen = ref(false);
    const showPartecipants = computed(() => battleRes[isNull] || partecipantsOpen.value);

    return {
      battleRes, isNull, partecipantsOpen, showPartecipants
    }
  },
});
</script>
