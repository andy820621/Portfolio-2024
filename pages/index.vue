<script setup lang="ts">
import type { Collections } from '@nuxt/content'

const { t, locale } = useI18n()

// 使用 useAsyncData 獲取內容
const { data: content, error } = await useAsyncData(
  `content-${locale.value}`,
  async () => {
    try {
      const collection = (`content_${locale.value}`) as keyof Collections

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
  // {
  //   watch: [locale], // 當語言變更時重新獲取資料
  // },
)

// 錯誤處理
watchEffect(() => {
  if (error.value) {
    console.error('Fetch error:', error.value)
  }
})

const pageTitle = computed(() => t('home'))

usePageSeo({
  title: pageTitle.value || 'home',
  description: content.value?.description || t('homePage.description') || '',
})

useSchemaOrg([
  defineWebPage({
    '@type': 'ProfilePage',
    'about': { '@id': 'https://barz.app/#identity' },
  }),
])
</script>

<template>
  <div class="prose m-auto ">
    <article>
      <ContentRenderer v-if="content" :value="content" />

      <div v-else-if="error" class="h-[80vh] w-[80vw] grid items-center justify-center">
        <h1>{{ t('error.occurred') }}</h1>
        <p>{{ error.message }}</p>
      </div>

      <div v-else class="h-[80vh] w-[80vw] grid items-center justify-center">
        <h1>{{ t('loading') }}</h1>
        <Icon name="mdi:loading" class="animate-spin" size="81" />
      </div>
    </article>
  </div>
</template>
