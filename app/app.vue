<script setup lang="ts">
import { createPersonIdentity, navbarData } from '~~/data'
import './assets/variable.css'
import '@unocss/reset/tailwind.css'
import './assets/main.scss'
import './assets/markdown.css'
import './assets/prose.css'

const localeHead = useLocaleHead({
  dir: true, // old: addDirAttributes
  seo: true, // old: addSeoAttributes
})
const { localeProperties } = useI18n()
const { route, baseUrl } = useUrl()

const links = localeHead.value.link?.map(link => ({
  ...link,
  href: trailingSlashUrlOrNot(link.href),
})) || []

const metas = localeHead.value.meta?.map((meta) => {
  // 只對 URL 類型的 meta 標籤添加斜線
  if (meta.property === 'og:url' || meta.name === 'canonical' || meta.name === 'twitter:url') {
    return {
      ...meta,
      content: trailingSlashUrlOrNot(meta.content),
    }
  }
  return meta
}) || []

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
  link: links,
  meta: metas,
  // script: [
  //   { src: 'https://platform.twitter.com/widgets.js', async: true, charset: 'utf-8' },
  // ],
})

const siteBaseUrl = trailingSlashUrlOrNot(baseUrl.value, false)
const websiteId = `${siteBaseUrl}#website`
const personId = `${siteBaseUrl}#identity`

useSchemaOrg([
  defineWebSite({
    '@id': websiteId,
    '@type': 'WebSite',
    'name': 'BarZ Hsieh\'s Personal Portfolio Website',
    'url': siteBaseUrl,
    'inLanguage': localeProperties.value.language,
    'publisher': {
      '@id': personId,
    },
  }),
  definePerson({
    '@id': personId,
    '@type': 'Person',
    ...createPersonIdentity({
      baseUrl: siteBaseUrl,
      imagePath: '/me.jpg',
    }),
    // 'worksFor': {
    //   '@type': 'Organization',
    //   'name': 'Mercury Fire',
    //   'url': `${seoData.jobCompany}/`,
    // },
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
