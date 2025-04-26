<script setup lang="ts">
const { description = 'We couldn\'t find any posts matching your search.' } = defineProps<{
  clearFilters: () => void
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center px-4 py-12 lg:px-8 sm:px-6">
    <div class="text-center">
      <Icon name="emojione:magnifying-glass-tilted-left" class="mx-auto h-24 w-24 text-gray-400" />
      <h3 class="mt-2 text-2xl text-gray-900 font-semibold dark:text-gray-100">
        {{ $t('no results found') }}
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ description }}
      </p>

      <div class="mt-6">
        <button
          type="button"
          title="Clear filters"
          aria-label="Clear filters"
          class="inline-flex items-center border border-transparent rounded-md bg-primary hover:bg-primary-hover px-4 py-2 text-sm text-white font-medium shadow-sm base-focus"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>
    </div>
  </div>
</template>
