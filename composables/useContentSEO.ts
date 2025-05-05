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
  const config = useRuntimeConfig()

  const pageTitle = computed(() => {
    const title = data.value.title
    return title || seoData.ogTitle
  })

  const pageDescription = computed(() =>
    data.value.description || seoData.description,
  )

  // 計算完整的規範連結
  const baseUrl = config.public.i18n.baseUrl || seoData.mySite
  const routePath = route.path.startsWith('/') ? route.path : `/${route.path}`
  const canonicalUrl = computed(() => `${baseUrl}${routePath.replace(/\/$/, '')}`)

  // SEO 元數據
  useSeoMeta({
    title: pageTitle.value,
    description: pageDescription,
    robots: data.value.noIndex ? 'noindex, nofollow' : 'index, follow',
  })

  // OG 圖片
  if (!data.value.noIndex) {
    defineOgImageComponent('Nuxt', {
      url: config.public.i18n.baseUrl || seoData.mySite,
      headline: seoData.ogHeadline,
      title: pageTitle.value,
      description: pageDescription.value,
      siteName: baseUrl,
    })
  }

  return {
    pageTitle,
    pageDescription,
    canonicalUrl,
  }
}
