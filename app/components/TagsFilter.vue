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
  <div class="my-4 flex flex-wrap gap-2 px-6">
    <button
      v-for="tag in allTags"
      :key="tag"
      type="button"
      :title="tag"
      :aria-label="tag"
      class="rounded px-2 py-1"
      :class="[
        selectedTags?.includes(tag)
          ? '!bg-primary-green text-gray-100'
          : '!bg-primary text-gray-700 dark:text-gray-100 hover:bg-primary-hover',
      ]"
      @click="toggleTag(tag)"
    >
      {{ tag }}
    </button>
  </div>
</template>
