<template>
  <div class="app-wrapper">
    <RouterView />
  </div>
</template>

<script setup>

</script>

<style scoped>

  .app-wrapper,
  html,
  :global(body) {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
  }
</style>