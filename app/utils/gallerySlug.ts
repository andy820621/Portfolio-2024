import { decodeRouteParam } from './pathUtils'

export interface GallerySlugAlbum {
  albumId: string
  slug: string
}

const GALLERY_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidGallerySlug(slug: unknown): slug is string {
  return typeof slug === 'string' && GALLERY_SLUG_REGEX.test(slug)
}

export function buildGalleryAlbumPath(slug: string, localePrefix = '') {
  const normalizedPrefix = localePrefix && localePrefix !== '/'
    ? `/${localePrefix.replace(/^\/|\/$/g, '')}`
    : ''

  return `${normalizedPrefix}/gallery/${slug}/`
}

export function validateGallerySlugs(albums: GallerySlugAlbum[]) {
  const seen = new Map<string, string>()

  for (const album of albums) {
    if (!isValidGallerySlug(album.slug)) {
      throw new Error(`Invalid gallery slug for album "${album.albumId}": ${album.slug}`)
    }

    const existingAlbumId = seen.get(album.slug)
    if (existingAlbumId) {
      throw new Error(`Duplicate gallery slug "${album.slug}" for albums "${existingAlbumId}" and "${album.albumId}"`)
    }

    seen.set(album.slug, album.albumId)
  }

  createGalleryRouteAliasMap(albums)
}

export function normalizeGalleryRouteSegment(segment: string) {
  return decodeRouteParam(segment).trim()
}

export function createGalleryRouteAliasMap<T extends GallerySlugAlbum>(albums: T[]) {
  const aliases = new Map<string, T>()

  for (const album of albums) {
    const albumId = normalizeGalleryRouteSegment(album.albumId)

    registerGalleryRouteAlias(aliases, album.slug, album)
    registerGalleryRouteAlias(aliases, albumId, album)
    registerGalleryRouteAlias(aliases, albumId.toLocaleLowerCase(), album)
  }

  return aliases
}

function registerGalleryRouteAlias<T extends GallerySlugAlbum>(
  aliases: Map<string, T>,
  alias: string,
  album: T,
) {
  const normalizedAlias = normalizeGalleryRouteSegment(alias)

  if (!normalizedAlias)
    return

  const existingAlbum = aliases.get(normalizedAlias)

  if (existingAlbum && (existingAlbum.albumId !== album.albumId || existingAlbum.slug !== album.slug)) {
    throw new Error(
      `Gallery route alias collision: "${normalizedAlias}" maps to "${existingAlbum.albumId}" and "${album.albumId}"`,
    )
  }

  aliases.set(normalizedAlias, album)
}

export function findGalleryAlbumByRouteSegment<T extends GallerySlugAlbum>(
  albums: T[],
  segment: string,
) {
  const normalizedSegment = normalizeGalleryRouteSegment(segment)
  const aliases = createGalleryRouteAliasMap(albums)

  return aliases.get(normalizedSegment)
    ?? aliases.get(normalizedSegment.toLocaleLowerCase())
    ?? null
}
