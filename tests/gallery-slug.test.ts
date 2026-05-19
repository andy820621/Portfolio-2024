import type { GallerySlugAlbum } from '../app/utils/gallerySlug.ts'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import YAML from 'yaml'
import {
  buildGalleryAlbumPath,
  findGalleryAlbumByRouteSegment,
  isValidGallerySlug,
  validateGallerySlugs,
} from '../app/utils/gallerySlug.ts'

interface GalleryFixture {
  albumId: string
  slug?: string
  title: string
  coverImage?: string
}

interface GallerySlugFixture extends GallerySlugAlbum {
  title: string
  coverImage?: string
}

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const galleryDir = join(projectRoot, 'content/gallery')

function loadGalleryFixtures() {
  return readdirSync(galleryDir)
    .filter(file => file.endsWith('.yml'))
    .map((file) => {
      const content = readFileSync(join(galleryDir, file), 'utf8')
      return YAML.parse(content) as GalleryFixture
    })
}

function hasGallerySlug(album: GalleryFixture): album is GallerySlugFixture {
  return isValidGallerySlug(album.slug)
}

describe('gallery slugs', () => {
  const albums = loadGalleryFixtures()
  const sluggedAlbums = albums.filter(hasGallerySlug)

  it('requires every gallery album to define a valid unique slug', () => {
    expect(sluggedAlbums).toHaveLength(albums.length)

    expect(() => validateGallerySlugs(sluggedAlbums)).not.toThrow()
  })

  it('builds lowercase canonical album paths', () => {
    expect(buildGalleryAlbumPath('blossoms-and-kids')).toBe('/gallery/blossoms-and-kids/')
    expect(buildGalleryAlbumPath('chasing-blossoms', '/zh')).toBe('/zh/gallery/chasing-blossoms/')
  })

  it('resolves legacy route segments to explicit slugs', () => {
    expect(findGalleryAlbumByRouteSegment(sluggedAlbums, 'Chasing Blossoms')?.slug).toBe('chasing-blossoms')
    expect(findGalleryAlbumByRouteSegment(sluggedAlbums, 'chasing blossoms')?.slug).toBe('chasing-blossoms')
    expect(findGalleryAlbumByRouteSegment(sluggedAlbums, 'Chasing%20Blossoms')?.slug).toBe('chasing-blossoms')
    expect(findGalleryAlbumByRouteSegment(sluggedAlbums, 'Blossoms & Kids')?.slug).toBe('blossoms-and-kids')
    expect(findGalleryAlbumByRouteSegment(sluggedAlbums, 'blossoms-and-kids')?.albumId).toBe('Blossoms & Kids')
  })

  it('keeps gallery image assets keyed by albumId, not slug', () => {
    for (const album of albums) {
      expect(existsSync(join(projectRoot, 'public/gallery-images', album.albumId))).toBe(true)
      expect(existsSync(join(projectRoot, 'public/gallery-images', `${album.albumId}.webp`))).toBe(true)

      if (album.coverImage)
        expect(album.coverImage).toBe(`/gallery-images/${album.albumId}.webp`)
    }
  })

  it('fails fast when a route alias points to multiple albums', () => {
    expect(() => validateGallerySlugs([
      { albumId: 'Chasing Blossoms', slug: 'chasing-blossoms' },
      { albumId: 'Other Album', slug: 'chasing blossoms' },
    ])).toThrow(/Invalid gallery slug/)

    expect(() => validateGallerySlugs([
      { albumId: 'Chasing Blossoms', slug: 'chasing-blossoms' },
      { albumId: 'Different Album', slug: 'different-album' },
      { albumId: 'chasing-blossoms', slug: 'legacy-collision' },
    ])).toThrow(/Gallery route alias collision/)
  })
})
