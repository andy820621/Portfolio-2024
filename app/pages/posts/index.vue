<script setup lang="ts">
import { createPersonReference } from '~~/data'

const { t, localePath, formattedData } = await useContentDatas('posts')

prerenderRoutes(
  formattedData.value
    .map(post => post.path)
    .filter((path): path is string => Boolean(path)),
)

const { searchText, selectedTags, filteredData, allTags, clearFilters }
  = useContentListsFilter(formattedData)

const elementPerPage = ref(5)
const { pageNumber, totalPage, paginatedData, onPreviousPageClick, onNextPageClick }
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

// 設置頁面元數據 - 使用 computed 的值
usePageSeo({
  title: t('blogsPage.seoTitle'),
  description: t('blogsPage.seoDescription'),
  keywords: pageKeywords.value,
  noIndexFollow: () => isPaginatedPage.value,
})

const { baseUrl, route } = useUrl()
const nowPageId = buildSchemaPageNodeId(baseUrl.value, route.path, 'webpage')
const websiteId = buildSchemaNodeId(baseUrl.value, 'website')
const itemListId = buildSchemaPageNodeId(baseUrl.value, route.path, 'itemlist')

const itemListElement = formattedData.value.map((post, index) => {
  const modifiedDate = post.updatedAt ?? post.date

  return {
    '@type': 'ListItem',
    'position': index + 1,
    'item': {
      '@type': 'BlogPosting',
      'headline': post.title,
      'url': buildCanonicalSiteUrl(baseUrl.value, post.path),
      ...post.date ? { datePublished: new Date(post.date).toISOString() } : {},
      ...modifiedDate ? { dateModified: new Date(modifiedDate).toISOString() } : {},
      'image': {
        '@type': 'ImageObject',
        'url': resolveStaticOgImageUrl(baseUrl.value, post.ogImage, post.cover ?? post.image),
      },
      'author': createPersonReference({
        baseUrl: baseUrl.value,
        includeName: true,
      }),
    },
  }
}) || []

useSchemaOrg([
  defineWebPage({
    '@id': nowPageId,
    '@type': 'CollectionPage',
    'name': t('blogsPage.title'),
    'description': t('blogsPage.seoDescription'),
    'url': buildCanonicalSiteUrl(baseUrl.value, route.path),
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
    'numberOfItems': formattedData.value.length || 0,
    itemListElement,
  }),
])
</script>

<template>
  <div>
    <RandomBackground :sources="['Silk', 'FlowDots']" />

    <div class="container mx-auto max-w-5xl text-zinc-600">
      <PageHero
        :title="$t('blogsPage.title')"
        :description="$t('blogsPage.description')"
      />

      <FiltersBar
        v-model:search-text="searchText"
        v-model:selected-tags="selectedTags"
        :all-tags="allTags"
        @clear="clearFilters"
      />

      <!-- 文章列表 -->
      <div v-if="paginatedData && paginatedData.length" v-auto-animate class="my-5 space-y-5 sm:px-4">
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
        </template>
      </div>

      <NoResults
        v-else
        :clear-filters="clearFilters"
        :description="$t('blogsPage.noResultDescription')"
      />

      <div v-if="paginatedData && paginatedData.length" class="flex items-center justify-center space-x-6">
        <button type="button" title="Previous page" aria-label="Previous page" :disabled="pageNumber <= 1" @click="onPreviousPageClick">
          <Icon is="span" name="mdi:code-less-than" size="30" class="min-h-[30px] min-w-[30px] base-btn-disabled" :class="{ 'base-btn': pageNumber > 1 }" />
        </button>
        <p>{{ pageNumber }} / {{ totalPage }}</p>
        <button type="button" title="Next page" aria-label="Next page" :disabled="pageNumber >= totalPage" @click="onNextPageClick">
          <Icon is="span" name="mdi:code-greater-than" size="30" class="min-h-[30px] min-w-[30px] base-btn-disabled" :class="{ 'base-btn': pageNumber < totalPage }" />
        </button>
      </div>
    </div>
  </div>
</template>
