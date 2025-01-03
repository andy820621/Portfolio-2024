import { seoData } from '~/data'

interface ContentData {
  title?: string
  description?: string
  image?: string
  ogImage?: string
  noIndex?: boolean
}

export function useContentSEO(data: ComputedRef<ContentData>) {
  const route = useRoute()
  const { locale } = useI18n()
  const config = useRuntimeConfig()
  const { generateHrefLangLinks } = useHrefLang()

  // 計算完整的頁面標題
  const pageTitle = computed(() => {
    const title = data.value.title
    return title ? `${title} | ${seoData.mySite}` : seoData.mySite
  })

  const pageDescription = computed(() =>
    data.value.description || seoData.description,
  )

  const hreflangLinks = computed(() => generateHrefLangLinks())

  // 計算完整的規範連結
  const canonicalUrl = computed(() => {
    const baseUrl = config.public.siteUrl || seoData.mySite
    return `${baseUrl}${route.path}`
  })

  // SEO 元數據
  useSeoMeta({
    title: pageTitle.value,
    description: pageDescription,
    robots: data.value.noIndex ? 'noindex, nofollow' : 'index, follow',
  })

  // OG 圖片
  if (!data.value.noIndex) {
    defineOgImage({
      url: seoData.mySite,
      renderer: 'chromium',
      props: {
        title: pageTitle.value,
        description: pageDescription.value,
        siteName: seoData.mySite,
      },
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
      ...hreflangLinks.value,
    ],
  })

  return {
    pageTitle,
    pageDescription,
    canonicalUrl,
  }
}
