<script setup lang="ts">
// import { seoData } from './data'
import './assets//variable.css'
import '@unocss/reset/tailwind.css'
import './assets//main.scss'
import './assets//markdown.css'
import './assets//prose.css'

// const config = useRuntimeConfig()
// defineOgImage({
//   url: config.public.i18n.baseUrl || seoData.mySite,
//   renderer: 'chromium',
//   props: {
//     title: seoData.mySite,
//     description: seoData.description,
//     siteName: config.public.i18n.baseUrl || seoData.mySite,
//   },
// })

useSchemaOrg([
  defineWebPage({
    '@id': 'https://barz.app/#webpage',
    '@type': 'WebPage',
    'description': 'BarZ Hsieh\'s Portfolio',
    'name': 'BarZ Hsieh\'s Personal Portfolio Website',
    'url': 'https://barz.app/',
    'about': {
      '@id': 'https://barz.app/#identity',
    },
    'author': {
      '@type': 'Person',
      'name': 'BarZ Hsieh',
    },
    'inLanguage': [
      'en',
      'en-US',
      'zh-TW',
    ],
    'isPartOf': {
      '@id': 'https://barz.app/#website',
    },
    'potentialAction': [
      {
        '@type': 'ReadAction',
        'target': [
          'https://barz.app',
        ],
      },
    ],
  }),
  defineWebSite({
    '@id': 'https://barz.app/#website',
    '@type': 'WebSite',
    'author': 'BarZ Hsieh',
    'name': 'BarZ Hsieh\'s Personal Portfolio Website',
    'url': 'https://barz.app/',
    'inLanguage': [
      'en',
      'en-US',
      'zh-TW',
    ],
    'publisher': {
      '@id': 'https://barz.app/#identity',
    },
  }),
  definePerson({
    '@id': 'https://barz.app/#identity',
    '@type': 'Person',
    'name': 'BarZ Hsieh',
    'url': 'https://barz.app/',
    'email': 'andy820621@gmail.com',
    'sameAs': [
      'https://www.twitter.com/BarZ3064',
      'https://www.instagram.com/andy820621',
      'https://github.com/andy820621',
    ],
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
