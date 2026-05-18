/* eslint-disable test/no-import-node-test */
import assert from 'node:assert/strict'
import test from 'node:test'

async function loadGalleryImagesApi() {
  globalThis.defineEventHandler ??= (handler => handler) as typeof defineEventHandler
  return import('../server/api/gallery-images.get.ts')
}

test('resolveGalleryImageUrls returns encoded image URLs for albums with spaces', async () => {
  const { resolveGalleryImageUrls } = await loadGalleryImagesApi()
  const imageUrls = resolveGalleryImageUrls('Blossoms & Kids')

  assert.ok(imageUrls.length > 0)
  assert.equal(imageUrls[0]?.startsWith('/gallery-images/Blossoms%20%26%20Kids/'), true)
})

test('resolveGalleryImageUrls throws a 404-style error for unknown albums', async () => {
  const { resolveGalleryImageUrls } = await loadGalleryImagesApi()

  assert.throws(
    () => resolveGalleryImageUrls('__missing_album__'),
    (error: unknown) => {
      assert.equal(typeof error, 'object')
      assert.equal(error !== null && 'statusCode' in error ? error.statusCode : undefined, 404)
      return true
    },
  )
})
