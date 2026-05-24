<script setup lang="ts">
import { createPersonReference } from '~~/data'

// 獲取內容數據
const paramName = 'post'
const { contentData, error, collection } = await useContentData({
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

const contentDetailData = useContentDetailData(contentData, collection)
const { mainData } = contentDetailData
const post = mainData.value

if (!post) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    message: 'Post not found',
    fatal: false,
  })
}

const { localeProperties } = useI18n()
const { getBreadcrumbListSchema } = useBreadcrumb()
const route = useRoute()
const { baseUrl } = useUrl()

const keywords = post.tags || []
const articleSection = post.categories || post.tags || []
const schemaDescription = post.seoDescription || post.description

const websiteId = buildSchemaNodeId(baseUrl.value, 'website')
const nowPageId = buildSchemaPageNodeId(baseUrl.value, route.path, 'webpage')
const articleId = buildSchemaPageNodeId(baseUrl.value, route.path, 'article')
const personId = buildSchemaNodeId(baseUrl.value, 'identity')

// 在開發環境中檢查必要欄位
if (import.meta.dev && !post.date)
  console.warn(`[SEO Warning] Post "${post.title}" is missing a date field`)

const schemas: Parameters<typeof useSchemaOrg>[0] = [
  defineWebPage({
    '@type': 'WebPage',
    '@id': nowPageId,
    'name': post.title,
    'description': schemaDescription,
    'url': buildCanonicalSiteUrl(baseUrl.value, route.path),
    'isPartOf': {
      '@id': websiteId,
    },
    'inLanguage': localeProperties.value.language,
  }),

  defineBreadcrumb(getBreadcrumbListSchema(post.title)),
]

// 只有在有日期的情況下才加入 Article schema
if (post.date) {
  const articleDate = new Date(post.date)
  const modifiedDate = post.updatedAt
    ? new Date(post.updatedAt)
    : articleDate
  const copyrightYear = articleDate.getFullYear().toString()

  schemas.push(
    defineArticle({
      '@type': 'BlogPosting',
      '@id': articleId,
      'headline': post.title,
      'description': schemaDescription,
      'isPartOf': {
        '@id': nowPageId,
      },
      'mainEntityOfPage': {
        '@id': nowPageId,
      },
      'datePublished': articleDate.toISOString(),
      'dateModified': modifiedDate.toISOString(),
      'author': createPersonReference({
        baseUrl: baseUrl.value,
        includeName: true,
      }),
      'publisher': {
        '@id': personId,
      },
      'image': post.image
        ? [resolveStaticOgImageUrl(baseUrl.value, post.ogImage, post.image)]
        : undefined,
      'wordCount': post.wordCount,
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
</script>

<template>
  <div>
    <RandomBackground :sources="['Silk', 'FlowDots']" />

    <WrapperPost :content-detail-data="contentDetailData" redirect-link="/posts" />
  </div>
</template>
