<script setup lang="ts">
defineProps<{
  allTags: string[]
}>()

const emit = defineEmits<{
  (e: 'clear'): void
}>()

const searchText = defineModel<string>('searchText', { default: '' })
const selectedTags = defineModel<string[]>('selectedTags', { default: [] })

const selectedTagList = computed(() => selectedTags.value ?? [])

const hasFilters = computed(() =>
  Boolean(searchText.value?.trim().length || selectedTagList.value.length),
)

function handleClear() {
  if (!hasFilters.value)
    return

  searchText.value = ''
  selectedTags.value = []
  emit('clear')
}

function removeTag(tag: string) {
  if (!selectedTagList.value.length)
    return
  selectedTags.value = selectedTagList.value.filter(t => t !== tag)
}
</script>

<template>
  <section class="px-2 pb-2 sm:px-6 sm:pb-4">
    <div class="glass-effect relative z-30 rounded-xl px-4 py-3 shadow-sm lg:p-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-start">
        <div class="w-full md:flex-1">
          <ContentSearch v-model:search-test="searchText" />
        </div>
        <div class="w-full md:max-w-[50%] md:flex-none md:basis-[320px]">
          <TagsFilterDropdown v-model:selected-tags="selectedTags" :all-tags="allTags" />
        </div>
      </div>

      <div v-if="selectedTagList.length" class="mt-4 border-t border-base/20 pt-3">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex flex-wrap items-center gap-2">
            <Icon name="ri:price-tag-3-line" />
            <span
              v-for="tag in selectedTagList"
              :key="tag"
              class="inline-flex items-center items-center gap-1 rounded-full bg-primary py-[2.4px] pl-[10px] pr-[6px] text-sm text-base"
            >
              {{ tag }}
              <button
                type="button"
                class="flex items-center justify-center text-base/40 transition hover:text-base"
                @click="removeTag(tag)"
              >
                <Icon name="mdi:close" size="16" />
              </button>
            </span>
          </div>
          <button
            type="button"
            class="self-start border border-transparent rounded-md px-3 py-1 text-sm text-primary font-medium transition disabled:cursor-not-allowed lg:self-auto disabled:text-base/40 hover:opacity-80"
            :disabled="!hasFilters"
            @click="handleClear"
          >
            {{ $t('filtersBar.Clear All') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.glass-effect {
  --border-width: 1px;
  --border-start: rgba(47, 94, 98, 0.5);
  --border-end: rgba(47, 94, 98, 0.1);
  --background-color: hsla(168, 24%, 24%, 0.1);

  position: relative;
  background-color: var(--background-color);
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  border: none;
}

:global(.dark .glass-effect) {
  --border-start: rgba(255, 255, 255, 0.24);
  --border-end: rgba(255, 255, 255, 0.05);
  --background-color: hsla(185, 34%, 29%, 0.3);
}

.glass-effect::before {
  content: '';
  position: absolute;
  z-index: 2;
  pointer-events: none;
  inset: 0;
  border-radius: inherit;
  border: var(--border-width) solid transparent;
  background: linear-gradient(135deg, var(--border-start), var(--border-end)) border-box;
  -webkit-mask:
    linear-gradient(#fff 0 0) padding-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) padding-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
</style>
