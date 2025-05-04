import { seoData } from '~/data'

interface PageSeoOptions {
  title?: string
  description?: string
  image?: string
  ogImage?: string
  noIndex?: boolean
  alternateLinks?: {
    hreflang: string
    href: string
  }[]
  addModifiedTime?: boolean
}

export function usePageSeo(options: PageSeoOptions = {}) {
  const route = useRoute()
  const { locale } = useI18n()
  const config = useRuntimeConfig()
  // const { generateHrefLangLinks } = useHrefLang()

  // 計算完整的頁面標題
  const pageTitle = computed(() => options.title || seoData.ogTitle)

  const pageDescription = computed(() =>
    options.description
    || seoData.description,
  )

  // const hreflangLinks = computed(() => generateHrefLangLinks())

  // 計算完整的規範連結
  const baseUrl = config.public.i18n.baseUrl || seoData.mySite
  const routePath = route.path.startsWith('/') ? route.path : `/${route.path}`
  const canonicalUrl = computed(() => `${baseUrl}${routePath}`)

  // SEO 元數據
  useSeoMeta({
    title: pageTitle.value,
    description: pageDescription.value,
    robots: options.noIndex ? 'noindex, nofollow' : 'index, follow',
    ...(options.addModifiedTime && {
      articleModifiedTime: getSitemapDateFormat(Date.now()),
    }),
  })

  // 確保 OG 圖片在 Server 端生成
  if (import.meta.server && !options.noIndex) {
    defineOgImageComponent('Nuxt', {
      url: config.public.i18n.baseUrl || seoData.mySite,
      headline: seoData.ogHeadline,
      title: pageTitle.value,
      description: pageDescription.value,
      siteName: baseUrl,
    })
  }

  useHead({
    htmlAttrs: {
      lang: locale.value,
    },
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl.value,
      },
      // ...hreflangLinks.value,
    ],
  })

  return {
    pageTitle,
    pageDescription,
    canonicalUrl,
  }
}
