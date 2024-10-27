<script setup lang="ts">
import type { ParsedContent } from '@nuxt/content'
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

function formatTitle(fileName: string): string {
  // 移除文件名開頭的數字和點
  const cleanFileName = fileName.replace(/^\d+\./, '')

  // 將檔案名中的連字符或底線轉換為空格，並將每個單詞首字母大寫
  return cleanFileName
    .replace(/[-_]/g, ' ')
    .replace(/\.md$/, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const { data: demoItems } = await useAsyncData(`demos-${locale.value}`, async () => {
  const docs = await queryContent('demos')
    .locale(locale.value)
    .where({ draft: { $ne: true } })
    .find()
    .then(docs => docs.sort((a, b) => {
      const getNumber = (item: ParsedContent): number => {
        if (typeof item._file === 'string') {
          const parts = item._file.split('/')
          const fileName = parts[parts.length - 1]
          const numberPart = fileName.split('.')[0]
          return Number.parseInt(numberPart) || 0
        }
        return 0
      }

      const aNum = getNumber(a)
      const bNum = getNumber(b)
      return bNum - aNum // 降序
    }))

  return docs.map((doc) => {
    const fullFileName = doc._file!.split('/').pop() || ''
    const parts = fullFileName.split('.')
    const baseName = parts.length > 2 ? parts[1] : parts[0]

    const formattedTitle = formatTitle(fullFileName)

    return {
      baseName,
      content: doc,
      title: formattedTitle,
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
  const items = debouncedFilteredDemoItems.value
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

      <!-- <template #fallback>
        <div class="space-y-5 my-5 px-4">
          <postLoader />
          <postLoader />
        </div>
      </template> -->
    </ClientOnly>
  </div>
</template>
