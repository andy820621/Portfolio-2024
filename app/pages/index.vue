<script setup lang="ts">
import type { ContentCollectionsKey } from '~~/types/main'
import ProseTh from '~/components/content/ProseTh.vue'

const { t, locale, localeProperties } = useI18n()

// 使用 useAsyncData 獲取內容
const { data: content, error } = await useAsyncData(
  `content-${locale.value}`,
  async () => {
    try {
      const collection = `content_${locale.value}` as ContentCollectionsKey

      const result = await queryCollection(collection)
        .path('/about')
        .first()

      return result
    }
    catch (e) {
      console.error('Error fetching content:', e)
      return null
    }
  },
)

// 錯誤處理
watchEffect(() => {
  if (error.value) {
    console.error('Fetch error:', error.value)
  }
})

const pageTitle = computed(() => t('home'))
const pageSeoTitle = computed(() => content.value?.seoTitle || t('homePage.seoTitle') || pageTitle.value || 'Home')
const pageSeoDescription = computed(() => content.value?.seoDescription || t('homePage.seoDescription') || content.value?.description || t('homePage.description') || '')
const homepageKeywords = computed(() => {
  const sharedKeywords = ['BarZ', 'BarZ Hsieh', 'Hsieh Yao Tsu', 'andy820621']

  if (locale.value.startsWith('zh')) {
    return [
      ...sharedKeywords,
      '前端工程師',
      'Nuxt 開發者',
      '個人作品集',
      '技術部落格',
      '台北',
    ]
  }

  return [
    ...sharedKeywords,
    'Frontend Engineer',
    'Nuxt Developer',
    'Personal Portfolio',
    'Technical Blog',
    'Taipei',
  ]
})

usePageSeo({
  title: pageSeoTitle.value,
  description: pageSeoDescription.value,
  image: '/page-cover/home.webp',
  keywords: homepageKeywords.value,
})

const { baseUrl } = useUrl()

const webpageId = `${baseUrl.value}#webpage`
const websiteId = `${baseUrl.value}#website`
const personId = `${baseUrl.value}#identity`

useSchemaOrg([
  defineWebPage({
    '@id': webpageId,
    '@type': 'ProfilePage',
    'description': pageSeoDescription.value || 'BarZ Hsieh\'s Portfolio',
    'name': pageSeoTitle.value || 'BarZ Hsieh',
    'url': baseUrl.value,
    // 'about':  NodeRelation<Organization>,
    'mainEntity': {
      '@id': personId,
    },
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

    <div class="prose m-auto">
      <article>
        <ContentRenderer v-if="content" :value="content" :components="{ th: ProseTh }" />

        <div v-else-if="error" class="grid h-[80vh] w-[80vw] items-center justify-center">
          <h1>{{ t('error.occurred') }}</h1>
          <p>{{ error.message }}</p>
        </div>

        <div v-else class="grid h-[80vh] w-[80vw] items-center justify-center">
          <h1>{{ t('loading') }}</h1>
          <Icon name="mdi:loading" class="animate-spin" size="81" />
        </div>
      </article>
    </div>
  </div>
</template>
