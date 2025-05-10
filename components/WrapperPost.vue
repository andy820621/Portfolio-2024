<script setup lang="ts">
import type { AllCollectionItem, ContentDetailDataReturn } from '~/types/main'
import ProseTh from './content/ProseTh.vue'

const { contenDetailData, redirectLink = '/posts' } = defineProps<{
  contenDetailData: ContentDetailDataReturn<AllCollectionItem>
  redirectLink?: string
}>()

const localePath = useLocalePath()

// 使用拆分後的 composables
const { mainData, prevContent, nextContent } = contenDetailData

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
}))

// 使用 SEO composable
useContentSEO(data)

const tocLinks = computed(() => mainData.value?.body?.toc?.links || [])
</script>

<template>
  <div>
    <div class="grid-cols-12 mx-auto max-w-5xl gap-x-12 px-6 container sm:grid">
      <div class="col-span-12 lg:col-span-9">
        <div
          class="prose prose-pre:max-w-xs prose-sm prose-h1:no-underline prose-zinc prose-img:rounded-lg sm:prose-pre:max-w-full sm:prose-base md:prose-lg dark:prose-invert mx-auto max-w-5xl"
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

          <ContentRenderer v-if="mainData" :value="mainData" :components="{ th: ProseTh }">
            <template #empty>
              <p>No content found.</p>
            </template>
          </ContentRenderer>

          <template v-else>
            <div grid mt-20 justify-center>
              <NuxtLink
                :to="localePath(redirectLink)"
                class="inline-block px-6 py-3 text-lg font-semibold hover:shadow-base-hover shadow-base transition duration-300 ease-in-out base-btn hover:-translate-y-1"
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

        <postPrevNext :prev="prevContent" :next="nextContent" />
      </div>
    </div>
  </div>
</template>
