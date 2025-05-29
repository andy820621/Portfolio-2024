<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import { galleryGroups } from '~/data/galleryData'

const { t, localeProperties, locale } = useI18n()

// 搜索文本和選中的標籤
const searchText = ref('')
const selectedTags = ref<string[]>([])

// 計算所有唯一標籤
const allTags = computed(() => {
  const tagSet = new Set<string>()
  galleryGroups.forEach((group) => {
    group.tags.forEach(tag => tagSet.add(tag))
  })
  return Array.from(tagSet)
})

// 設置 SEO
usePageSeo({
  title: 'Gallery',
  description: t('galleryPage.description'),
  keywords: [
    'Gallery',
    '相簿',
    'BarZ',
    'BarZ Hsieh',
    'Hsieh Yao Tsu',
    'ヒカル',
    '攝影',
    '相片牆',
    ...allTags.value,
  ],
})

// 防抖過濾後的圖片組
const debouncedFilteredGroups = ref(galleryGroups)

const updateFilteredGroups = useDebounceFn(() => {
  debouncedFilteredGroups.value = galleryGroups.filter((group) => {
    const lowerTitle = group.title.toLocaleLowerCase()
    const titleMatch = lowerTitle.includes(searchText.value.toLocaleLowerCase())

    // 標籤篩選
    const tagMatch = selectedTags.value.length === 0
      || selectedTags.value.every(tag => group.tags.includes(tag))

    return titleMatch && tagMatch
  })
}, 400)

// 監聽搜索文本和選中標籤的變化
watch([searchText, selectedTags], updateFilteredGroups, { immediate: true })

// 使用斷點檢測
const breakpoints = useBreakpoints(breakpointsTailwind)
// 根據斷點動態計算列數
const cols = computed(() => {
  if (breakpoints['2xl'].value)
    return 4
  if (breakpoints.xl.value || breakpoints.lg.value)
    return 3
  return 2
})

// 將圖片組按列均勻分佈
const parts = computed(() => {
  const groups = debouncedFilteredGroups.value

  return groups.reduce((result, group, index) => {
    const col = index % cols.value
    if (!result[col])
      result[col] = []
    result[col].push(group)
    return result
  }, [] as Array<typeof groups>)
})

// 清除所有篩選器
function clearFilters() {
  searchText.value = ''
  selectedTags.value = []
}

// 追蹤可見圖片組的響應式狀態
const visibleGroups = ref<string[]>([])
const groupRefs = ref<HTMLElement[]>([])

// 創建一個方法來處理 ref 邏輯
function handleGroupRef(el: HTMLElement | null) {
  if (el) {
    if (!groupRefs.value.includes(el)) {
      groupRefs.value.push(el)
    }
  }
}

// 計算轉場延遲
function getTransitionDelay(groups: any[], group: any) {
  return `${groups.indexOf(group) * 100}ms`
}

// 檢查是否可見的方法
function isGroupVisible(group: any) {
  return visibleGroups.value.includes(group.id)
}

onMounted(() => {
  const observerOptions = {
    threshold: 0.1, // 當元素 10% 可見時觸發
  }

  // 使用交叉觀察器實現延遲加載和淡入效果
  const { stop } = useIntersectionObserver(
    groupRefs,
    (entries) => {
      entries.forEach((entry) => {
        // 當元素進入可視區域
        if (entry.isIntersecting) {
          const groupId = (entry.target as HTMLElement).dataset.groupId
          // 避免重複添加
          if (groupId && !visibleGroups.value.includes(groupId)) {
            nextTick(() => {
              visibleGroups.value.push(groupId)
            })
          }
        }
      })
    },
    observerOptions,
  )

  onUnmounted(stop)
})

const { baseUrl, fullPath } = useUrl()
const websiteId = `${baseUrl.value}#website`
const nowPageId = `${fullPath.value}#webpage`
const itemListId = `${fullPath.value}#itemlist`
const personId = `${baseUrl.value}#identity`
const localePath = useLocalePath()

const licensePageUrl = locale.value === 'en'
  ? 'https://creativecommons.org/licenses/by/4.0/'
  : 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hant'

const itemListElement = debouncedFilteredGroups.value.map((group, index) => ({
  '@type': 'ListItem',
  'position': index + 1,
  'item': {
    '@type': 'CreativeWork',
    'name': group.title,
    'url': `${fullPath.value}${group.id}`,
    'thumbnail': group.coverImage ? `${trailingSlashUrlOrNot(baseUrl.value, false) + group.coverImage}` : undefined,
    'description': group.description || t('galleryPage.title'),
    'keywords': group.tags || undefined,
    // 授權資訊
    'license': licensePageUrl,
    'acquireLicensePage': `${trailingSlashUrlOrNot(baseUrl.value, false)}${localePath('license')}`,
    'creditText': 'BarZ Hsieh',
    'creator': {
      '@type': 'Person',
      '@id': personId,
      'name': 'BarZ Hsieh',
    },
    'copyrightNotice': '2024-PRESENT © BarZ Hsieh',
  },
}))

useSchemaOrg([
  defineWebPage({
    '@id': nowPageId,
    '@type': ['WebPage', 'CollectionPage'],
    'name': t('galleryPage.title'),
    'description': t('galleryPage.description'),
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
    'numberOfItems': debouncedFilteredGroups.value.length,
    'itemListElement': itemListElement,
  }),
])
</script>

<template>
  <div>
    <div class="mx-auto mb-5 max-w-5xl text-zinc-600 container">
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
        v-if="debouncedFilteredGroups.length"
        grid="~ cols-2 sm:cols-2 lg:cols-3 2xl:cols-4 gap-1 sm:gap-2 lg:gap-[.55rem]"
        class="max-w-10xl mx-auto mt-10 text-zinc-600 container"
      >
        <div
          v-for="(groups, idx) in parts"
          :key="idx"
          flex="~ col gap-1 sm:gap-2 lg:gap-[.55rem]"
        >
          <div
            v-for="(group) in groups"
            :key="group.id"
            :ref="(el) => handleGroupRef(el as HTMLElement)"
            :data-group-id="group.id"
            class="gallery-item translate-y-10 transform opacity-0 transition-all duration-700 ease-out"
            :class="{
              'opacity-100 translate-y-0': isGroupVisible(group),
            }"
            :style="{
              transitionDelay: getTransitionDelay(groups, group),
            }"
          >
            <NuxtLink :to="`/gallery/${group.id}`" :title="group.title" :aria-label="group.title">
              <GalleryImageCard
                :id="group.id"
                :title="group.title"
                :src="group.coverImage"
              />
            </NuxtLink>
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

<style scoped>
/* 圖片組動畫效果 */
.gallery-item {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.gallery-item.opacity-100.translate-y-0 {
  opacity: 1;
  transform: translateY(0);
}
</style>
