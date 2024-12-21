<script setup lang="ts">
import type { GalleryImage } from '~/data/galleryData'
import { breakpointsTailwind } from '@vueuse/core'
import { galleryImages } from '~/data/galleryData'

const { t } = useI18n()

definePageMeta({
  documentDriven: {
    page: false,
    surround: false,
  },
})

onMounted(() => {
  useHead({
    title: 'gallery',
  })
})

useSeoMeta({
  ogTitle: 'Gallery - BarZ Hsieh',
  description: t('galleryPage.description'),
  ogDescription: t('galleryPage.description'),
})

const searchText = ref('')
const selectedTags = ref<string[]>([])

// 所有標籤
const allTags = computed(() => {
  const tagSet = new Set<string>()
  galleryImages.forEach((item) => {
    item.tags.forEach(tag => tagSet.add(tag))
  })
  return Array.from(tagSet)
})

// 過濾後的圖片
const debouncedFilteredItems = ref<GalleryImage[]>(galleryImages)

const updateFilteredItems = useDebounceFn(() => {
  debouncedFilteredItems.value = galleryImages.filter((item) => {
    const lowerTitle = item.title.toLocaleLowerCase()
    const titleMatch = lowerTitle.includes(searchText.value.toLocaleLowerCase())
    const tagMatch = selectedTags.value.length === 0
      || selectedTags.value.every(tag => item.tags.includes(tag))
    return titleMatch && tagMatch
  })
}, 400)

watch([searchText, selectedTags], updateFilteredItems, { immediate: true })

const breakpoints = useBreakpoints(breakpointsTailwind)

// 根據斷點計算列數
const cols = computed(() => {
  if (breakpoints['2xl'].value)
    return 4
  if (breakpoints.xl.value || breakpoints.lg.value)
    return 3
  if (breakpoints.md.value || breakpoints.sm.value)
    return 2
  if (breakpoints.smaller('sm'))
    return 1
  return 1
})

const parts = computed(() => {
  const items = debouncedFilteredItems.value
  return Array.from({ length: cols.value }, (_, i) =>
    items.filter((_, j) => j % cols.value === i))
})

// 清除所有過濾器
function clearFilters() {
  searchText.value = ''
  selectedTags.value = []
}
</script>

<template>
  <div>
    <div class="container max-w-5xl mx-auto mb-5 text-zinc-600">
      <PageHero
        :title="$t('galleryPage.title')"
        :description="$t('galleryPage.description')"
      />

      <TagsFilter
        v-model:selected-tags="selectedTags"
        :all-tags="allTags"
      />

      <ContentSearch v-model:search-test="searchText" />
    </div>

    <ClientOnly>
      <div
        v-if="debouncedFilteredItems.length"
        grid="~ cols-1 sm:cols-2 lg:cols-3 2xl:cols-4 gap-4"
        class="container max-w-10xl mx-auto mt-10 text-zinc-600"
      >
        <div v-for="(items, idx) in parts" :key="idx" flex="~ col gap-4">
          <div
            v-for="item in items"
            :key="item.id"
            class="slide-enter"
            :style="{ '--enter-stage': idx + 1 }"
          >
            <GalleryImageCard
              :title="item.title"
              :src="item.src"
            />
          </div>
        </div>
      </div>

      <NoResults
        v-else
        :clear-filters="clearFilters"
        :description="$t('galleryPage.noResults')"
      />
    </ClientOnly>
  </div>
</template>
