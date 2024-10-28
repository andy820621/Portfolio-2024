<script setup lang="ts">
const { basePageName, paramName } = defineProps<{
  basePageName: string
  paramName: string
}>()

const localePath = useLocalePath()

// 使用拆分後的 composables
const { contentData, error } = await useContentData({ basePageName, paramName })
const { mainData, prevContent, nextContent } = useContentDetailData(contentData)
const { activeId } = useTocObserver()

const data = computed(() => ({
  title: mainData.value?.title,
  description: mainData.value?.description,
  image: mainData.value?.image,
  alt: mainData.value?.alt,
  ogImage: mainData.value?.ogImage,
  date: mainData.value?.date,
  tags: mainData.value?.tags || [],
  published: mainData.value?.published || false,
  wordCount: mainData.value?.wordCount || 0,
  readingTime: mainData.value?.readingTime || undefined,
}))

// 使用 SEO composable
useContentSEO(data)

// 錯誤處理
watchEffect(() => {
  if (error.value) {
    console.error('Fetch error:', error.value)
    navigateTo(localePath('/404'))
  }
})

const tocLinks = computed(() => mainData.value?.body?.toc?.links || [])
</script>

<template>
  <div>
    <div class="px-6 container max-w-5xl mx-auto sm:grid grid-cols-12 gap-x-12">
      <div class="col-span-12 lg:col-span-9">
        <div
          class="prose prose-pre:max-w-xs sm:prose-pre:max-w-full prose-sm sm:prose-base md:prose-lg
          prose-h1:no-underline max-w-5xl mx-auto prose-zinc dark:prose-invert prose-img:rounded-lg"
        >
          <postHeader
            :title="data.title"
            :image="data.image"
            :alt="data.alt"
            :date="data.date"
            :description="data.description"
            :tags="data.tags"
            :word-count="data.wordCount"
            :reading-time="data.readingTime"
          />
          <ContentRenderer v-if="mainData" :value="mainData">
            <template #empty>
              <p>No content found.</p>
            </template>
          </ContentRenderer>

          <template v-else>
            <div grid justify-center mt-20>
              <NuxtLink
                :to="localePath('/posts')"
                class="inline-block px-6 py-3 text-lg font-semibold base-btn transition duration-300 ease-in-out hover:-translate-y-1
          shadow-base hover:shadow-base-hover"
              >
                {{ $t('backToPostsList') }}
              </NuxtLink>
            </div>
          </template>
        </div>
      </div>

      <postToc v-if="tocLinks.length > 0" :links="tocLinks" :active-id="activeId" />

      <div v-if="mainData" class="col-span-12 flex flex-col gap-4 mt-10">
        <div class="flex flex-row flex-wrap md:flex-nowrap mt-10 gap-2">
          <SocialShare
            v-for="network in ['facebook', 'twitter', 'linkedin', 'email']"
            :key="network"
            :network="network"
            :styled="true"
            :label="true"
            class="p-1 text-slate-300"
            :aria-label="`Share with ${network}`"
          />
        </div>

        <postPrevNext :prev="prevContent" :next="nextContent" />
      </div>
    </div>
  </div>
</template>
