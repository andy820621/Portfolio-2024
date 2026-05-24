import { queryCollection } from '@nuxt/content/server'

interface GallerySitemapItem {
  slug: string
  updatedAt?: string | Date
}

export default defineSitemapEventHandler(async (event) => {
  const albums = await queryCollection(event, 'gallery')
    .where('published', '=', true)
    .all() as unknown as GallerySitemapItem[]

  return albums.map(album => ({
    loc: `/gallery/${album.slug}`,
    lastmod: album.updatedAt ? new Date(album.updatedAt).toISOString() : undefined,
    _i18nTransform: true,
  }))
})
