<template>
  <div class="px-3 d-flex flex-column">
    <BattleEditPartecipants v-if="showPartecipants" :battleStarted="!(battleRes as any)[isNull]" @back="partecipantsOpen = false"/>
    <Battle v-else :battle-res="(battleRes as any)" @partecipants="partecipantsOpen = true"/>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useResourceReactive, isNull, useWorld, ResourceUpdateHistory } from "../../vue";
import { BATTLE_TYPE } from "../../../ecs/systems/BattleSystem";

import Battle from "./Battle.vue";
import BattleEditPartecipants from "./BattleEditPartecipants.vue";

const world = useWorld();

const battleRes = useResourceReactive(world, BATTLE_TYPE, {
  turnOf: undefined,
}, ResourceUpdateHistory.READONLY);

const partecipantsOpen = ref(false);
const showPartecipants = computed(() => battleRes[isNull] || partecipantsOpen.value);
</script>
