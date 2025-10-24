<script setup lang="ts">
import type { Collections } from '@nuxt/content'
import type { DemoContent } from '~~/types/main'
import { breakpointsTailwind } from '@vueuse/core'

const { t, locale } = useI18n()

// 定義轉換後的 Demo 項目類型
interface DemoItem {
  baseName: string
  content: DemoContent
  title: string
  tags: string[]
  thumbnailType: string
}

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
const { data: demoItems } = await useAsyncData<DemoItem[]>(`demos-${locale.value}`, async () => {
  const collection = `demos_${locale.value}` as keyof Collections

  const docsQuery = await queryCollection(collection)
    // .where('published', '<>', false)
    .all()
    .then(sortDemos)

  return docsQuery.map(transformDemoItem)
}, {
  watch: [locale],
})

// 排序 Demos 的獨立函數
// 排序 Demos 的獨立函數
function sortDemos<T extends DemoContent>(docs: T[]): T[] {
  return docs.sort((a, b) => {
    const getNumber = (item: DemoContent): number => {
      // 從 stem 屬性中提取數字
      if (typeof item.stem === 'string') {
        // 從路徑中提取檔案名稱部分
        const fileName = item.stem.split('/').pop() || ''
        // 提取檔案名稱中的數字部分
        const numStr = fileName.match(/^(\d+)\./)?.[1] ?? '0'
        return Number.parseInt(numStr, 10)
      }
      return 0
    }

    // 降序排列（數字大的在前）
    return getNumber(b) - getNumber(a)
  })
}

// 轉換 Demo 項目的獨立函數
function transformDemoItem<T extends DemoContent>(doc: T): DemoItem {
  const stemPath = doc.stem || ''
  const fileName = stemPath.split('/').pop() || ''
  const baseName = fileName.replace(/^\d+\./, '').toLowerCase()

  return {
    baseName,
    content: doc,
    title: doc.title || formatTitle(fileName),
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
    if (item.tags && item.tags.length) {
      item.tags.forEach(tag => tagSet.add(tag))
    }
  })
  return Array.from(tagSet)
})

const debouncedFilteredDemoItems = ref<DemoItem[]>(demoItems.value || [])

const updateFilteredItems = useDebounceFn(() => {
  debouncedFilteredDemoItems.value = (demoItems.value || []).filter((item) => {
    const lowerTitle = item.title.toLocaleLowerCase()
    const titleMatch = lowerTitle.includes(searchText.value.toLocaleLowerCase())
    const tagMatch = selectedTags.value.length === 0
      || (item.tags && selectedTags.value.every(tag => item.tags.includes(tag)))
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

// SEO 優化
usePageSeo({
  title: 'Demos',
  description: t('demosPage.description'),
  keywords: [
    'Demos',
    'BarZ',
    'Hsieh Yao Tsu',
    'Nuxt',
    'Vue',
    '前端',
    '作品集',
    ...allTags.value,
  ],
})

// Schema.org
const { localeProperties } = useI18n()
const { baseUrl, fullPath } = useUrl()
const websiteId = `${baseUrl.value}#website`
const nowPageId = `${fullPath.value}#webpage`
const itemListId = `${fullPath.value}#itemlist`

const itemListElement = demoItems.value?.map((item, index) => {
  // 參考 item.vue 中的邏輯，確定最佳 URL
  let bestUrl = fullPath.value

  // 按優先級檢查可用連結
  if (item.content.link) {
    bestUrl = item.content.link
  }
  else if (item.content.github) {
    bestUrl = item.content.github
  }
  else if (item.content.codepen) {
    bestUrl = item.content.codepen
  }

  return {
    '@type': 'ListItem',
    'name': item.title,
    'position': index + 1,
    'item': {
      '@type': 'SoftwareApplication',
      'name': item.title,
      'description': item.content.description || '',
      'applicationCategory': 'WebApplication',
      'url': bestUrl,
      'operatingSystem': 'Any',
      'screenshot': item.thumbnailType && item.thumbnailType === 'webp'
        ? `${trailingSlashUrlOrNot(baseUrl.value, false)}/demos/thumbnail/${item.baseName}.${item.thumbnailType}`
        : undefined,
    },
  }
})

useSchemaOrg([
  defineWebPage({
    '@id': nowPageId,
    '@type': 'CollectionPage',
    'name': t('demosPage.title'),
    'description': t('demosPage.description'),
    'url': fullPath.value,
    'inLanguage': localeProperties.value.language,
    'isPartOf': {
      '@id': websiteId,
    },
    'mainEntity': {
      '@id': itemListId,
    },
  }),

  defineItemList({
    '@id': itemListId,
    '@type': 'ItemList',
    'numberOfItems': demoItems.value?.length || 0,
    'itemListElement': itemListElement || [],
  }),
])
</script>

<template>
  <div>
    <div class="container mx-auto mb-5 max-w-5xl text-zinc-600">
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
        class="max-w-10xl container mx-auto mt-10 text-zinc-600"
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
