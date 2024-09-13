<script setup lang="ts">
import { navbarData, seoData } from '~/data'
import type { BlogPost } from '~/types/main'

const route = useRoute()

// remove trailing slash from path
const actualPath = route.path.replace(/\/$/, '')

const { data: postData, error } = await useAsyncData(`post-${actualPath}`, () =>
  Promise.all([
    queryContent<BlogPost>(actualPath).findOne(),

    queryContent<BlogPost>('posts')
      .where({
        navigation: { $ne: false },
        draft: { $ne: true },
      }) // skip posts with `navigation: false` or `draft: true`
      .only(['_path', 'title', 'description'])
      .sort({ date: -1 })
      .findSurround(route.fullPath.replace(/\/$/, '')),
  ]))

const article = computed(() => postData.value?.[0])
const prevPost = computed(() => postData.value?.[1]?.[0])
const nextPost = computed(() => postData.value?.[1]?.[1])

// 錯誤處理
watchEffect(() => {
  if (error.value) {
    console.error('Fetch error:', error.value)
    navigateTo('/404')
  }
})

const data = computed(() => {
  return {
    title: article.value?.title || 'no-title available',
    description: article.value?.description || 'no-description available',
    image: article.value?.image || '/not-found.jpg',
    alt: article.value?.alt || 'no alter data available',
    ogImage: article.value?.ogImage || '/not-found.jpg',
    date: article.value?.date || 'not-date-available',
    tags: article.value?.tags || [],
    published: article.value?.published || false,
  }
})

useHead({
  title: data.value.title || '',
  meta: [
    { name: 'description', content: data.value.description },
    {
      name: 'description',
      content: data.value.description,
    },
    // Test on: https://developers.facebook.com/tools/debug/ or https://socialsharepreview.com/
    { property: 'og:site_name', content: navbarData.homeTitle },
    { hid: 'og:type', property: 'og:type', content: 'website' },
    {
      property: 'og:url',
      content: `${seoData.mySite}/${route.path}`,
    },
    {
      property: 'og:title',
      content: data.value.title,
    },
    {
      property: 'og:description',
      content: data.value.description,
    },
    {
      property: 'og:image',
      content: data.value.ogImage || data.value.image,
    },
    // Test on: https://cards-dev.twitter.com/validator or https://socialsharepreview.com/
    { name: 'twitter:site', content: '@qdnvubp' },
    { name: 'twitter:card', content: 'summary_large_image' },
    {
      name: 'twitter:url',
      content: `${seoData.mySite}/${route.path}`,
    },
    {
      name: 'twitter:title',
      content: data.value.title,
    },
    {
      name: 'twitter:description',
      content: data.value.description,
    },
    {
      name: 'twitter:image',
      content: data.value.ogImage || data.value.image,
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: `${seoData.mySite}/${route.path}`,
    },
  ],
})

// Generate OG Image
defineOgImageComponent('Test', {
  headline: 'Greetings 👋',
  title: data.value.title || '',
  description: data.value.description || '',
  link: data.value.ogImage,

})

// setting toc links to have active style
const activeId = ref('')

onMounted(() => {
  const observer = new IntersectionObserver(callback, {
    root: null,
    threshold: 0.5,
  })

  const elements = document.querySelectorAll('h2, h3')

  for (const element of elements) observer.observe(element)

  onBeforeUnmount(() => {
    for (const element of elements) observer.unobserve(element)
  })
})

function callback(entries: IntersectionObserverEntry[]) {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      activeId.value = entry.target.id
      break
    }
  }
}

const tocLinks = computed(() => article.value?.body?.toc?.links || [])
</script>

<template>
  <div v-if="article">
    <!-- 你的現有模板內容 -->
    <div class="px-6 container max-w-5xl mx-auto sm:grid grid-cols-12 gap-x-12">
      <div class="col-span-12 lg:col-span-9">
        <BlogHeader
          :title="data.title"
          :image="data.image"
          :alt="data.alt"
          :date="data.date"
          :description="data.description"
          :tags="data.tags"
        />
        <div
          class="prose prose-pre:max-w-xs sm:prose-pre:max-w-full prose-sm sm:prose-base md:prose-lg
          prose-h1:no-underline max-w-5xl mx-auto prose-zinc dark:prose-invert prose-img:rounded-lg"
        >
          <ContentRenderer :value="article">
            <template #empty>
              <p>No content found.</p>
            </template>
          </ContentRenderer>
        </div>
      </div>

      <BlogToc :links="tocLinks" :active-id="activeId" />

      <div class="col-span-12 flex flex-col gap-4 mt-10">
        <div class="flex flex-row flex-wrap md:flex-nowrap mt-10 gap-2">
          <SocialShare
            v-for="network in ['facebook', 'twitter', 'linkedin', 'email']"
            :key="network"
            :network="network"
            :styled="true"
            :label="true"
            class="p-1"
            :aria-label="`Share with ${network}`"
          />
        </div>

        <BlogPrevNext :prev="prevPost" :next="nextPost" />
      </div>
    </div>
  </div>
  <div v-else-if="error">
    An error occurred while loading the content.
  </div>
  <div v-else>
    Loading...
  </div>
</template>
