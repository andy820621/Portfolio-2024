<template>
  <div class="gd-container">
    <NavBar />

    <main class="min-h-[calc(100dvh-140px)] px-7 pb-12">
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
