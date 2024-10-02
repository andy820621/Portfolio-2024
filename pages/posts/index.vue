<script lang="ts" setup>
import type { BlogPost } from '~/types/main'

definePageMeta({
  documentDriven: {
    page: false, // Keep page fetching enabled
    surround: false, // Disable surround fetching
  },
})

const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data: contentPosts, error } = await useAsyncData(`listPosts-${locale.value}`, async () => {
  try {
    const posts = await queryContent<BlogPost>('/posts')
      .locale(locale.value)
      .where({ draft: { $ne: true } })
      .sort({ date: -1 })
      .find()

    // 計算每篇文章的字數及時間
    return posts.map((post) => {
      const wordCount = post.body ? countWords(post.body) : 0
      return {
        ...post,
        wordCount,
        readingTime: useEstimateReadingTime(wordCount, t),
      }
    })
  }
  catch (e) {
    console.error('Error fetching posts:', e)
    return []
  }
})

watchEffect(() => {
  if (error.value) {
    console.error('Fetch error:', error.value)
    navigateTo(localePath('/404'))
  }
})

const processedPosts = computed(() => {
  if (!contentPosts.value)
    return []

  return contentPosts.value.map((post) => {
    const wordCount = post.body ? countWords(post.body) : 0
    return {
      ...post,
      wordCount,
      readingTime: useEstimateReadingTime(wordCount, t),
    }
  })
})

// 設置每頁顯示的文章數量和當前頁碼
const elementPerPage = ref(5)
const pageNumber = ref(1)
// 搜索關鍵字
const searchTest = ref('')
// 選中的標籤
const selectedTags = ref<string[]>([])

// 重置分頁當過濾條件改變時
watchEffect(() => {
  if (searchTest.value || selectedTags.value.length > 0) {
    pageNumber.value = 1
  }
})

// 格式化獲取的數據，設置默認值
const formattedData = computed(() => {
  return processedPosts.value?.map((articles) => {
    return {
      path: articles._path,
      title: articles.title || 'no-title available',
      description: articles.description || 'no-description available',
      image: articles.image || '/not-found.jpg',
      alt: articles.alt || 'no alter data available',
      ogImage: articles.ogImage || '/not-found.jpg',
      date: articles.date || 'not-date-available',
      tags: articles.tags || [],
      published: articles.published || false,
      wordCount: articles.wordCount || 0,
      readingTime: articles.readingTime || undefined,
    }
  }) || []
})

// 結合搜索和標籤過濾
const filteredData = computed(() => {
  return formattedData.value.filter((data) => {
    const lowerTitle = data.title.toLocaleLowerCase()
    const titleMatch = lowerTitle.includes(searchTest.value.toLocaleLowerCase())
    const tagMatch = selectedTags.value.length === 0
      || selectedTags.value.every(tag => data.tags.includes(tag))
    return titleMatch && tagMatch
  })
})

// 根據當前頁碼和每頁顯示數量分頁
const paginatedData = computed(() => {
  return filteredData.value.slice(
    (pageNumber.value - 1) * elementPerPage.value,
    pageNumber.value * elementPerPage.value,
  )
})

const totalPage = computed(() => {
  return Math.ceil(filteredData.value.length / elementPerPage.value)
})

// 獲取所有唯一標籤
const allTags = computed(() => {
  const tags = new Set<string>()
  formattedData.value.forEach((post) => {
    post.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
})

// 上一頁和下一頁的邏輯
function onPreviousPageClick() {
  if (pageNumber.value > 1)
    pageNumber.value -= 1
}
function onNextPageClick() {
  if (pageNumber.value < totalPage.value)
    pageNumber.value += 1
}

// 清除 input & 標籤
function clearFilters() {
  searchTest.value = ''
  selectedTags.value = []
}

// 設置頁面元數據
useHead({
  title: 'Blog',
  meta: [
    {
      name: 'description',
      content: t('blogsPage.description'),
    },
  ],
})

// Generate OG Image
const siteData = useSiteConfig()

// 生成 OG 圖片
defineOgImage({
  props: {
    title: 'Blog',
    description: t('blogsPage.description'),
    siteName: siteData.url,
  },
})

// const isLocaleChanged = ref(false)
// watch(locale, async () => {
//   isLocaleChanged.value = true
//   await nextTick()
//   setTimeout(() => {
//     isLocaleChanged.value = false
//   }, 400)
// })
</script>

<template>
  <main class="container max-w-5xl mx-auto text-zinc-600">
    <BlogPostHero />

    <TagsFilter
      v-model:selected-tags="selectedTags"
      :all-tags="allTags"
    />

    <ContentSearch v-model:search-test="searchTest" />

    <!-- 文章列表 -->
    <ClientOnly>
      <div v-if="paginatedData && paginatedData.length" v-auto-animate class="space-y-5 my-5 px-4">
        <template v-for="post in paginatedData" :key="post.title">
          <BlogPostCard
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

        <BlogNoResults
          v-if="paginatedData.length <= 0"
          :clear-filters="clearFilters"
        />
      </div>
      <template #fallback>
        <!-- this will be rendered on server side -->
        <div class="space-y-5 my-5 px-4">
          <BlogLoader />
          <BlogLoader />
        </div>
      </template>
    </ClientOnly>

    <div class="flex justify-center items-center space-x-6 ">
      <button :disabled="pageNumber <= 1" @click="onPreviousPageClick">
        <Icon name="mdi:code-less-than" size="30" class="base-btn-disabled min-w-[30px] min-h-[30px]" :class="{ 'base-btn': pageNumber > 1 }" />
      </button>
      <p>{{ pageNumber }} / {{ totalPage }}</p>
      <button :disabled="pageNumber >= totalPage" @click="onNextPageClick">
        <Icon name="mdi:code-greater-than" size="30" class="base-btn-disabled min-w-[30px] min-h-[30px]" :class="{ 'base-btn': pageNumber < totalPage }" />
      </button>
    </div>
  </main>
</template>
