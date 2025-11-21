<script setup lang="ts">
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

const contenDetailData = useContentDetailData(contentData)
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

    // 在開發環境中檢查必要欄位
    if (import.meta.dev && !mainData.value.date) {
      console.warn(`[SEO Warning] Post "${mainData.value.title}" is missing a date field`)
    }

    // 建立基本的 schema
    const schemas: Parameters<typeof useSchemaOrg>[0] = [
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
    ]

    // 只有在有日期的情況下才加入 Article schema
    if (mainData.value.date) {
      const articleDate = new Date(mainData.value.date)
      const copyrightYear = articleDate.getFullYear().toString()

      schemas.push(
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
          'datePublished': articleDate.toISOString(),
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
          'copyrightYear': copyrightYear,
          'copyrightHolder': {
            '@id': personId,
          },
        }),
      )
    }

    useSchemaOrg(schemas)
  }
})
</script>

<template>
  <div>
    <ClientOnly>
      <BackgroundsPortal>
        <BackgroundsFlowDots />
      </BackgroundsPortal>
    </ClientOnly>
    <WrapperPost :conten-detail-data="contenDetailData" redirect-link="/posts" />
  </div>
</template>
