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
  <section class="mb-4 px-2 sm:px-6">
    <div class="relative z-30 border border-zinc-200 rounded-xl bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 lg:p-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-start">
        <div class="w-full md:flex-1">
          <ContentSearch v-model:search-test="searchText" />
        </div>
        <div class="w-full md:max-w-[50%] md:flex-none md:basis-[320px]">
          <TagsFilterDropdown v-model:selected-tags="selectedTags" :all-tags="allTags" />
        </div>
      </div>

      <div v-if="selectedTagList.length" class="mt-4 border-t border-zinc-200 pt-3 dark:border-slate-800">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex flex-wrap items-center gap-2">
            <Icon name="ri:price-tag-3-line" />
            <span
              v-for="tag in selectedTagList"
              :key="tag"
              class="inline-flex items-center items-center gap-1 rounded-full bg-primary py-[2.4px] pl-[10px] pr-[6px] text-sm text-base dark:bg-slate-800"
            >
              {{ tag }}
              <button
                type="button"
                class="flex items-center justify-center text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-200"
                @click="removeTag(tag)"
              >
                <Icon name="mdi:close" size="16" />
              </button>
            </span>
          </div>
          <button
            type="button"
            class="self-start border border-transparent rounded-md px-3 py-1 text-sm text-primary font-medium transition disabled:cursor-not-allowed lg:self-auto disabled:text-zinc-400 hover:opacity-80 dark:disabled:text-zinc-600"
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
