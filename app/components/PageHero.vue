<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="container mx-auto mb-6 sm:mb-10">
    <!-- <div class="grid grid-cols-1 sm:grid-cols-2 items-center"> -->
    <div class="px-6">
      <h1 class="my-5 text-center text-4xl text-black font-semibold leading-tight slide-enter-50 sm:text-left md:text-5xl dark:text-zinc-300">
        {{ title }}
      </h1>
      <p class="slide-enter hidden whitespace-pre-line italic sm:block dark:text-zinc-300">
        {{ description }}
      </p>
    </div>
    <!-- </div> -->
    <!-- <div class="px-6 justify-self-center">
        //TODO: Picture or something to show here.
      </div> -->
  </div>
</template>

<style scoped>
.container {
  max-width: 100%;
}
</style>
