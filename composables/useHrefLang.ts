import { seoData } from '~/data'

const LOCALE_MAPPING = {
  'en': {
    hreflang: 'en-US',
    path: '',
  },
  'zh-TW': {
    hreflang: 'zh-TW',
    path: '/zh',
  },
} as const

export function useHrefLang() {
  const { locales } = useI18n()
  const route = useRoute()
  const config = useRuntimeConfig()
  const baseUrl = config.public.i18n.baseUrl

  const generateHrefLangLinks = () => {
    const links = []

    // x-default 使用根路徑
    links.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${baseUrl}${route.path}`,
    })

    locales.value.forEach((loc) => {
      const localeConfig = LOCALE_MAPPING[loc.code as keyof typeof LOCALE_MAPPING]

      if (localeConfig) {
        if (loc.code === 'en') {
          links.push({
            rel: 'alternate',
            hreflang: localeConfig.hreflang,
            href: `${baseUrl}${route.path}`,
          })

          links.push({
            rel: 'alternate',
            hreflang: localeConfig.hreflang,
            href: `${baseUrl}/en${route.path}`,
          })
        }
        else {
          links.push({
            rel: 'alternate',
            hreflang: localeConfig.hreflang,
            href: `${baseUrl}${localeConfig.path}${route.path}`,
          })
        }
      }
    })

    // 去除重複的連結
    return links.filter((link, index, self) =>
      index === self.findIndex(t => t.href === link.href),
    )
  }

  return {
    generateHrefLangLinks,
  }
}
