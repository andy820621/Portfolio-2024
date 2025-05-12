<script setup lang="ts">
import { navbarData, seoData } from './data'
import './assets/variable.css'
import '@unocss/reset/tailwind.css'
import './assets/main.scss'
import './assets/markdown.css'
import './assets/prose.css'

const localeHead = useLocaleHead({
  dir: true, // old: addDirAttributes
  key: 'hid', // old: identifierAttribute
  seo: true, // old: addSeoAttributes
})
const { localeProperties } = useI18n()
const { route, baseUrl } = useUrl()

useHead({
  htmlAttrs: localeHead.value.htmlAttrs,
  // `%s` means The current page title., `%separator` defaults to a pipe character `|`
  titleTemplate: `%s %separator %siteName`,
  templateParams: {
    separator: '-',
    siteName: navbarData.homeTitle,
    schemaOrg: {
      host: baseUrl.value,
      path: route.path,
      inLanguage: 'en',
    },
  },
  link: [...(localeHead.value.link || [])],
  meta: [...(localeHead.value.meta || [])],
  // script: [
  //   { src: 'https://platform.twitter.com/widgets.js', async: true, charset: 'utf-8' },
  // ],
})

const websiteId = `${baseUrl.value}#website`
const personId = `${baseUrl.value}#identity`

useSchemaOrg([
  defineWebSite({
    '@id': websiteId,
    '@type': 'WebSite',
    'name': 'BarZ Hsieh\'s Personal Portfolio Website',
    'url': baseUrl.value,
    'inLanguage': localeProperties.value.language,
    'publisher': {
      '@id': personId,
    },
  }),
  definePerson({
    '@id': personId,
    '@type': 'Person',
    'name': navbarData.homeTitle,
    'alternateName': 'Hsieh Yao Tsu',
    'url': baseUrl.value,
    'image': `${baseUrl.value}me.jpg`,
    'description': seoData.description,
    'email': seoData.email,
    'sameAs': [
      seoData.twitterLink,
      seoData.instagramLink,
      seoData.githubLink,
    ],
    'jobTitle': 'Frontend Engineer',
    // 'worksFor': {
    //   '@type': 'Organization',
    //   'name': 'Mercury Fire',
    //   'url': `${seoData.jobCompany}/`,
    // },
    'inLanguage': ['en-US', 'zh-TW', 'ja-JP'],
  }),
])
</script>

<template>
  <NuxtLoadingIndicator :throttle="0" />

  <!-- // TODO: Check what i can do more with this. -->
  <NuxtRouteAnnouncer />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
