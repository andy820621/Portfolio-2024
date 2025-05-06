<script setup lang="ts">
import type { AllCollectionItem } from '~/types/main'

const localePath = useLocalePath()

// 獲取內容數據
const paramName = 'project'
const { contentData, error } = await useContentData({
  basePageName: 'projects',
  paramName,
})

// 錯誤處理
watchEffect(() => {
  if (error.value) {
    console.error('Fetch error:', error.value)
    navigateTo(localePath('/404'))
  }
})

if (!contentData.value) {
  console.error('No content data found')
  navigateTo(localePath('/404'))
}

const contenDetailData = useContentDetailData<AllCollectionItem>(contentData)
const { mainData } = contenDetailData

const { localeProperties } = useI18n()

watchEffect(() => {
  if (mainData.value) {
    const keywords = mainData.value.tags || []
    const articleSection = mainData.value.categories || mainData.value.tags || []
    const { baseUrl, fullPath } = useUrl()

    const websiteId = `${baseUrl.value}#website`
    const nowPageId = `${fullPath.value}#webpage`
    const articleId = `${fullPath.value}#article`
    const personId = `${baseUrl.value}#identity`

    useSchemaOrg([
      defineWebPage({
        '@type': 'WebPage',
        '@id': nowPageId,
        'name': mainData.value.title,
        'description': mainData.value.description,
        'isPartOf': {
          '@id': websiteId,
        },
        'inLanguage': localeProperties.value.language,
      }),

      defineArticle({
        '@type': 'Article',
        '@id': articleId,
        'headline': mainData.value.title,
        'description': mainData.value.description,
        'isPartOf': {
          '@id': nowPageId,
        },
        'mainEntityOfPage': {
          '@id': nowPageId,
        },
        'datePublished': new Date(mainData.value.date!).toISOString(),
        'dateModified': new Date(mainData.value.updatedAt! || mainData.value.date!).toISOString(),
        'author': {
          '@id': personId,
        },
        'publisher': {
          '@id': personId,
        },
        'image': mainData.value.image
          ? [mainData.value.image]
          : undefined,
        'articleBody': mainData.value.rawbody || '',
        'wordCount': mainData.value.wordCount,
        'keywords': keywords,
        'articleSection': articleSection,
        'inLanguage': localeProperties.value.language,
        'copyrightYear': mainData.value.date
          ? new Date(mainData.value.date).getFullYear().toString()
          : new Date().getFullYear().toString(),
        'copyrightHolder': {
          '@id': personId,
        },
      }),
    ])
  }
})
</script>

<template>
  <WrapperPost :conten-detail-data="contenDetailData" redirect-link="/projects" />
</template>
