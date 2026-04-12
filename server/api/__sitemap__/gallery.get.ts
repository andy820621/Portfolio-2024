import type { SitemapUrl } from '#sitemap/types'
import type { GalleryAlbum } from '~/utils/galleryCollection'
import { queryCollection } from '@nuxt/content/server'
import { sortGalleryAlbums } from '~/utils/galleryCollection'
import { encodeUrlPath } from '~/utils/pathUtils'

export default defineSitemapEventHandler(async (event) => {
  // Nuxt i18n v10 移轉：i18n 選項不再暴露在 runtimeConfig。
  // 與 `nuxt.config.ts` 保持一致，若調整 i18n 設定請同步更新此處。
  const i18nStrategy = 'prefix_except_default' as const
  const defaultLocale = 'en' as const
  const galleryGroups = sortGalleryAlbums(
    await queryCollection(event, 'gallery')
      .where('published', '=', true)
      .all() as unknown as GalleryAlbum[],
  )

  const entries: SitemapUrl[] = []

  for (const album of galleryGroups) {
    const defaultPath = `/gallery/${album.albumId}`
    const zhPath = `/zh/gallery/${album.albumId}`
    const encodedCoverImage = album.coverImage
      ? encodeUrlPath(album.coverImage.startsWith('/') ? album.coverImage : `/${album.coverImage}`)
      : undefined

    // 默認語言
    entries.push({
      loc: defaultPath,
      changefreq: 'weekly',
      priority: 0.8,
      ...(encodedCoverImage && {
        images: [{
          loc: encodedCoverImage,
          title: album.title,
          caption: album.description || `${album.title} gallery`,
        }],
      }),
    })

    // 僅當策略不是 prefix_except_default 時才生成帶前綴的英文版
    if (i18nStrategy !== 'prefix_except_default' || defaultLocale !== 'en') {
      entries.push({
        loc: `/en/gallery/${album.albumId}`,
        changefreq: 'weekly',
        priority: 0.8,
        ...(encodedCoverImage && {
          images: [{
            loc: encodedCoverImage,
            title: album.title,
            caption: album.description || `${album.title} gallery`,
          }],
        }),
      })
    }

    // 非默認語言總是生成前綴版本
    entries.push({
      loc: zhPath,
      changefreq: 'weekly',
      priority: 0.8,
      ...(encodedCoverImage && {
        images: [{
          loc: encodedCoverImage,
          title: album.chTitle || album.title,
          caption: album.description || `${album.title} gallery`,
        }],
      }),
    })
  }

  return entries
})
