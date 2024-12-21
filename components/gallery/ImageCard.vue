<script setup lang="ts">
defineProps<{
  title: string
  src: string
}>()
</script>

<template>
  <article
    block of-hidden bg-base relative
    border-rounded-lg
    transition="all duration-500"
  >
    <div class="imageBox relative" role="img" :aria-label="title">
      <NuxtImg
        :src="src"
        :alt="title"
        w-full border="b base"
        placeholder
      />

      <div
        class="overlay absolute inset-0 z-2 flex flex-col justify-center items-center p-4 rounded-lg"
        aria-hidden="true"
      >
        <h2 class="text-2xl font-semibold text-black dark:text-zinc-300">
          {{ title }}
        </h2>
      </div>
    </div>
  </article>
</template>

<style scoped>
.imageBox {
  @apply overflow-hidden;
}

.overlay {
  @apply opacity-0 transition-all duration-500 backdrop-filter backdrop-blur-0;
}

.overlay::before {
  content: '';
  @apply absolute inset-0 bg-black bg-opacity-60 opacity-0 transition-all duration-500 rounded-inherit;
}

.imageBox:hover .overlay {
  @apply opacity-100 backdrop-blur-sm;
}

.imageBox:hover .overlay::before {
  @apply opacity-100;
}

.overlay h2 {
  @apply transform translate-y-5 opacity-0 transition-all duration-500;
}

.imageBox:hover .overlay h2 {
  @apply translate-y-0 opacity-100;
}
</style>
