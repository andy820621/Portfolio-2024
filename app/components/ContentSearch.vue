<script setup lang="ts">
const searchTest = defineModel<string>('searchTest', { default: '' })
</script>

<template>
  <div class="px-6">
    <input
      v-model="searchTest"
      placeholder="Search"
      aria-label="Search"
      type="text"
      class="block w-full border-gray-300 rounded-md bg-[#F1F2F4] px-3 py-2 text-zinc-300 shadow-sm dark:border-gray-800 focus:border-indigo-300 dark:bg-slate-900 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:placeholder-zinc-500"
    >
  </div>
</template>
