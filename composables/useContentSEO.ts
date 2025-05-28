import { seoData } from '~/data'

interface ContentData {
  title?: string
  description?: string
  image?: string
  ogImage?: string
  noIndex?: boolean
}

export function useContentSEO(data: ComputedRef<ContentData & { tags?: string[] }>) {
  const pageTitle = computed(() => {
    const title = data.value.title
    return title || seoData.ogTitle
  })

  const pageDescription = computed(() =>
    data.value.description || seoData.description,
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

  const { baseUrl, fullPath } = useUrl()

  // SEO 元數據
  useSeoMeta({
    title: pageTitle.value,
    description: pageDescription,
    keywords: mergedKeywords.value,
    robots: data.value.noIndex ? 'noindex, nofollow' : 'index, follow',
  })

  // OG 圖片
  if (!data.value.noIndex) {
    defineOgImageComponent('Nuxt', {
      url: fullPath.value,
      headline: seoData.ogHeadline,
      title: pageTitle.value,
      description: pageDescription.value,
      siteName: baseUrl.value,
    })
  }

  return {
    pageTitle,
    pageDescription,
  }
}
