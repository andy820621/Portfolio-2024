<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
}>(), {
  title: 'title',
})
</script>

<template>
  <div class="h-full w-full flex items-start justify-start border-[12px] border-blue-500 border-solid bg-gray-50">
    <div class="h-full flex items-start justify-start">
      <div class="h-full w-full flex flex-col justify-between">
        <h1 class="p-20 text-left text-[80px] font-black">
          {{ title }}
        </h1>
        <p class="mb-0 px-20 pb-10 text-2xl font-bold">
          mycoolsite.com
        </p>
      </div>
    </div>
  </div>
</template>
