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
    return title ? `${title} | BarZ Hsieh` : seoData.mySite
  })

  const pageDescription = computed(() =>
    data.value.description || seoData.description,
  )

  const hreflangLinks = computed(() => generateHrefLangLinks())

  // 計算完整的規範連結
  const baseUrl = config.public.i18n.baseUrl || seoData.mySite
  const canonicalUrl = computed(() => `${baseUrl}${route.path}`)

  // SEO 元數據
  useSeoMeta({
    title: pageTitle.value,
    description: pageDescription,
    robots: data.value.noIndex ? 'noindex, nofollow' : 'index, follow',
  })

  // OG 圖片
  if (!data.value.noIndex) {
    defineOgImage({
      url: baseUrl,
      renderer: 'chromium',
      props: {
        title: pageTitle.value,
        description: pageDescription.value,
        siteName: baseUrl,
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
