<script setup lang="ts">
const searchTest = defineModel<string>('searchTest', { default: '' })
</script>

<template>
  <div>
    <label class="sr-only" for="content-search">
      {{ $t('filtersBar.Search') }}
    </label>

    <div class="flex items-center gap-2 border border-zinc-200 rounded-xl bg-zinc-50 px-4 py-2.5 text-sm text-zinc-600 dark:border-slate-700 dark:bg-slate-800 dark:text-zinc-300">
      <Icon name="mdi:magnify" size="18" class="text-zinc-400" />
      <input
        id="content-search"
        v-model="searchTest"
        :placeholder="$t('filtersBar.Search')"
        aria-label="Search"
        type="text"
        class="w-full bg-transparent text-sm text-zinc-700 outline-none dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
      >
    </div>
  </div>
</template>
