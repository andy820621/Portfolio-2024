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
const { path } = useRoute()

useHead({
  htmlAttrs: localeHead.value.htmlAttrs,
  // `%s` means The current page title., `%separator` defaults to a pipe character `|`
  titleTemplate: `%s %separator %siteName`,
  templateParams: {
    separator: '-',
    siteName: navbarData.homeTitle,
    schemaOrg: {
      host: seoData.mySite,
      path,
      inLanguage: 'en',
    },
  },
  link: [...(localeHead.value.link || [])],
  meta: [...(localeHead.value.meta || [])],
  // script: [
  //   { src: 'https://platform.twitter.com/widgets.js', async: true, charset: 'utf-8' },
  // ],
})

const websiteId = `${seoData.mySite}#website`
const personId = `${seoData.mySite}#identity`

useSchemaOrg([
  defineWebSite({
    '@id': websiteId,
    '@type': 'WebSite',
    'name': 'BarZ Hsieh\'s Personal Portfolio Website',
    'url': `${seoData.mySite}/`,
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
    'url': process.env.I18N_BASE_URL,
    'image': `${seoData.mySite}/me.jpg`,
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
