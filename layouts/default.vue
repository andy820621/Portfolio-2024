<script setup>
// useHead({
//   script: [
//     { src: 'https://platform.twitter.com/widgets.js', async: true, charset: 'utf-8' },
//   ],
// })
</script>

<template>
  <NavBar />

  <main class="px-7 py-10 of-x-hidden">
    <slot />
  </main>
</template>

<style lang="scss" scoped>

</style>
