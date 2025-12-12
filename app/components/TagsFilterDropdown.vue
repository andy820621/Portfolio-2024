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
          class="focus-visible:ring-primary/50 w-full flex items-center justify-between border border-base/20 rounded-xl px-4 py-2.5 text-left text-sm font-medium shadow-sm transition-colors bg-base! text-base! focus-visible:outline-none focus:outline-none focus-visible:ring-1"
        >
          <span class="truncate">{{ selectionSummary }}</span>
          <Icon name="mdi:chevron-down" size="20" class="text-base/40 transition-transform duration-150" :class="{ 'rotate-180': open }" />
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
            class="focus-visible:ring-primary/50 absolute left-0 right-0 z-[80] mt-2 w-full overflow-hidden border border-base/24 rounded-xl bg-base shadow-2xl focus-visible:outline-none focus:outline-none focus-visible:ring-1"
          >
            <div class="sticky top-0 border-b border-base/10 bg-base/95 px-3 py-2 backdrop-blur-sm">
              <label class="sr-only" for="tags-filter-search">
                {{ $t('filtersBar.Search Tags') }}
              </label>
              <div class="flex items-center gap-2 border border-base/20 rounded-xl bg-base px-3 py-2 text-sm text-base/80">
                <Icon name="mdi:magnify" size="18" class="text-base/40" />
                <input
                  id="tags-filter-search"
                  v-model="query"
                  type="text"
                  class="w-full bg-transparent text-sm text-base outline-none placeholder:text-base/40"
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
                      active ? 'bg-primary/10 text-primary' : 'text-base',
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
              <p v-else class="px-4 py-6 text-center text-sm text-base/40">
                沒有符合的標籤
              </p>
            </div>
          </HeadlessListboxOptions>
        </transition>
      </div>
    </HeadlessListbox>
  </div>
</template>
