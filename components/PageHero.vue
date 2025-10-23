<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="container mx-auto mb-10">
    <!-- <div class="grid grid-cols-1 sm:grid-cols-2 items-center"> -->
    <div class="px-6">
      <h1 class="my-5 text-4xl text-black font-semibold leading-tight slide-enter-50 md:text-5xl dark:text-zinc-300">
        {{ title }}
      </h1>
      <p class="slide-enter whitespace-pre-line italic dark:text-zinc-300">
        {{ description }}
      </p>
    </div>
    <!-- </div> -->
    <!-- <div class="px-6 justify-self-center">
        //TODO: Picture or something to show here.
      </div> -->
  </div>
</template>
