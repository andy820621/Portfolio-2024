<script setup lang="ts">
const localePath = useLocalePath()
const { locale } = useI18n()

// 獲取內容數據
const paramName = 'project'
const { contentData, error } = await useContentData({
  basePageName: 'projects',
  paramName,
})

// SSR 友善錯誤處理：直接丟 404，交由 `app/error.vue` 呈現
if (error.value || !contentData.value) {
  console.error('Project not found or fetch error:', error.value)
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    message: 'Project not found',
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
    const licensePageUrl = locale.value === 'en'
      ? 'https://creativecommons.org/licenses/by/4.0/'
      : 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hant'

    // 在開發環境中檢查必要欄位
    if (import.meta.dev && !mainData.value.date) {
      console.warn(`[SEO Warning] Project "${mainData.value.title}" is missing a date field`)
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
      const publishDate = new Date(mainData.value.date)
      const modifiedDate = mainData.value.updatedAt
        ? new Date(mainData.value.updatedAt)
        : publishDate
      const copyrightYear = publishDate.getFullYear().toString()

      schemas.push(
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
          'datePublished': publishDate.toISOString(),
          'dateModified': modifiedDate.toISOString(),
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
          'keywords': keywords,
          'articleSection': articleSection,
          'inLanguage': localeProperties.value.language,
          'copyrightYear': copyrightYear,
          'copyrightHolder': {
            '@id': personId,
          },
        }),
      )
    }

    // Image schema 可以獨立存在
    if (mainData.value.image) {
      schemas.push(
        defineImage({
          '@type': 'ImageObject',
          'contentUrl': `${trailingSlashUrlOrNot(baseUrl.value, false)}${mainData.value.image}`,
          'url': `${trailingSlashUrlOrNot(baseUrl.value, false)}${mainData.value.image}`,
          'license': licensePageUrl,
          'acquireLicensePage': `${trailingSlashUrlOrNot(baseUrl.value, false)}${localePath('license')}`,
          'creditText': 'BarZ Hsieh',
          'creator': {
            '@type': 'Person',
            '@id': personId,
            'name': 'BarZ Hsieh',
          },
          'copyrightNotice': '2024-PRESENT © BarZ Hsieh',
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
        <BackgroundsArtPlum />
      </BackgroundsPortal>
    </ClientOnly>

    <WrapperPost :conten-detail-data="contenDetailData" redirect-link="/projects" />
  </div>
</template>
