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
  const route = useRoute()
  const config = useRuntimeConfig()
  const baseUrl = config.public.i18n.baseUrl

  const generateHrefLangLinks = () => {
    const links = []

    // 添加 x-default 連結
    links.push({
      rel: 'alternate',
      hreflang: 'x-default',
      href: `${baseUrl}/`, // 始終指向網站根目錄
    })

    locales.value.forEach((loc) => {
      const localeConfig = LOCALE_MAPPING[loc.code as keyof typeof LOCALE_MAPPING]

      if (localeConfig) {
        if (loc.code === 'en') {
          // 對於預設語言(英文)，生成不帶前綴的連結
          links.push({
            rel: 'alternate',
            hreflang: localeConfig.hreflang,
            href: `${baseUrl}${route.path}`,
          })
        }
        else {
          // 非預設語言添加對應前綴
          links.push({
            rel: 'alternate',
            hreflang: localeConfig.hreflang,
            href: `${baseUrl}${localeConfig.path}${route.path}`,
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
