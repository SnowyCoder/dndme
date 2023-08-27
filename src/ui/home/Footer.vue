<template>
  <div class="footer">
    <div class="footer_credits">
      <div class="links">
        {{ VERSION }}
        <a href="https://github.com/SnowyCoder/dndme" target="_blank" class="footer_github"></a>
      </div>
      <small style="color: lightgray">
        Developed by <a href="https://github.com/SnowyCoder" target="_blank" class="footer_profile">Rossi Lorenzo</a> /
        Drawings by <span style="color: white">Giorgia Nizzoli</span>
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">

const VERSION = __COMMIT_HASH__;
</script>

<style>
.footer_credits {
  text-align: right;
  padding: 20px;
}

.footer_github {
  display: inline-block;
  width: 32px;
  height: 32px;
  background-image: url("../../assets/GitHub-Mark-Light-32px.png");
}

.footer_github:hover {
  opacity: 0.5;
}

.footer_profile {
  color: white;
}

.footer_profile:hover {
  opacity: 0.5;
}

</style>
