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
  it('preserves albumId image lookup, existing encoded image URLs, and intrinsic dimensions', async () => {
    const { resolveGalleryImageAssets } = await loadGalleryImagesApi()
    const imageAssets = resolveGalleryImageAssets('Blossoms & Kids')

    expect(imageAssets.length).toBeGreaterThan(0)
    expect(imageAssets[0]).toEqual(expect.objectContaining({
      src: expect.stringMatching(/^\/gallery-images\/Blossoms & Kids\//),
      width: expect.any(Number),
      height: expect.any(Number),
    }))
  })

  it('throws a 404-style error for unknown albums', async () => {
    const { resolveGalleryImageAssets } = await loadGalleryImagesApi()

    expect(() => resolveGalleryImageAssets('__missing_album__')).toThrowError(
      expect.objectContaining({ statusCode: 404 }),
    )
  })
})
