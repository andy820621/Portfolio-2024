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
      class="block py-2 px-3 w-full bg-[#F1F2F4] dark:bg-slate-900 dark:placeholder-zinc-500 text-zinc-300 rounded-md border-gray-300 dark:border-gray-800 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
    >
  </div>
</template>
