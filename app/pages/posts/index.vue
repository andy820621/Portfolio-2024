<script setup lang="ts">
const { t, localePath, formattedData } = await useContentDatas('posts')

const { searchText, selectedTags, filteredData, allTags, clearFilters } = useContentListsFilter(formattedData)

const elementPerPage = ref(5)
const { pageNumber, totalPage, paginatedData, onPreviousPageClick, onNextPageClick }
  = usePagination(filteredData, elementPerPage)

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
  title: 'Blog',
  description: t('blogsPage.description'),
  keywords: pageKeywords.value,
})

const { baseUrl, fullPath } = useUrl()
const nowPageId = `${fullPath.value}#webpage`
const websiteId = `${baseUrl.value}#website`
const itemListId = `${fullPath.value}#itemlist`

const itemListElement = formattedData.value.map((post, index) => ({
  '@type': 'ListItem',
  'position': index + 1,
  'item': {
    '@type': 'BlogPosting',
    'headline': post.title,
    'url': `${trailingSlashUrlOrNot(baseUrl.value, false)}${post.path}`,
    'datePublished': new Date(post.date).toISOString(),
    'image': {
      '@type': 'ImageObject',
      'url': post.ogImage,
    },
    'author': {
      '@id': `${baseUrl.value}#identity`,
    },
  },
})) || []

useSchemaOrg([
  defineWebPage({
    '@id': nowPageId,
    '@type': 'CollectionPage',
    'name': t('blogsPage.title'),
    'description': t('blogsPage.description'),
    'url': fullPath.value,
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
  <div class="container mx-auto max-w-5xl text-zinc-600">
    <PageHero
      :title="$t('blogsPage.title')"
      :description="$t('blogsPage.description')"
    />

    <TagsFilter
      v-model:selected-tags="selectedTags"
      :all-tags="allTags"
    />

    <ContentSearch v-model:search-test="searchText" />

    <!-- 文章列表 -->
    <div v-if="paginatedData && paginatedData.length" v-auto-animate class="my-5 px-4 space-y-5">
      <template v-for="post in paginatedData" :key="post.title">
        <postCard
          :path="localePath(post.path!)"
          :title="post.title"
          :date="post.date"
          :description="post.description"
          :image="post.image"
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
</template>
