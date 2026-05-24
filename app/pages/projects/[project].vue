<script setup lang="ts">
import { createPersonReference } from '~~/data'

const localePath = useLocalePath()
const { locale } = useI18n()

// 獲取內容數據
const paramName = 'project'
const { contentData, error, collection } = await useContentData({
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

const contentDetailData = useContentDetailData(contentData, collection)
const { mainData } = contentDetailData
const project = mainData.value

if (!project) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    message: 'Project not found',
    fatal: false,
  })
}

const { localeProperties } = useI18n()
const { getBreadcrumbListSchema } = useBreadcrumb()
const route = useRoute()
const { baseUrl } = useUrl()

const keywords = project.tags || []
const articleSection = project.categories || project.tags || []
const schemaDescription = project.seoDescription || project.description

const websiteId = buildSchemaNodeId(baseUrl.value, 'website')
const nowPageId = buildSchemaPageNodeId(baseUrl.value, route.path, 'webpage')
const articleId = buildSchemaPageNodeId(baseUrl.value, route.path, 'article')
const personId = buildSchemaNodeId(baseUrl.value, 'identity')
const licensePageUrl = locale.value === 'en'
  ? 'https://creativecommons.org/licenses/by/4.0/'
  : 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hant'

// 在開發環境中檢查必要欄位
if (import.meta.dev && !project.date)
  console.warn(`[SEO Warning] Project "${project.title}" is missing a date field`)

const schemas: Parameters<typeof useSchemaOrg>[0] = [
  defineWebPage({
    '@type': 'WebPage',
    '@id': nowPageId,
    'name': project.title,
    'description': schemaDescription,
    'url': buildCanonicalSiteUrl(baseUrl.value, route.path),
    'isPartOf': {
      '@id': websiteId,
    },
    'inLanguage': localeProperties.value.language,
  }),

  defineBreadcrumb(getBreadcrumbListSchema(project.title)),
]

// 只有在有日期的情況下才加入 Article schema
if (project.date) {
  const publishDate = new Date(project.date)
  const modifiedDate = project.updatedAt
    ? new Date(project.updatedAt)
    : publishDate
  const copyrightYear = publishDate.getFullYear().toString()

  schemas.push(
    defineArticle({
      '@type': 'Article',
      '@id': articleId,
      'headline': project.title,
      'description': schemaDescription,
      'isPartOf': {
        '@id': nowPageId,
      },
      'mainEntityOfPage': {
        '@id': nowPageId,
      },
      'datePublished': publishDate.toISOString(),
      'dateModified': modifiedDate.toISOString(),
      'author': createPersonReference({
        baseUrl: baseUrl.value,
        includeName: true,
      }),
      'publisher': {
        '@id': personId,
      },
      'image': project.image
        ? [resolveStaticOgImageUrl(baseUrl.value, project.ogImage, project.image)]
        : undefined,
      'wordCount': project.wordCount,
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
if (project.image) {
  schemas.push(
    defineImage({
      '@type': 'ImageObject',
      'contentUrl': resolveStaticOgImageUrl(baseUrl.value, project.ogImage, project.image),
      'url': resolveStaticOgImageUrl(baseUrl.value, project.ogImage, project.image),
      'license': licensePageUrl,
      'acquireLicensePage': buildCanonicalSiteUrl(baseUrl.value, localePath('license')),
      'creditText': 'BarZ Hsieh',
      'creator': createPersonReference({ baseUrl: baseUrl.value }),
      'copyrightNotice': '2024-PRESENT © BarZ Hsieh',
    }),
  )
}

useSchemaOrg(schemas)
</script>

<template>
  <div>
    <RandomBackground :sources="['ArtPlum', 'FlowDots']" />

    <WrapperPost :content-detail-data="contentDetailData" redirect-link="/projects" />
  </div>
</template>
