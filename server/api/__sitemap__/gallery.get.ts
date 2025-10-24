import type { SitemapUrl } from '#sitemap/types'
import { galleryGroups } from '~/data/galleryData'
import { getSitemapDateFormat } from '~/utils/dayjs'

export default defineSitemapEventHandler(() => {
  // 獲取配置以檢查 i18n 策略
  const config = useRuntimeConfig()
  const i18nStrategy = config.public.i18n?.strategy || 'prefix_except_default'
  const defaultLocale = config.public.i18n?.defaultLocale || 'en'

  const lastmod = getSitemapDateFormat(Date.now())
  const entries: SitemapUrl[] = []

  for (const album of galleryGroups) {
    // 默認語言
    entries.push({
      loc: `/gallery/${album.id}`,
      lastmod,
      changefreq: 'weekly',
      priority: 0.8,
      ...(album.coverImage && {
        images: [{
          loc: album.coverImage.startsWith('/') ? album.coverImage : `/${album.coverImage}`,
          title: album.title,
          caption: album.description || `${album.title} gallery`,
        }],
      }),
    })

    // 僅當策略不是 prefix_except_default 時才生成帶前綴的英文版
    if (i18nStrategy !== 'prefix_except_default' || defaultLocale !== 'en') {
      entries.push({
        loc: `/en/gallery/${album.id}`,
        lastmod,
        changefreq: 'weekly',
        priority: 0.8,
        ...(album.coverImage && {
          images: [{
            loc: album.coverImage.startsWith('/') ? album.coverImage : `/${album.coverImage}`,
            title: album.title,
            caption: album.description || `${album.title} gallery`,
          }],
        }),
      })
    }

    // 非默認語言總是生成前綴版本
    entries.push({
      loc: `/zh/gallery/${album.id}`,
      lastmod,
      changefreq: 'weekly',
      priority: 0.8,
      ...(album.coverImage && {
        images: [{
          loc: album.coverImage.startsWith('/') ? album.coverImage : `/${album.coverImage}`,
          title: album.chTitle || album.title,
          caption: album.description || `${album.title} gallery`,
        }],
      }),
    })
  }

  return entries
})
