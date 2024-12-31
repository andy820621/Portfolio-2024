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
}

export function usePageSeo(options: PageSeoOptions = {}) {
  const route = useRoute()
  const { t } = useI18n()

  const pageTitle = computed(() =>
    options.title
    || t(`pages.${String(route.name)}.title`, ''),
  )

  const pageDescription = computed(() =>
    options.description
    || t(`pages.${String(route.name)}.description`, ''),
  )

  // 生成默認的替代語言鏈接
  const defaultAlternateLinks = computed(() => ([
    {
      rel: 'alternate',
      hreflang: 'en-US',
      href: `${seoData.mySite}/en${useRoute().path}`,
    },
    {
      rel: 'alternate',
      hreflang: 'zh-TW',
      href: `${seoData.mySite}/zh${useRoute().path}`,
    },
  ]))

  // 合併自定義和默認的替代鏈接
  const alternateLinks = [
    ...(options.alternateLinks || []),
    ...defaultAlternateLinks.value,
  ]

  // SEO 元數據
  useSeoMeta({
    title: pageTitle.value,
    description: pageDescription.value,
    robots: options.noIndex ? 'noindex, nofollow' : 'index, follow',
  })

  // OG 圖片
  defineOgImage({
    props: {
      title: pageTitle.value,
      description: pageDescription.value,
      siteName: seoData.mySite,
    },
  })

  useHead({
    link: [
      {
        rel: 'canonical',
        href: `${seoData.mySite}${route.path}`,
      },
      ...alternateLinks,
    ],
  })

  return {
    pageTitle,
    pageDescription,
  }
}
