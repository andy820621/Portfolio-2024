const LOCALE_MAPPING = {
  en: {
    hreflang: 'en-US',
    path: '',
  },
  zh: { // 修正：從 'zh-TW' 改為 'zh'
    hreflang: 'zh-TW',
    path: '/zh',
  },
} as const

export function useHrefLang() {
  const { locales } = useI18n()
  const { fullPath } = useUrl()

  function generateHrefLangLinks() {
    const links = []

    // 添加 x-default 連結
    links.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: fullPath.value,
    })

    locales.value.forEach((loc) => {
      const localeConfig = LOCALE_MAPPING[loc.code as keyof typeof LOCALE_MAPPING]

      if (localeConfig) {
        if (loc.code === 'en') {
          links.push({
            rel: 'alternate',
            hreflang: localeConfig.hreflang,
            href: fullPath.value,
          })
        }
        else {
          links.push({
            rel: 'alternate',
            hreflang: localeConfig.hreflang,
            href: fullPath.value,
          })
        }
      }
    })

    // 去除重複的連結
    // return links.filter((link, index, self) =>
    //   index === self.findIndex(t => t.href === link.href),
    // )

    return links
  }

  return {
    generateHrefLangLinks,
  }
}
