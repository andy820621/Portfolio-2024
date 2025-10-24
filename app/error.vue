<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError,
})

const { t } = useI18n()
const localePath = useLocalePath()

const pageTitle = computed(() => {
  if (props.error?.statusCode === 404) {
    return t('errorPage.title', '404 - Page Not Found')
  }
  return t('errorPage.genericTitle', 'An Error Occurred')
})

const pageDescription = computed(() => {
  if (props.error?.statusCode === 404) {
    return props.error?.message || t('errorPage.description', '您訪問的頁面不存在')
  }
  return props.error?.message || t('errorPage.genericDescription', '抱歉，發生了一些錯誤。')
})

// SEO metadata for the error page
useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageDescription },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const handleError = () => clearError({ redirect: localePath('/') })
</script>

<template>
  <!-- Can use another layout -->
  <NuxtLayout name="error">
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
          :to="localePath('/')"
          class="inline-block base-btn px-6 py-3 text-lg font-semibold shadow-base transition duration-300 ease-in-out hover:shadow-base-hover hover:-translate-y-1"
          :aria-label="$t('backToHome')"
          :title="$t('backToHome')"
          @click.prevent="handleError"
        >
          {{ $t('backToHome') }}
        </NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>
