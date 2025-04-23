<script setup lang="ts">
defineProps<{
  allTags: string[]
}>()

const selectedTags = defineModel<string[]>('selectedTags', { default: [] })

function toggleTag(tag: string) {
  if (selectedTags.value) {
    const index = selectedTags.value.indexOf(tag)
    if (index > -1) {
      selectedTags.value = selectedTags.value.filter(t => t !== tag)
    }
    else {
      selectedTags.value = [...selectedTags.value, tag]
    }
  }
  else {
    selectedTags.value = [tag]
  }
}
</script>

<template>
  <div class="flex flex-wrap gap-2 px-6 my-4">
    <button
      v-for="tag in allTags"
      :key="tag"
      type="button"
      title="Filter by tag"
      aria-label="Filter by tag"
      class="px-2 py-1 rounded"
      :class="[
        selectedTags?.includes(tag)
          ? 'bg-primary-green text-gray-100'
          : 'bg-primary text-gray-700 dark:text-gray-100 hover:bg-primary-hover',
      ]"
      @click="toggleTag(tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>
