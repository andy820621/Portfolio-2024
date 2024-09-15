<script setup lang="ts">
defineProps<{ clearFilters: () => void }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <Icon name="emojione:magnifying-glass-tilted-left" class="mx-auto h-24 w-24 text-gray-400" />
      <h3 class="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
        No results found
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        We couldn't find any posts matching your search.
      </p>

      <div class="mt-6">
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--clr-primary-green)] hover:bg-[var(--clr-hover-green)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--clr-primary-green)]"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>
    </div>
  </div>
</template>
