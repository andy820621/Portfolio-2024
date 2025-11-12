<template>
  <div class="gd-container">
    <NavBar />

    <main class="px-7 py-3 sm:py-10">
      <slot />
    </main>

    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.gd-container {
  // @apply overflow-x-hidden;
  display: grid;
  grid-template-rows: min-content auto;
  min-height: 100dvh;
}
</style>
