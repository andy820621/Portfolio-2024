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

const paginationPage = computed(() => {
  const rawPage = route.query.page
  const firstValue = Array.isArray(rawPage) ? rawPage[0] : rawPage
  const parsed = firstValue ? Number.parseInt(firstValue, 10) : 1
  return Number.isFinite(parsed) && parsed > 1 ? String(parsed) : undefined
})

function withPaginationQuery(href: string) {
  const page = paginationPage.value
  if (!page)
    return href

  try {
    const parsed = new URL(href, baseUrl.value)
    parsed.searchParams.set('page', page)
    const normalizedPath = trailingSlashUrlOrNot(parsed.pathname)
    const isAbsolute = /^[a-z][\w+\-.]*:\/\//i.test(href)

    if (isAbsolute)
      return `${parsed.origin}${normalizedPath}${parsed.search}${parsed.hash}`

    return `${normalizedPath}${parsed.search}${parsed.hash}`
  }
  catch {
    return href
  }
}

const links = computed(() => localeHead.value.link?.map((link) => {
  const normalizedHref = trailingSlashUrlOrNot(link.href)

  if (link.rel === 'alternate') {
    return {
      ...link,
      href: withPaginationQuery(normalizedHref),
    }
  }

  return {
    ...link,
    href: normalizedHref,
  }
}) || [])

const metas = computed(() => localeHead.value.meta?.map((meta) => {
  // 只對 URL 類型的 meta 標籤添加斜線
  if (meta.property === 'og:url' || meta.name === 'canonical' || meta.name === 'twitter:url') {
    return {
      ...meta,
      content: trailingSlashUrlOrNot(meta.content),
    }
  }
  return meta
}) || [])

useHead({
  htmlAttrs: localeHead.value.htmlAttrs,
  // `%s` means The current page title., `%separator` defaults to a pipe character `|`
  titleTemplate: `%s %separator %siteName`,
  templateParams: {
    separator: '-',
    siteName: navbarData.homeTitle,
    schemaOrg: {
      host: normalizeBaseSiteUrl(baseUrl.value),
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

const siteBaseUrl = normalizeBaseSiteUrl(baseUrl.value)
const websiteId = buildSchemaNodeId(baseUrl.value, 'website')
const personId = buildSchemaNodeId(baseUrl.value, 'identity')

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
