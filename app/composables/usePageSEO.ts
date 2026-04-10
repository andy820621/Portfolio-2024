import type { OgImageComponents } from '#og-image/components'
import { getKeywords, navbarData, seoData } from '~~/data'

interface PageSeoOptions {
  alt?: string
  title?: string
  description?: string
  image?: string
  ogImage?: SeoOgImageValue
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
  const pageTitle = computed(() => options.title || seoData.ogTitle)

  const pageDescription = computed(() => options.description || seoData.description)

  // 計算完整的規範連結
  const { locale } = useI18n()
  const { baseUrl } = useUrl()

  const pageKeywords = computed(() => {
    if (Array.isArray(options.keywords) || typeof options.keywords === 'string')
      return getKeywords(locale.value, options.keywords)
    return getKeywords(locale.value)
  })

  const ogImageUrl = computed(() => {
    if (options.noIndex)
      return undefined

    return resolveStaticOgImageUrl(baseUrl.value, options.ogImage, options.image)
  })

  const ogImageAlt = computed(() => {
    if (options.noIndex || !ogImageUrl.value)
      return undefined

    return resolveOgImageAlt(options.ogImage, options.alt, pageTitle.value)
  })

  // SEO 元數據
  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    robots: () => options.noIndex ? 'noindex, nofollow' : 'index, follow',
    twitterCard: 'summary_large_image',
    ogImage: ogImageUrl,
    ogImageAlt,
    twitterImage: ogImageUrl,
    twitterImageAlt: ogImageAlt,
    ...(options.addModifiedTime && {
      articleModifiedTime: getSitemapDateFormat(Date.now()),
    }),
  })

  // 確保 OG 圖片在 Server 端生成
  if (import.meta.server && !options.noIndex && !ogImageUrl.value) {
    const dynamicOgImage = resolveDynamicOgImageDefinition(options.ogImage)

    if (dynamicOgImage) {
      defineOgImage(dynamicOgImage.component as keyof OgImageComponents, {
        title: pageTitle.value,
        description: pageDescription.value,
        ...dynamicOgImage.props,
      }, {
        alt: ogImageAlt.value,
      })
    }
    else if (!isOgImageDisabled(options.ogImage)) {
      defineOgImage('SiteSeo', {
        title: pageTitle.value,
        description: pageDescription.value,
        siteName: navbarData.homeTitle,
      }, {
        alt: ogImageAlt.value,
      })
    }
  }

  return {
    pageTitle,
    pageDescription,
  }
}
