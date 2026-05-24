import { describe, expect, it } from 'vitest'
import { buildGalleryImagesMetadata, enrichGalleryAlbumsWithCoverDimensions } from '../app/utils/galleryImageMetadata'

describe('gallery image metadata helpers', () => {
  it('builds metadata entries keyed by unencoded public paths', () => {
    const metadata = buildGalleryImagesMetadata([
      '/gallery-images/Blossoms & Kids.webp',
      '/gallery-images/Blossoms & Kids/A 1.webp',
    ], (publicPath) => {
      if (publicPath.endsWith('Kids.webp'))
        return { width: 1200, height: 800 }

      return { width: 900, height: 1350 }
    })

    expect(metadata).toEqual({
      '/gallery-images/Blossoms & Kids.webp': { width: 1200, height: 800 },
      '/gallery-images/Blossoms & Kids/A 1.webp': { width: 900, height: 1350 },
    })
  })

  it('injects cover image dimensions into gallery albums when metadata exists', () => {
    const albums = [{
      albumId: 'blossoms-and-kids',
      slug: 'blossoms-and-kids',
      order: 1,
      title: 'Blossoms & Kids',
      coverImage: '/gallery-images/Blossoms & Kids.webp',
      tags: ['tokyo'],
      published: true,
    }]

    const enrichedAlbums = enrichGalleryAlbumsWithCoverDimensions(albums, {
      '/gallery-images/Blossoms & Kids.webp': { width: 1200, height: 800 },
    })

    expect(enrichedAlbums[0]).toEqual(expect.objectContaining({
      coverImageWidth: 1200,
      coverImageHeight: 800,
    }))
  })
})
