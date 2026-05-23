import type { DateLike } from '~~/types/main'
import type { OgImageComponents } from '#og-image/components'
import { getKeywords, navbarData, seoData } from '~~/data'

type MaybeReactive<T> = T | Ref<T> | (() => T)

interface PageSeoOptions {
  alt?: string
  title?: string
  description?: string
  image?: string
  ogImage?: SeoOgImageValue
  ogType?: 'website' | 'article'
  noIndex?: MaybeReactive<boolean>
  noIndexFollow?: MaybeReactive<boolean>
  alternateLinks?: {
    hreflang: string
    href: string
  }[]
  modifiedTime?: DateLike
  publishedTime?: DateLike
  keywords?: string | string[]
}

function resolveOption<T>(value: MaybeReactive<T> | undefined): T | undefined {
  if (typeof value === 'function')
    return (value as () => T)()

  return value === undefined ? undefined : unref(value)
}

function normalizeSitemapMetaDate(value?: DateLike) {
  if (!value)
    return undefined

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime()))
    return undefined

  return getSitemapDateFormat(date.getTime())
}

export function usePageSeo(options: PageSeoOptions = {}) {
  // 計算完整的頁面標題
  const pageTitle = computed(() => options.title || seoData.ogTitle)

  const pageDescription = computed(() => options.description || seoData.description)

  // 計算完整的規範連結
  const { locale } = useI18n()
  const { baseUrl, route } = useUrl()

  const pageKeywords = computed(() => {
    if (Array.isArray(options.keywords) || typeof options.keywords === 'string')
      return getKeywords(locale.value, options.keywords)
    return getKeywords(locale.value)
  })

  const ogImageUrl = computed(() => {
    if (resolveOption(options.noIndex) || resolveOption(options.noIndexFollow))
      return undefined

    return resolveStaticOgImageUrl(baseUrl.value, options.ogImage, options.image)
  })

  const ogImageAlt = computed(() => {
    if (resolveOption(options.noIndex) || resolveOption(options.noIndexFollow) || !ogImageUrl.value)
      return undefined

    return resolveOgImageAlt(options.ogImage, options.alt, pageTitle.value)
  })

  const ogUrl = computed(() => buildCanonicalSiteUrl(baseUrl.value, route.path))
  const ogType = computed(() => options.ogType || 'website')

  const publishedTime = computed(() => normalizeSitemapMetaDate(options.publishedTime))
  const modifiedTime = computed(() => normalizeSitemapMetaDate(options.modifiedTime))
  const robots = computed(() => {
    if (resolveOption(options.noIndexFollow))
      return 'noindex, follow'

    if (resolveOption(options.noIndex))
      return 'noindex, nofollow'

    return 'index, follow'
  })

  // SEO 元數據
  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    keywords: pageKeywords,
    robots,
    ogTitle: pageTitle,
    ogDescription: pageDescription,
    ogUrl,
    ogType,
    ogSiteName: navbarData.homeTitle,
    twitterCard: 'summary_large_image',
    twitterTitle: pageTitle,
    twitterDescription: pageDescription,
    ogImage: ogImageUrl,
    ogImageAlt,
    twitterImage: ogImageUrl,
    twitterImageAlt: ogImageAlt,
    articlePublishedTime: publishedTime,
    articleModifiedTime: modifiedTime,
  })

  // 確保 OG 圖片在 Server 端生成
  if (import.meta.server && !resolveOption(options.noIndex) && !resolveOption(options.noIndexFollow) && !ogImageUrl.value) {
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
