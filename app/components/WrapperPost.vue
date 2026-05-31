<script setup lang="ts">
import ProseTh from './content/ProseTh.vue'

const { contentDetailData, redirectLink = '/posts' } = defineProps<{
  contentDetailData: ContentDetailData
  redirectLink?: string
}>()

const localePath = useLocalePath()
const route = useRoute()
const { trackOutboundClick } = useAnalyticsOutboundClick()

// 使用拆分後的 composables
const { mainData, prevContent, nextContent } = contentDetailData

// 將 null 轉為 undefined，以符合下游元件（如 postPrevNext）可能使用可選屬性的型別
const prevForNav = computed(() => prevContent.value ?? undefined)
const nextForNav = computed(() => nextContent.value ?? undefined)

const relatedPagesInput = computed(() => {
  const value = mainData.value?.relatedPages
  return Array.isArray(value) ? value : []
})
const relatedLinksInput = computed(() => {
  const value = mainData.value?.relatedLinks
  return Array.isArray(value) ? value : []
})

const { relatedPages } = useRelatedPages(relatedPagesInput, contentDetailData.collection)
const { relatedLinks } = useRelatedLinks(relatedLinksInput)

const data = computed(() => ({
  title: mainData.value?.title,
  description: mainData.value?.description,
  seoTitle: mainData.value?.seoTitle,
  seoDescription: mainData.value?.seoDescription,
  image: mainData.value?.image,
  alt: mainData.value?.alt,
  ogImage: mainData.value?.ogImage,
  date: mainData.value?.date,
  tags: mainData.value?.tags || [],
  published: mainData.value?.published ?? true,
  wordCount: mainData.value?.wordCount || 0,
  readingTime: mainData.value?.readingTime || undefined,
  imageClass: mainData.value?.imageClass || '',
}))

// 使用 SEO composable
useContentSEO(data)

const tocLinks = computed(() => mainData.value?.body?.toc?.links || [])

const { fullPath } = useUrl()

function resolveMarkdownDestinationType(url: URL) {
  const hostname = url.hostname.toLowerCase()

  if (hostname === 'github.com' || hostname.endsWith('.github.com'))
    return 'github' as const

  if (hostname === 'npmjs.com' || hostname.endsWith('.npmjs.com'))
    return 'npm' as const

  return undefined
}

function resolveContentItemId() {
  const params = route.params as {
    post?: string
    project?: string
  }

  return params.post || params.project
}

function handleMarkdownOutboundClick(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  const anchor = target?.closest('a[href]') as HTMLAnchorElement | null

  if (!anchor)
    return

  const href = anchor.getAttribute('href')

  if (!href || href.startsWith('#') || href.startsWith('/'))
    return

  let resolvedUrl: URL

  try {
    resolvedUrl = new URL(href, window.location.href)
  }
  catch {
    return
  }

  if (resolvedUrl.origin === window.location.origin)
    return

  const destinationType = resolveMarkdownDestinationType(resolvedUrl)

  if (!destinationType)
    return

  trackOutboundClick({
    destinationType,
    destinationUrl: resolvedUrl.href,
    sourceComponent: 'markdown_content',
    itemId: resolveContentItemId(),
  })
}

if (import.meta.client) {
  const HASH_OFFSET = 100

  async function scrollToHash(hash: string, attempt = 0) {
    await nextTick()
    const target = document.querySelector(hash)

    if (!target) {
      if (attempt < 5)
        setTimeout(scrollToHash, 100, hash, attempt + 1)
      return
    }

    const top = target.getBoundingClientRect().top + window.scrollY - HASH_OFFSET
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const handleHashNavigation = (hash?: string | null) => {
    if (!hash || !mainData.value)
      return
    scrollToHash(hash)
  }

  watch(
    () => mainData.value,
    () => handleHashNavigation(route.hash),
    { flush: 'post', immediate: true },
  )

  watch(
    () => route.hash,
    hash => handleHashNavigation(hash),
    { flush: 'post', immediate: true },
  )
}
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

          <div v-if="mainData" @click.capture="handleMarkdownOutboundClick">
            <ContentRenderer :value="mainData" :components="{ th: ProseTh }">
              <template #empty>
                <p>No content found.</p>
              </template>
            </ContentRenderer>

            <PostRelatedPages :pages="relatedPages" />
            <PostRelatedLinks :links="relatedLinks" />
          </div>

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
            :url="fullPath"
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
