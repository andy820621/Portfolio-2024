import { describe, expect, it } from 'vitest'

async function loadGalleryImagesApi() {
  globalThis.defineEventHandler ??= (handler => handler) as typeof defineEventHandler
  return import('../server/api/gallery-images.get.ts')
}

describe('gallery images API helpers', () => {
  it('preserves albumId image lookup and existing encoded image URLs', async () => {
    const { resolveGalleryImageUrls } = await loadGalleryImagesApi()
    const imageUrls = resolveGalleryImageUrls('Blossoms & Kids')

    expect(imageUrls.length).toBeGreaterThan(0)
    expect(imageUrls[0]?.startsWith('/gallery-images/Blossoms%20%26%20Kids/')).toBe(true)
  })

  it('throws a 404-style error for unknown albums', async () => {
    const { resolveGalleryImageUrls } = await loadGalleryImagesApi()

    expect(() => resolveGalleryImageUrls('__missing_album__')).toThrowError(
      expect.objectContaining({ statusCode: 404 }),
    )
  })
})
