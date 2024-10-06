<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'

const { t } = useI18n()

definePageMeta({
  documentDriven: {
    page: false, // Keep page fetching enabled
    surround: false, // Disable surround fetching
  },
})

onMounted(() => {
  useHead({
    title: 'demos',
  })
})

useSeoMeta({
  ogTitle: 'Demos - BarZ Hsieh',
  description: t('demosPage.description'),
  ogDescription: t('demosPage.description'),
})

const { locale } = useI18n()

const { data: demoItems } = await useAsyncData(`demos-data-${locale.value}`, async () => {
  const docs = await queryContent('demos-data').find()

  return docs.map((doc) => {
    const fullFileName = doc._file!.split('/').pop() || ''
    const parts = fullFileName.split('.')
    const baseName = parts.length > 2 ? parts[1] : parts[0]
    return {
      baseName,
      content: doc,
      title: doc.title || baseName,
      tags: doc.tags || [],
      thumbnailType: doc.thumbnailType || 'img',
    }
  })
})

const searchText = ref('')
const selectedTags = ref<string[]>([])

const allTags = computed(() => {
  if (!demoItems.value)
    return []
  const tagSet = new Set<string>()
  demoItems.value.forEach((item) => {
    if (item.content.tags) {
      item.content.tags.forEach((tag: string) => tagSet.add(tag))
    }
  })
  return Array.from(tagSet)
})

const filteredDemoItems = computed(() => {
  if (!demoItems.value)
    return []
  return demoItems.value.filter((item) => {
    const lowerTitle = item.title.toLocaleLowerCase()
    const titleMatch = lowerTitle.includes(searchText.value.toLocaleLowerCase())
    const tagMatch = selectedTags.value.length === 0
      || selectedTags.value.every(tag => item.tags.includes(tag))
    return titleMatch && tagMatch
  })
})

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
  const items = filteredDemoItems.value
  if (!items)
    return []

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
        :title="$t('demosPage.title')"
        :description="$t('demosPage.description')"
      />

      <TagsFilter
        v-model:selected-tags="selectedTags"
        :all-tags="allTags"
      />

      <ContentSearch v-model:search-test="searchText" />
    </div>

    <ClientOnly>
      <div
        v-if="filteredDemoItems && parts && filteredDemoItems.length"
        grid="~ cols-1 sm:cols-2 lg:cols-3 2xl:cols-4 gap-4"
        class="container max-w-10xl mx-auto mt-10 text-zinc-600"
      >
        <div v-for="(items, idx) in parts" :key="idx" flex="~ col gap-4">
          <div v-for="item in items" :key="item.baseName">
            <DemoItem
              :base-name="item.baseName"
              :content="item.content"
              :thumbnail-type="item.thumbnailType"
              class="slide-enter"
              :style="{
                '--enter-stage': idx + 1,
              }"
            />
          </div>
        </div>
      </div>

      <NoResults
        v-else
        :clear-filters="clearFilters"
        :description="$t('demosPage.noResultDescription')"
      />

      <!-- <template #fallback>
        <div class="space-y-5 my-5 px-4">
          <BlogLoader />
          <BlogLoader />
        </div>
      </template> -->
    </ClientOnly>
  </div>
</template>
