import { getKeywords, seoData } from '~~/data'

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
  keywords?: string | string[]
}

export function usePageSeo(options: PageSeoOptions = {}) {
  // 計算完整的頁面標題
  const pageTitle = options.title || seoData.ogTitle

  const pageDescription = options.description || seoData.description

  // 計算完整的規範連結
  const { baseUrl, fullPath } = useUrl()
  const { locale } = useI18n()

  const pageKeywords = () => {
    if (Array.isArray(options.keywords) || typeof options.keywords === 'string')
      return getKeywords(locale.value, options.keywords)
    return getKeywords(locale.value)
  }

  // SEO 元數據
  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    robots: options.noIndex ? 'noindex, nofollow' : 'index, follow',
    ...(options.addModifiedTime && {
      articleModifiedTime: getSitemapDateFormat(Date.now()),
    }),
  })

  // 確保 OG 圖片在 Server 端生成
  if (import.meta.server && !options.noIndex) {
    defineOgImageComponent('Nuxt', {
      url: fullPath.value,
      headline: seoData.ogHeadline,
      title: pageTitle,
      description: pageDescription,
      siteName: baseUrl.value,
    })
  }

  return {
    pageTitle,
    pageDescription,
  }
}
