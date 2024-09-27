<script setup lang="ts">
const { t, locale } = useI18n()

// 使用 useAsyncData 獲取內容
const { data: content, error } = await useAsyncData(
  `content-${locale.value}`,
  async () => {
    try {
      return await queryContent('/about').locale(locale.value).findOne()
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

definePageMeta({
  documentDriven: {
    page: false, // Keep page fetching enabled
    surround: false, // Disable surround fetching
  },
})

const pageTitle = computed(() => t('home'))

useHead({
  title: pageTitle.value,
})

defineOgImageComponent('NuxtSeo', {
  title: pageTitle.value,
  description: content.value?.description || '',
})
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
