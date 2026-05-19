import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

type DefineEventHandlerStub = <THandler extends (...args: any[]) => any>(handler: THandler) => THandler

async function loadGalleryImagesDevMiddleware() {
  const globalScope = globalThis as typeof globalThis & {
    defineEventHandler?: DefineEventHandlerStub
  }
  const defineEventHandlerStub: DefineEventHandlerStub = handler => handler

  globalScope.defineEventHandler ??= defineEventHandlerStub
  return import('../server/middleware/gallery-images-dev.ts')
}

describe('gallery images dev middleware helpers', () => {
  it('decodes encoded public gallery image paths without changing image URLs', async () => {
    const { resolveGalleryImagesDevFilePath } = await loadGalleryImagesDevMiddleware()
    const filePath = resolveGalleryImagesDevFilePath('/gallery-images/Sakura%20Park.webp')

    expect(filePath).toBeTruthy()
    expect(filePath).toContain('public/gallery-images/Sakura Park.webp')
    expect(existsSync(filePath!)).toBe(true)
  })

  it('decodes encoded album folder paths with spaces and ampersands', async () => {
    const { resolveGalleryImagesDevFilePath } = await loadGalleryImagesDevMiddleware()
    const filePath = resolveGalleryImagesDevFilePath('/gallery-images/Blossoms%20%26%20Kids/Yasukuni%20Shrine_4.webp')

    expect(filePath).toBeTruthy()
    expect(filePath).toContain('public/gallery-images/Blossoms & Kids/Yasukuni Shrine_4.webp')
    expect(existsSync(filePath!)).toBe(true)
  })

  it('rejects path traversal outside public gallery images', async () => {
    const { resolveGalleryImagesDevFilePath } = await loadGalleryImagesDevMiddleware()
    expect(resolveGalleryImagesDevFilePath('/gallery-images/..%2F..%2Fpackage.json')).toBeNull()
  })

  it('serves only supported image content types', async () => {
    const { getGalleryImagesDevContentType } = await loadGalleryImagesDevMiddleware()
    expect(getGalleryImagesDevContentType('/gallery-images/Sakura Park.webp')).toBe('image/webp')
    expect(getGalleryImagesDevContentType('/gallery-images/example.txt')).toBeUndefined()
  })
})
