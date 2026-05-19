import { describe, expect, it } from 'vitest'

interface GalleryApiErrorInput {
  statusCode?: number
  statusMessage?: string
  message?: string
}

interface GalleryApiError extends Error {
  statusCode?: number
  statusMessage?: string
}

type DefineEventHandlerStub = <THandler extends (...args: any[]) => any>(handler: THandler) => THandler

async function loadGalleryImagesApi() {
  const globalScope = globalThis as typeof globalThis & {
    createError?: (input: GalleryApiErrorInput) => GalleryApiError
    defineEventHandler?: DefineEventHandlerStub
  }
  const defineEventHandlerStub: DefineEventHandlerStub = handler => handler

  globalScope.defineEventHandler ??= defineEventHandlerStub
  globalScope.createError ??= input => Object.assign(new Error(input.message ?? input.statusMessage ?? 'Error'), input)
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
