<script setup lang="ts">
import type { ContentCollectionsKey } from '~~/types/main'

const { locale, localeProperties } = useI18n()

// 使用 useAsyncData 獲取內容
const { data: content, error } = await useAsyncData(
  `license-${locale.value}`,
  async () => {
    try {
      const collection = `content_${locale.value}` as ContentCollectionsKey

      const result = await queryCollection(collection)
        .path('/license')
        .first()

      return result
    }
    catch (e) {
      console.error('Error fetching license content:', e)
      return null
    }
  },
)

// 設置 SEO
usePageSeo({
  title: content.value?.title || 'License',
  description: content.value?.description || '',
  keywords: content.value?.keywords || [],
})

// Schema.org for legal page
const { baseUrl, fullPath } = useUrl()
const websiteId = `${baseUrl.value}#website`
const nowPageId = `${fullPath.value}#webpage`

useSchemaOrg([
  defineWebPage({
    '@id': nowPageId,
    '@type': 'WebPage',
    'name': content.value?.title || 'License',
    'description': content.value?.description || '',
    'url': fullPath.value,
    'inLanguage': localeProperties.value.language,
    'isPartOf': {
      '@id': websiteId,
    },
  }),
])
</script>

<template>
  <div class="relative">
    <RandomBackground />

    <div class="prose mx-auto">
      <article>
        <ContentRenderer v-if="content" :value="content" />

        <div v-else-if="error" class="grid h-[80vh] w-[80vw] items-center justify-center">
          <h1>{{ $t('error.occurred') }}</h1>
          <p>{{ error.message }}</p>
        </div>

        <div v-else class="grid h-[80vh] w-[80vw] items-center justify-center">
          <h1>{{ $t('loading') }}</h1>
          <Icon name="mdi:loading" class="animate-spin" size="81" />
        </div>
      </article>
    </div>
  </div>
</template>
