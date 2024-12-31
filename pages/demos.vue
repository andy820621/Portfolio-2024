<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content'
import { breakpointsTailwind } from '@vueuse/core'

const { t } = useI18n()
const { locale } = useI18n()

definePageMeta({
  documentDriven: {
    page: false,
    surround: false,
  },
})

// SEO 優化
useSeoMeta({
  title: 'Demos',
  description: t('demosPage.description'),
})

const siteData = useSiteConfig()
defineOgImage({
  props: {
    title: 'Demo',
    description: t('demosPage.description'),
    siteName: siteData.url,
  },
})

// 格式化標題函數
function formatTitle(fileName: string): string {
  return fileName
    .replace(/^\d+\./, '') // 移除開頭數字
    .replace(/[-_]/g, ' ') // 替換連字符和底線
    .replace(/\.md$/, '') // 移除 .md 副檔名
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// 查詢 Demos 的邏輯
const { data: demoItems } = await useAsyncData(`demos-${locale.value}`, async () => {
  const docs = await queryContent('demos')
    .locale(locale.value)
    .where({ draft: { $ne: true } })
    .find()
    .then(sortDemos)

  return docs.map(transformDemoItem)
})

// 排序 Demos 的獨立函數
function sortDemos(docs: ParsedContent[]): ParsedContent[] {
  return docs.sort((a, b) => {
    const getNumber = (item: ParsedContent): number => {
      if (typeof item._file === 'string') {
        const fileName = item._file.split('/').pop() || ''
        const numberPart = fileName.split('.')[0]
        return Number.parseInt(numberPart) || 0
      }
      return 0
    }

    return getNumber(b) - getNumber(a) // 降序
  })
}

// 轉換 Demo 項目的獨立函數
function transformDemoItem(doc: ParsedContent) {
  const fullFileName = doc._file!.split('/').pop() || ''
  const parts = fullFileName.split('.')
  const baseName = parts.length > 2 ? parts[1] : parts[0]

  return {
    baseName,
    content: doc,
    title: formatTitle(fullFileName),
    tags: doc.tags || [],
    thumbnailType: doc.thumbnailType || 'img',
  }
}

// 篩選邏輯
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

const debouncedFilteredDemoItems = ref(demoItems.value || [])

const updateFilteredItems = useDebounceFn(() => {
  debouncedFilteredDemoItems.value = (demoItems.value || []).filter((item) => {
    const lowerTitle = item.title.toLocaleLowerCase()
    const titleMatch = lowerTitle.includes(searchText.value.toLocaleLowerCase())
    const tagMatch = selectedTags.value.length === 0
      || selectedTags.value.every(tag => item.tags.includes(tag))
    return titleMatch && tagMatch
  })
}, 400)

watch([searchText, selectedTags, demoItems], updateFilteredItems, { immediate: true })

// 響應式斷點和列數計算
const breakpoints = useBreakpoints(breakpointsTailwind)

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
  const items = debouncedFilteredDemoItems.value
  if (!items)
    return []

  return items.reduce((result, item, index) => {
    const col = index % cols.value
    if (!result[col])
      result[col] = []
    ;(result[col] as typeof items).push(item)
    return result
  }, [] as Array<typeof items>)
})

// 清除篩選器
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
        v-if="debouncedFilteredDemoItems && parts && debouncedFilteredDemoItems.length"
        grid="~ cols-1 sm:cols-2 lg:cols-3 2xl:cols-4 gap-4"
        class="container max-w-10xl mx-auto mt-10 text-zinc-600"
      >
        <div v-for="(items, idx) in parts" :key="idx" flex="~ col gap-4">
          <div v-for="item in items" :key="item.baseName">
            <DemoItem
              :base-name="item.baseName"
              :content="item.content"
              :title="item.title"
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
    </ClientOnly>
  </div>
</template>
