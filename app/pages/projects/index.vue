<script setup lang="ts">
const { t, localePath, formattedData } = await useContentDatas('projects')

prerenderRoutes(
  formattedData.value
    .map(post => post.path)
    .filter((path): path is string => Boolean(path)),
)

const { searchText, selectedTags, filteredData, allTags, clearFilters }
  = useContentListsFilter(formattedData)

const elementPerPage = ref(5)
const { pageNumber, totalPage, paginatedData }
  = usePagination(filteredData, elementPerPage)
const isPaginatedPage = computed(() => pageNumber.value > 1)

usePaginationQuerySync({ pageNumber, totalPage })

// 重置分頁當過濾條件改變時 - 使用 watch 代替 watchEffect 避免無限循環
watch([searchText, selectedTags], () => {
  pageNumber.value = 1
})

// 計算頁面關鍵字（避免在 setup 頂層直接訪問 allTags.value）
const pageKeywords = computed(() => [
  'Blog',
  '文章',
  'BarZ',
  'BarZ Hsieh',
  'Hsieh Yao Tsu',
  'ヒカル',
  '前端',
  '技術',
  ...allTags.value,
])

// 設置 SEO
const { baseUrl, route } = useUrl()

const seoTitle = computed(() => isPaginatedPage.value
  ? t('projectsPage.seoTitlePaginated', {
      title: t('projectsPage.seoTitle'),
      page: pageNumber.value,
    })
  : t('projectsPage.seoTitle'))

const seoDescription = computed(() => isPaginatedPage.value
  ? t('projectsPage.seoDescriptionPaginated', {
      description: t('projectsPage.seoDescription'),
      page: pageNumber.value,
    })
  : t('projectsPage.seoDescription'))

const paginatedCanonicalUrl = computed(() => buildCanonicalSiteUrlWithQuery(baseUrl.value, route.path, {
  page: pageNumber.value > 1 ? pageNumber.value : undefined,
}))

usePageSeo({
  title: seoTitle,
  description: seoDescription,
  canonicalUrl: paginatedCanonicalUrl,
  keywords: pageKeywords.value,
})

const nowPageId = computed(() => `${paginatedCanonicalUrl.value}#webpage`)
const websiteId = buildSchemaNodeId(baseUrl.value, 'website')
const itemListId = computed(() => `${paginatedCanonicalUrl.value}#itemlist`)

const itemListElement = formattedData.value.map((post, index) => ({
  '@type': 'ListItem',
  'position': index + 1,
  'item': {
    '@type': 'WebApplication',
    'name': post.title,
    'headline': post.title,
    'applicationCategory': 'WebApplication',
    'operatingSystem': 'Web-based',
    'url': buildCanonicalSiteUrl(baseUrl.value, post.path),
    ...post.date ? { datePublished: new Date(post.date).toISOString() } : {},
    'image': {
      '@type': 'ImageObject',
      'url': resolveStaticOgImageUrl(baseUrl.value, post.ogImage, post.cover ?? post.image),
    },
    'author': {
      '@id': buildSchemaNodeId(baseUrl.value, 'identity'),
    },
  },
})) || []

useSchemaOrg([
  defineWebPage({
    '@id': nowPageId.value,
    '@type': 'CollectionPage',
    'name': t('projectsPage.title'),
    'description': seoDescription.value,
    'url': paginatedCanonicalUrl.value,
    'isPartOf': {
      '@id': websiteId,
    },
    'mainEntity': {
      '@id': itemListId.value,
    },
  }),

  defineItemList({
    '@id': itemListId.value,
    '@type': 'ItemList',
    'numberOfItems': formattedData.value.length || 0,
    itemListElement,
  }),
])
</script>

<template>
  <div>
    <RandomBackground :sources="['ArtPlum', 'FlowDots']" />

    <div class="container mx-auto max-w-5xl text-zinc-600">
      <PageHero
        :title="$t('projectsPage.title')"
        :description="$t('projectsPage.description')"
      />

      <FiltersBar
        v-model:search-text="searchText"
        v-model:selected-tags="selectedTags"
        :all-tags="allTags"
        @clear="clearFilters"
      />

      <!-- 專案列表 -->
      <div v-if="paginatedData && paginatedData.length" v-auto-animate class="my-5 px-4 space-y-5">
        <template v-for="post in paginatedData" :key="post.title">
          <postCard
            :path="localePath(post.path!)"
            :title="post.title"
            :date="post.updatedAt ?? post.date"
            :description="post.description"
            :image="post.cover ?? post.image"
            :alt="post.alt"
            :og-image="post.ogImage"
            :tags="post.tags"
            :published="post.published"
            :word-count="post.wordCount"
            :reading-time="post.readingTime"
            :image-class="post.imageClass"
          />
          <!-- <pre>{{ post }}</pre> -->
        </template>
      </div>

      <NoResults
        v-else
        :clear-filters="clearFilters"
        :description="$t('projectsPage.noResultDescription')"
      />

      <div v-if="paginatedData && paginatedData.length" class="flex items-center justify-center space-x-6">
        <NuxtLink
          v-if="pageNumber > 1"
          title="Previous page"
          aria-label="Previous page"
          :to="{ query: { ...route.query, page: pageNumber - 1 === 1 ? undefined : String(pageNumber - 1) } }"
        >
          <Icon is="span" name="mdi:code-less-than" size="30" class="min-h-[30px] min-w-[30px] base-btn-disabled" :class="{ 'base-btn': pageNumber > 1 }" />
        </NuxtLink>
        <span v-else title="Previous page" aria-label="Previous page" aria-disabled="true">
          <Icon is="span" name="mdi:code-less-than" size="30" class="min-h-[30px] min-w-[30px] base-btn-disabled" />
        </span>
        <p>{{ pageNumber }} / {{ totalPage }}</p>
        <NuxtLink
          v-if="pageNumber < totalPage"
          title="Next page"
          aria-label="Next page"
          :to="{ query: { ...route.query, page: String(pageNumber + 1) } }"
        >
          <Icon is="span" name="mdi:code-greater-than" size="30" class="min-h-[30px] min-w-[30px] base-btn-disabled" :class="{ 'base-btn': pageNumber < totalPage }" />
        </NuxtLink>
        <span v-else title="Next page" aria-label="Next page" aria-disabled="true">
          <Icon is="span" name="mdi:code-greater-than" size="30" class="min-h-[30px] min-w-[30px] base-btn-disabled" />
        </span>
      </div>
    </div>
  </div>
</template>
