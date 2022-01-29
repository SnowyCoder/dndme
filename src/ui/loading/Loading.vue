<template>
  <div>
    <div class="sloading-container">
      <h1 class="sloading-title">DRAW&DICE</h1>
      <h2>{{ message }}</h2>
      <h5>Loading</h5>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

const LOADING_PHRASES = [
  "Persuading dragons to cooperate...",
  "A Dwarf, an Elf and a Dragonbord enter a tavern... \"We're looking for a quest\"",
  "An ancient legend tells that if you insult a dragon to exhaustion... they'll eat you anyways",
  "Recharging spell slots...",
  "Roll a Charisma saving throw...",
  "Long rest in progress...",
  "Fitting out the goblin army...",
  "The last boss you killed met a 20th level chieric... The rest is up to you! ;)",
  "This map only costs 25gp!",
  "Sorry, you'd better create a new character sheet",
];

function randomMex() {
  const i = Math.floor(Math.random() * LOADING_PHRASES.length);
  return LOADING_PHRASES[i];
}

export default defineComponent({
  data() {
    return {
      message: randomMex(),
    }
  },
});

</script>

<style>
  .sloading-container {
    color: white;
    height: 100vh;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
  .sloading-title {
    font-size: 5em;
  }
</style>
