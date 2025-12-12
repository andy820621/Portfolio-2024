<script setup lang="ts">
const searchTest = defineModel<string>('searchTest', { default: '' })
</script>

<template>
  <div>
    <label class="sr-only" for="content-search">
      {{ $t('filtersBar.Search') }}
    </label>

    <div class="flex items-center gap-2 border border-base/20 rounded-xl bg-base px-4 py-2.5 text-sm text-base/80">
      <Icon name="mdi:magnify" size="18" class="text-base/40" />
      <input
        id="content-search"
        v-model="searchTest"
        :placeholder="$t('filtersBar.Search')"
        aria-label="Search"
        type="text"
        class="w-full bg-transparent text-sm text-base outline-none placeholder:text-base/40"
      >
    </div>
  </div>
</template>
