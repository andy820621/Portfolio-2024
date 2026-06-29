<script setup lang="ts">
import type { NuxtError } from '#app'
import { navbarData } from '~~/data'

const props = defineProps({
  error: Object as () => NuxtError,
})

const route = useRoute()

let tComposer: ((key: string, fallback?: string) => string) | undefined
let localePathComposer: ((path: string) => string) | undefined

try {
  const { t } = useI18n()
  tComposer = t
}
catch {
  tComposer = undefined
}

try {
  localePathComposer = useLocalePath()
}
catch {
  localePathComposer = undefined
}

function tSafe(key: string, fallback: string) {
  if (tComposer) {
    const translated = tComposer(key, fallback)
    if (typeof translated === 'string' && translated.length > 0)
      return translated
  }

  return fallback
}

function localePathSafe(path: string) {
  if (localePathComposer)
    return localePathComposer(path)

  if (path !== '/')
    return path

  return route.path.startsWith('/zh') ? '/zh/' : '/'
}

const homePath = computed(() => localePathSafe('/'))
const { baseUrl } = useUrl()

const pageTitle = computed(() => {
  if (props.error?.statusCode === 404) {
    return tSafe('errorPage.title', '404 - Page Not Found')
  }
  return tSafe('errorPage.genericTitle', 'An Error Occurred')
})

const useLocalizedDescription = computed(() => {
  const data = props.error?.data

  return typeof data === 'object'
    && data !== null
    && 'useLocalizedDescription' in data
    && data.useLocalizedDescription === true
})

const pageDescription = computed(() => {
  if (props.error?.statusCode === 404) {
    if (useLocalizedDescription.value)
      return tSafe('errorPage.description', '您訪問的頁面不存在')

    return props.error?.message || tSafe('errorPage.description', '您訪問的頁面不存在')
  }
  return props.error?.message || tSafe('errorPage.genericDescription', '抱歉，發生了一些錯誤。')
})

const shouldUseStaticOgImage = computed(() => {
  const statusCode = props.error?.statusCode || 500
  return statusCode >= 400 && statusCode < 500
})

const ogImageUrl = computed(() => {
  if (!shouldUseStaticOgImage.value)
    return undefined

  return resolveStaticOgImageUrl(baseUrl.value, '/not-found-404.jpg')
})

const ogImageAlt = computed(() => {
  if (!ogImageUrl.value)
    return undefined

  return `${pageTitle.value} | ${navbarData.homeTitle}`
})

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  robots: 'noindex, nofollow',
  ogType: 'website',
  ogSiteName: navbarData.homeTitle,
  twitterCard: () => ogImageUrl.value ? 'summary_large_image' : undefined,
  twitterTitle: () => ogImageUrl.value ? pageTitle.value : undefined,
  twitterDescription: () => ogImageUrl.value ? pageDescription.value : undefined,
  ogTitle: () => ogImageUrl.value ? pageTitle.value : undefined,
  ogDescription: () => ogImageUrl.value ? pageDescription.value : undefined,
  ogImage: ogImageUrl,
  ogImageAlt,
  twitterImage: ogImageUrl,
  twitterImageAlt: ogImageAlt,
})

const backToHomeLabel = computed(() => tSafe('backToHome', 'Back to Home'))

const handleError = () => clearError({ redirect: homePath.value })
</script>

<template>
  <main class="min-h-[100dvh] px-7 py-12">
    <div class="container mx-auto max-w-xl min-h-[calc(100dvh-200px)] flex flex-col pb-4 text-center">
      <h1 class="py-4 text-4xl font-bold">
        <Logo404
          v-if="props.error?.statusCode === 404"
          class="mx-auto w-[100%] lg:w-[96%] md:w-[85%] sm:w-[80%]"
        />
        <span class="sr-only">{{ props.error?.statusCode }}</span>
      </h1>

      <p class="py-8 text-xl">
        {{ pageDescription }}
      </p>

      <div class="flex-grow" />

      <div grid justify-center>
        <NuxtLink
          :to="homePath"
          class="inline-block base-btn px-6 py-3 text-lg font-semibold shadow-base transition duration-300 ease-in-out hover:shadow-base-hover hover:-translate-y-1"
          :aria-label="backToHomeLabel"
          :title="backToHomeLabel"
          @click.prevent="handleError"
        >
          {{ backToHomeLabel }}
        </NuxtLink>
      </div>
    </div>
  </main>
</template>
