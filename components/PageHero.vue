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
      <h1 class="text-black dark:text-zinc-300 font-semibold leading-tight text-4xl md:text-5xl my-5 slide-enter-50">
        {{ title }}
      </h1>
      <p class="dark:text-zinc-300 italic slide-enter">
        {{ description }}
      </p>
    </div>
    <!-- </div> -->
    <!-- <div class="px-6 justify-self-center">
        //TODO: Picture or something to show here.
      </div> -->
  </div>
</template>
