<script setup lang="ts">
import { navbarData, seoData } from './data'
import './assets/variable.css'
import '@unocss/reset/tailwind.css'
import './assets/main.scss'
import './assets/markdown.css'
import './assets/prose.css'

const { localeProperties } = useI18n()
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
