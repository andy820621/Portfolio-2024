<script setup lang="ts">
import type { GalleryAlbum } from '~/utils/galleryCollection'
import { createPersonReference } from '~~/data'
import { fetchGalleryAlbums } from '~/utils/galleryCollection'

const { t, localeProperties, locale } = useI18n()
const localePath = useLocalePath()

function getGalleryAlbumPath(slug: string) {
  return encodeCanonicalPagePath(localePath(`/gallery/${slug}`))
}

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
  galleryGroupsList.value.map(group => getGalleryAlbumPath(group.slug)),
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

// 清除所有篩選器
function clearFilters() {
  searchText.value = ''
  selectedTags.value = []
}

const { baseUrl, fullPath } = useUrl()
const websiteId = `${baseUrl.value}#website`
const nowPageId = `${fullPath.value}#webpage`
const itemListId = `${fullPath.value}#itemlist`

const licensePageUrl = locale.value === 'en'
  ? 'https://creativecommons.org/licenses/by/4.0/'
  : 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hant'

const itemListElement = debouncedFilteredGroups.value.map((group, index) => ({
  '@type': 'ListItem',
  'position': index + 1,
  'item': {
    '@type': 'CreativeWork',
    'name': group.title,
    'url': buildCanonicalSiteUrl(baseUrl.value, getGalleryAlbumPath(group.slug)),
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

    <div
      v-if="debouncedFilteredGroups.length"
      class="gallery-columns max-w-10xl container mx-auto mt-10 text-zinc-600"
    >
      <div
        v-for="group in debouncedFilteredGroups"
        :key="group.albumId"
        class="gallery-item"
      >
        <a :href="getGalleryAlbumPath(group.slug)" :title="group.title" :aria-label="group.title" class="block">
          <GalleryImageCard
            :album-id="group.albumId"
            :title="group.title"
            :src="group.coverImage"
          />
        </a>
      </div>
    </div>

    <NoResults
      v-else
      :clear-filters="clearFilters"
      :description="$t('galleryPage.noResults')"
    />
  </div>
</template>

<style scoped>
.gallery-columns {
  column-count: 2;
  column-gap: 0.25rem;
}

.gallery-item {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 0.25rem;
}

@media (min-width: 640px) {
  .gallery-columns {
    column-gap: 0.5rem;
  }

  .gallery-item {
    margin-bottom: 0.5rem;
  }
}

@media (min-width: 1024px) {
  .gallery-columns {
    column-count: 3;
    column-gap: 0.55rem;
  }

  .gallery-item {
    margin-bottom: 0.55rem;
  }
}

@media (min-width: 1536px) {
  .gallery-columns {
    column-count: 4;
  }
}
</style>
