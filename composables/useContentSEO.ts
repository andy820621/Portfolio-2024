import { seoData } from '~/data'

interface ContentData {
  title?: string
  description?: string
  image?: string
  ogImage?: string
  noIndex?: boolean
}

export function useContentSEO(data: ComputedRef<ContentData>) {
  const pageTitle = computed(() => {
    const title = data.value.title
    return title || seoData.ogTitle
  })

  const pageDescription = computed(() =>
    data.value.description || seoData.description,
  )

  const { baseUrl, fullPath } = useUrl()

  // SEO 元數據
  useSeoMeta({
    title: pageTitle.value,
    description: pageDescription,
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
