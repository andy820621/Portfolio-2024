import type { OgImageComponents } from '#og-image/components'
import { navbarData, seoData } from '~~/data'

interface ContentData {
  alt?: string
  title?: string
  description?: string
  seoTitle?: string
  seoDescription?: string
  image?: string
  ogImage?: SeoOgImageValue
  noIndex?: boolean
}

export function useContentSEO(data: ComputedRef<ContentData & { tags?: string[] }>) {
  const { baseUrl } = useUrl()

  const pageTitle = computed(() => {
    const title = data.value.seoTitle || data.value.title
    return title || seoData.ogTitle
  })

  const pageDescription = computed(() =>
    data.value.seoDescription || data.value.description || seoData.description,
  )

  const mergedKeywords = computed(() => {
    const tags = Array.isArray(data.value.tags) ? data.value.tags : []
    const allKeywords = Object.values(seoData.keywords).join(',').split(',').map(k => k.trim())
    const lowerSet = new Set<string>()
    const merged: string[] = []
    for (const k of [...allKeywords, ...tags]) {
      const lower = k.toLowerCase()
      if (!lowerSet.has(lower)) {
        lowerSet.add(lower)
        merged.push(k)
      }
    }
    return merged.join(', ')
  })

  const ogImageUrl = computed(() => {
    if (data.value.noIndex)
      return undefined

    return resolveStaticOgImageUrl(baseUrl.value, data.value.ogImage, data.value.image)
  })

  const ogImageAlt = computed(() => {
    if (data.value.noIndex || !ogImageUrl.value)
      return undefined

    return resolveOgImageAlt(data.value.ogImage, data.value.alt, pageTitle.value)
  })

  // SEO 元數據
  useSeoMeta({
    title: pageTitle,
    description: pageDescription,
    keywords: mergedKeywords,
    robots: () => data.value.noIndex ? 'noindex, nofollow' : 'index, follow',
    twitterCard: 'summary_large_image',
    twitterTitle: pageTitle,
    twitterDescription: pageDescription,
    ogImage: ogImageUrl,
    ogImageAlt,
    twitterImage: ogImageUrl,
    twitterImageAlt: ogImageAlt,
  })

  // OG 圖片
  if (import.meta.server && !data.value.noIndex && !ogImageUrl.value) {
    const dynamicOgImage = resolveDynamicOgImageDefinition(data.value.ogImage)

    if (dynamicOgImage) {
      defineOgImage(dynamicOgImage.component as keyof OgImageComponents, {
        title: pageTitle.value,
        description: pageDescription.value,
        ...dynamicOgImage.props,
      }, {
        alt: ogImageAlt.value,
      })
    }
    else if (!isOgImageDisabled(data.value.ogImage)) {
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
