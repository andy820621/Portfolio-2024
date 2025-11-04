<script setup lang="ts">
import type { AllCollectionItem } from '~~/types/main'

const localePath = useLocalePath()
const { locale } = useI18n()

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
          ? [`${trailingSlashUrlOrNot(baseUrl.value, false)}${mainData.value.image}`]
          : undefined,
        'articleBody': mainData.value.rawbody || '',
        'wordCount': mainData.value.wordCount,
        'keywords': keywords,
        'articleSection': articleSection,
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

      defineImage({
        '@type': 'ImageObject',
        'contentUrl': `${trailingSlashUrlOrNot(baseUrl.value, false)}${mainData.value?.image}`,
        'url': `${trailingSlashUrlOrNot(baseUrl.value, false)}${mainData.value?.image}`,
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
    ])
  }
})
</script>

<template>
  <WrapperPost :conten-detail-data="contenDetailData" redirect-link="/projects" />
</template>
