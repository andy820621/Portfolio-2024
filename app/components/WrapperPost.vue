<script setup lang="ts">
import type { AllCollectionItem, ContentDetailDataReturn } from '~~/types/main'
import ProseTh from './content/ProseTh.vue'

const { contenDetailData, redirectLink = '/posts' } = defineProps<{
  contenDetailData: ContentDetailDataReturn<AllCollectionItem>
  redirectLink?: string
}>()

const localePath = useLocalePath()

// 使用拆分後的 composables
const { mainData, prevContent, nextContent } = contenDetailData

// 將 null 轉為 undefined，以符合下游元件（如 postPrevNext）可能使用可選屬性的型別
const prevForNav = computed(() => prevContent.value ?? undefined)
const nextForNav = computed(() => nextContent.value ?? undefined)

const data = computed(() => ({
  title: mainData.value?.title,
  description: mainData.value?.description,
  image: mainData.value?.image,
  alt: mainData.value?.alt,
  ogImage: mainData.value?.ogImage,
  date: mainData.value?.date,
  tags: mainData.value?.tags || [],
  published: mainData.value?.published || true,
  wordCount: mainData.value?.wordCount || 0,
  readingTime: mainData.value?.readingTime || undefined,
  imageClass: mainData.value?.imageClass || '',
}))

// 使用 SEO composable
useContentSEO(data)

const tocLinks = computed(() => mainData.value?.body?.toc?.links || [])
</script>

<template>
  <div>
    <div class="container grid-cols-12 mx-auto max-w-5xl gap-x-12 px-6 sm:grid">
      <div class="col-span-12 lg:col-span-9">
        <div
          class="prose prose-sm prose-pre:max-w-xs prose-h1:no-underline prose-zinc prose-img:rounded-lg sm:prose-pre:max-w-full sm:prose-base md:prose-lg dark:prose-invert mx-auto max-w-5xl"
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
            :image-class="data.imageClass"
          />

          <ContentRenderer v-if="mainData" :value="mainData" :components="{ th: ProseTh }">
            <template #empty>
              <p>No content found.</p>
            </template>
          </ContentRenderer>

          <template v-else>
            <div grid mt-20 justify-center>
              <NuxtLink
                :to="localePath(redirectLink)"
                class="inline-block base-btn px-6 py-3 text-lg font-semibold shadow-base transition duration-300 ease-in-out hover:shadow-base-hover hover:-translate-y-1"
                :aria-label="$t('backToPostsList')"
                :title="$t('backToPostsList')"
              >
                {{ $t('backToPostsList') }}
              </NuxtLink>
            </div>
          </template>
        </div>
      </div>

      <postToc v-if="tocLinks.length > 0" :links="tocLinks" />

      <div v-if="mainData" class="col-span-12 mt-10 flex flex-col gap-4">
        <div class="mt-10 flex flex-row flex-wrap gap-2 md:flex-nowrap">
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

        <postPrevNext :prev="prevForNav" :next="nextForNav" />
      </div>
    </div>
  </div>
</template>
