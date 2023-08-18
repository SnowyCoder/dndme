<template>
  <div>
    <div class="sloading-container">
      <h1 class="sloading-title">DRAW&DICE</h1>
      <h2>{{ message }}</h2>
      <h5>{{ state }}</h5>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LoadingState } from "@/phase/loadingPhase";
import { ShallowRef, computed } from "vue";

const props = defineProps<{
  status: ShallowRef<LoadingState>
}>();

const LOADING_PHRASES = [
  "Persuading dragons to cooperate...",
  "A Dwarf, an Elf and a Dragonborn enter a tavern... \"We're looking for a quest\"",
  "An ancient legend tells that if you insult a dragon to exhaustion... they'll eat you anyways",
  "Recharging spell slots...",
  "Roll a Charisma saving throw...",
  "Long rest in progress...",
  "Fitting out the goblin army...",
  "The last boss you killed met a 20th level cleric... The rest is up to you! ;)",
  "This map only costs 25gp!",
  "Sorry, you'd better create a new character sheet",
];

function randomMex() {
  const i = Math.floor(Math.random() * LOADING_PHRASES.length);
  return LOADING_PHRASES[i];
}

const message = randomMex();
const state = computed(() => {
  switch (props.status.value) {
    case 'loading': return 'Loading';
    case 'sw_register': return 'Registering SW';
    case 'sw_error': return 'Error while registering service worker';
    default: return 'ERROR: ' + props.status;
  }
});

</script>

<style lang="scss">
  .sloading-container {
    color: white;
    height: 100vh;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;

    @media (min-width: 768px) {
      width: 750px;
    }

    @media (min-width: 992px) {
      width: 970px;
    }
    @media (min-width: 1200px) {
      width: 1170px;
    }
  }

  .sloading-title {
    font-size: 5em;
  }
</style>
