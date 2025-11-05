<script setup lang="ts">
import type { AllCollectionItem } from '~~/types/main'

// 獲取內容數據
const paramName = 'post'
const { contentData, error } = await useContentData({
  basePageName: 'posts',
  paramName,
})

if (error.value || !contentData.value) {
  console.error('Post not found or fetch error:', error.value)
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    message: 'Post not found',
    fatal: false,
  })
}

const contenDetailData = useContentDetailData<AllCollectionItem>(contentData)
const { mainData } = contenDetailData

const { localeProperties } = useI18n()
const { getBreadcrumbListSchema } = useBreadcrumb()

watchEffect(() => {
  if (mainData.value) {
    const keywords = mainData.value.tags || []
    const articleSection = mainData.value.categories || mainData.value.tags || []
    const { baseUrl, fullPath } = useUrl()

    const websiteId = `${baseUrl.value}#website`
    const nowPageId = `${fullPath.value}#webpage`
    const articleId = `${fullPath.value}#article`
    const personId = `${baseUrl.value}#identity`

    // TODO: Consider using the schemaOrg parameter from the .md file to control this
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

      defineBreadcrumb(getBreadcrumbListSchema(mainData.value.title)),

      defineArticle({
        '@type': 'BlogPosting',
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
        'dateModified': mainData.value.updatedAt || mainData.value.date,
        'author': {
          '@id': personId,
        },
        'publisher': {
          '@id': personId,
        },
        'image': mainData.value.image
          ? [`${trailingSlashUrlOrNot(baseUrl.value, false)}${mainData.value.image}`]
          : undefined,
        'articleBody': mainData.value.rawbody || '',
        'wordCount': mainData.value.wordCount,
        keywords,
        articleSection,
        'inLanguage': localeProperties.value.language,
        'copyrightYear': (() => {
          const stableYear = useStableYear()
          return mainData.value.date
            ? new Date(mainData.value.date).getFullYear().toString()
            : stableYear.value
        })(),
        'copyrightHolder': {
          '@id': personId,
        },
      }),
    ])
  }
})
</script>

<template>
  <WrapperPost :conten-detail-data="contenDetailData" redirect-link="/posts" />
</template>
