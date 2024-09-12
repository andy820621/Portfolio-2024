<script setup>
// useHead({
//   script: [
//     { src: 'https://platform.twitter.com/widgets.js', async: true, charset: 'utf-8' },
//   ],
// })
</script>

<template>
  <div class="gd-container font-spacegrotesk">
    <NavBar />

    <main class="px-7 py-10">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
body {
  @apply overflow-x-hidden;
}

.gd-container {
  display: grid;
  grid-template-rows: 1fr auto;
  min-height: 100vh;
}
</style>
