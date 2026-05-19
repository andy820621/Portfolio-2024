import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  getGalleryImagesDevContentType,
  resolveGalleryImagesDevFilePath,
} from '../server/middleware/gallery-images-dev.ts'

describe('gallery images dev middleware helpers', () => {
  it('decodes encoded public gallery image paths without changing image URLs', () => {
    const filePath = resolveGalleryImagesDevFilePath('/gallery-images/Sakura%20Park.webp')

    expect(filePath).toBeTruthy()
    expect(filePath).toContain('public/gallery-images/Sakura Park.webp')
    expect(existsSync(filePath!)).toBe(true)
  })

  it('decodes encoded album folder paths with spaces and ampersands', () => {
    const filePath = resolveGalleryImagesDevFilePath('/gallery-images/Blossoms%20%26%20Kids/Yasukuni%20Shrine_4.webp')

    expect(filePath).toBeTruthy()
    expect(filePath).toContain('public/gallery-images/Blossoms & Kids/Yasukuni Shrine_4.webp')
    expect(existsSync(filePath!)).toBe(true)
  })

  it('rejects path traversal outside public gallery images', () => {
    expect(resolveGalleryImagesDevFilePath('/gallery-images/..%2F..%2Fpackage.json')).toBeNull()
  })

  it('serves only supported image content types', () => {
    expect(getGalleryImagesDevContentType('/gallery-images/Sakura Park.webp')).toBe('image/webp')
    expect(getGalleryImagesDevContentType('/gallery-images/example.txt')).toBeUndefined()
  })
})
