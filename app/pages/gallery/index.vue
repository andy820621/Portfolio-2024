<script setup lang="ts">
import type { GalleryAlbum } from '~/utils/galleryCollection'
import { breakpointsTailwind } from '@vueuse/core'
import { createPersonReference } from '~~/data'
import { fetchGalleryAlbums } from '~/utils/galleryCollection'

const { t, localeProperties, locale } = useI18n()

const { data: galleryGroups, error } = await useAsyncData(
  'gallery-groups',
  () => fetchGalleryAlbums(),
  { default: () => [] },
)

watchEffect(() => {
  if (error.value)
    console.error('Error fetching gallery groups:', error.value)
})

const galleryGroupsList = computed(() => galleryGroups.value ?? [])

prerenderRoutes(
  galleryGroupsList.value.map((group) => {
    return locale.value === 'en'
      ? `/gallery/${group.albumId}`
      : `/zh/gallery/${group.albumId}`
  }),
)

// 搜索文本和選中的標籤
const searchText = ref('')
const selectedTags = ref<string[]>([])

// 計算所有唯一標籤
const allTags = computed(() => {
  const tagSet = new Set<string>()
  galleryGroupsList.value.forEach((group) => {
    group.tags.forEach(tag => tagSet.add(tag))
  })
  return Array.from(tagSet)
})

const pageModifiedTime = computed(() => {
  const timestamps = galleryGroupsList.value
    .map((group) => {
      if (!group.updatedAt)
        return undefined

      const date = group.updatedAt instanceof Date
        ? group.updatedAt
        : new Date(group.updatedAt)

      return Number.isNaN(date.getTime()) ? undefined : date.getTime()
    })
    .filter((timestamp): timestamp is number => typeof timestamp === 'number')

  if (!timestamps.length)
    return undefined

  return new Date(Math.max(...timestamps))
})

// 設置 SEO
usePageSeo({
  title: t('galleryPage.seoTitle'),
  description: t('galleryPage.seoDescription'),
  modifiedTime: pageModifiedTime.value,
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
const debouncedFilteredGroups = shallowRef<GalleryAlbum[]>(galleryGroupsList.value)

const updateFilteredGroups = useDebounceFn(() => {
  debouncedFilteredGroups.value = galleryGroupsList.value.filter((group) => {
    const lowerTitle = group.title.toLocaleLowerCase()
    const titleMatch = lowerTitle.includes(searchText.value.toLocaleLowerCase())

    // 標籤篩選
    const tagMatch = selectedTags.value.length === 0
      || selectedTags.value.every(tag => group.tags.includes(tag))

    return titleMatch && tagMatch
  })
}, 400)

// 監聽搜索文本和選中標籤的變化
watch([searchText, selectedTags, galleryGroupsList], updateFilteredGroups, { immediate: true })

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
function getTransitionDelay(groups: GalleryAlbum[], group: GalleryAlbum) {
  return `${groups.indexOf(group) * 100}ms`
}

// 檢查是否可見的方法
function isGroupVisible(group: GalleryAlbum) {
  return visibleGroups.value.includes(group.albumId)
}

let stopIntersectionObserver: (() => void) | undefined

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

  stopIntersectionObserver = stop
})

onUnmounted(() => {
  stopIntersectionObserver?.()
})

const { baseUrl, fullPath } = useUrl()
const websiteId = `${baseUrl.value}#website`
const nowPageId = `${fullPath.value}#webpage`
const itemListId = `${fullPath.value}#itemlist`
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
    'url': `${fullPath.value}${group.albumId}`,
    'thumbnail': group.coverImage ? `${trailingSlashUrlOrNot(baseUrl.value, false) + group.coverImage}` : undefined,
    'description': group.description || t('galleryPage.title'),
    'keywords': group.tags || undefined,
    // 授權資訊
    'license': licensePageUrl,
    'acquireLicensePage': `${trailingSlashUrlOrNot(baseUrl.value, false)}${localePath('license')}`,
    'creditText': 'BarZ Hsieh',
    'creator': createPersonReference({ baseUrl: baseUrl.value }),
    'copyrightNotice': '2024-PRESENT © BarZ Hsieh',
  },
}))

useSchemaOrg([
  defineWebPage({
    '@id': nowPageId,
    '@type': ['WebPage', 'CollectionPage'],
    'name': t('galleryPage.title'),
    'description': t('galleryPage.seoDescription'),
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
    <RandomBackground :sources="['Silk', 'Universe']" />

    <div class="container mx-auto mb-5 max-w-5xl text-zinc-600">
      <PageHero
        :title="$t('galleryPage.title')"
        :description="$t('galleryPage.description')"
      />

      <FiltersBar
        v-model:search-text="searchText"
        v-model:selected-tags="selectedTags"
        :all-tags="allTags"
        @clear="clearFilters"
      />
    </div>

    <ClientOnly>
      <div
        v-if="debouncedFilteredGroups.length"
        grid="~ cols-2 sm:cols-2 lg:cols-3 2xl:cols-4 gap-1 sm:gap-2 lg:gap-[.55rem]"
        class="max-w-10xl container mx-auto mt-10 text-zinc-600"
      >
        <div
          v-for="(groups, idx) in parts"
          :key="idx"
          flex="~ col gap-1 sm:gap-2 lg:gap-[.55rem]"
        >
          <div
            v-for="(group) in groups"
            :key="group.albumId"
            :ref="(el) => handleGroupRef(el as HTMLElement)"
            :data-group-id="group.albumId"
            class="gallery-item translate-y-10 transform opacity-0 transition-all duration-700 ease-out"
            :class="{
              'opacity-100 translate-y-0': isGroupVisible(group),
            }"
            :style="{
              transitionDelay: getTransitionDelay(groups, group),
            }"
          >
            <NuxtLink :to="`/gallery/${group.albumId}`" :title="group.title" :aria-label="group.title">
              <GalleryImageCard
                :album-id="group.albumId"
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
