<script setup lang="ts">
const props = defineProps<{
  allTags: string[]
}>()

const selectedTags = defineModel<string[]>('selectedTags', { default: [] })

const query = ref('')

const availableTags = computed(() => props.allTags ?? [])

const filteredTags = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  if (!keyword)
    return availableTags.value

  return availableTags.value.filter(tag => tag.toLowerCase().includes(keyword))
})

const selectionSummary = computed(() => {
  const values = selectedTags.value || []
  if (!values.length)
    return $t('filtersBar.Select Tags')

  return values.join(', ')
})
</script>

<template>
  <div class="w-full">
    <HeadlessListbox v-slot="{ open }" v-model="selectedTags" multiple>
      <div class="relative">
        <HeadlessListboxButton
          class="w-full flex items-center justify-between border border-zinc-200 rounded-xl bg-zinc-50 px-4 py-2.5 text-left text-sm text-zinc-700 font-medium shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-zinc-200 focus-visible:outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400/95"
        >
          <span class="truncate">{{ selectionSummary }}</span>
          <Icon name="mdi:chevron-down" size="20" class="text-zinc-400 transition-transform duration-150" :class="{ 'rotate-180': open }" />
        </HeadlessListboxButton>

        <transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <HeadlessListboxOptions
            class="absolute left-0 right-0 z-[80] mt-2 w-full overflow-hidden border border-zinc-200 rounded-xl bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 focus-visible:outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400/95"
          >
            <div class="sticky top-0 border-b border-zinc-100 bg-white/95 px-3 py-2 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
              <label class="sr-only" for="tags-filter-search">
                {{ $t('filtersBar.Search Tags') }}
              </label>
              <div class="flex items-center gap-2 border border-zinc-200 rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-slate-700 dark:bg-slate-800 dark:text-zinc-300">
                <Icon name="mdi:magnify" size="18" class="text-zinc-400" />
                <input
                  id="tags-filter-search"
                  v-model="query"
                  type="text"
                  class="w-full bg-transparent text-sm text-zinc-700 outline-none dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  :placeholder="`${$t('filtersBar.Search Tags')}...`"
                >
              </div>
            </div>

            <div class="max-h-64 overflow-y-auto py-1">
              <template v-if="filteredTags.length">
                <HeadlessListboxOption
                  v-for="tag in filteredTags"
                  :key="tag"
                  v-slot="{ active, selected }"
                  :value="tag"
                  as="template"
                >
                  <li
                    class="flex cursor-pointer items-center justify-between px-4 py-2 text-sm"
                    :class="[
                      active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-50' : 'text-zinc-700 dark:text-zinc-200',
                      selected ? 'font-semibold' : 'font-normal',
                    ]"
                  >
                    <span class="truncate">{{ tag }}</span>
                    <Icon
                      v-if="selected"
                      name="mdi:check"
                      size="20"
                      class="text-primary"
                    />
                  </li>
                </HeadlessListboxOption>
              </template>
              <p v-else class="px-4 py-6 text-center text-sm text-zinc-400">
                沒有符合的標籤
              </p>
            </div>
          </HeadlessListboxOptions>
        </transition>
      </div>
    </HeadlessListbox>
  </div>
</template>
