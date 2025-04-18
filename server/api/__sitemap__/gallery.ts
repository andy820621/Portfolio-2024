import type { SitemapUrl } from '#sitemap/types'
import { defineSitemapEventHandler } from '#imports'
import { galleryGroups } from '~/data/galleryData'
import { getSitemapDateFormat } from '~/utils/dayjs'

export default defineSitemapEventHandler(() => {
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

    // 英文版
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

    // 中文版
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
