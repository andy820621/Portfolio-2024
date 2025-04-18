<script setup lang="ts">
const { t, localePath, formattedData } = await useContentDatas('posts')

const { searchText, selectedTags, filteredData, allTags, clearFilters } = useContentListsFilter(formattedData)

const elementPerPage = ref(5)
const { pageNumber, totalPage, paginatedData, onPreviousPageClick, onNextPageClick }
  = usePagination(filteredData, elementPerPage)

// 重置分頁當過濾條件改變時
watchEffect(() => {
  if (searchText.value || selectedTags.value.length > 0) {
    pageNumber.value = 1
  }
})

// 設置頁面元數據
usePageSeo({
  title: 'Blog',
  description: t('blogsPage.description'),
})

const baseUrl = useRuntimeConfig().public.i18n.baseUrl

useSchemaOrg([
  defineWebPage({
    name: '部落格文章列表',
    description: 'BarZ Hsieh 的技術部落格',
  }),
  {
    '@type': 'ItemList',
    'itemListElement': filteredData.value.map((post, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'BlogPosting',
        'headline': post.title,
        'url': `${baseUrl}${post.path}`,
        'datePublished': post.date,
      },
    })),
  },
])
</script>

<template>
  <div class="container max-w-5xl mx-auto text-zinc-600">
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
    <ClientOnly>
      <div v-if="paginatedData && paginatedData.length" v-auto-animate class="space-y-5 my-5 px-4">
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
          />
        </template>
      </div>

      <NoResults
        v-else
        :clear-filters="clearFilters"
        :description="$t('blogsPage.noResultDescription')"
      />

      <!-- this will be rendered on server side -->
      <template #fallback>
        <div class="space-y-5 my-5 px-4">
          <postLoader />
          <postLoader />
        </div>
      </template>
    </ClientOnly>

    <div v-if="paginatedData && paginatedData.length" class="flex justify-center items-center space-x-6 ">
      <button :disabled="pageNumber <= 1" @click="onPreviousPageClick">
        <Icon name="mdi:code-less-than" size="30" class="base-btn-disabled min-w-[30px] min-h-[30px]" :class="{ 'base-btn': pageNumber > 1 }" />
      </button>
      <p>{{ pageNumber }} / {{ totalPage }}</p>
      <button :disabled="pageNumber >= totalPage" @click="onNextPageClick">
        <Icon name="mdi:code-greater-than" size="30" class="base-btn-disabled min-w-[30px] min-h-[30px]" :class="{ 'base-btn': pageNumber < totalPage }" />
      </button>
    </div>
  </div>
</template>
