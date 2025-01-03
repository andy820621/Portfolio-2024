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

  const generateHrefLangLinks = () => {
    const links = []

    // x-default 使用根路徑
    links.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${config.public.siteUrl}${route.path}`,
    })

    locales.value.forEach((loc) => {
      const localeConfig = LOCALE_MAPPING[loc.code as keyof typeof LOCALE_MAPPING]

      if (localeConfig) {
        if (loc.code === 'en') {
          links.push({
            rel: 'alternate',
            hreflang: localeConfig.hreflang,
            href: `${config.public.siteUrl}${route.path}`,
          })

          links.push({
            rel: 'alternate',
            hreflang: localeConfig.hreflang,
            href: `${config.public.siteUrl}/en${route.path}`,
          })
        }
        else {
          links.push({
            rel: 'alternate',
            hreflang: localeConfig.hreflang,
            href: `${config.public.siteUrl}${localeConfig.path}${route.path}`,
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
