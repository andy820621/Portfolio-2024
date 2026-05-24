import type { GalleryImagesMetadata } from '../../app/utils/galleryImageMetadata'
import { resolveGalleryImageAssets as buildGalleryImageAssets } from '../../app/utils/galleryImageMetadata'
import galleryImagesMap from '../../public/gallery-images-map.json' with { type: 'json' }
import galleryImagesMetadata from '../../public/gallery-images-metadata.json' with { type: 'json' }

const galleryImagesMetadataMap = galleryImagesMetadata as GalleryImagesMetadata

export function resolveGalleryImageAssets(albumId: string) {
  const imageFiles = (galleryImagesMap as Record<string, string[]>)[albumId]

  if (!imageFiles || imageFiles.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: `No images found for album: ${albumId}`,
    })
  }

  return buildGalleryImageAssets(albumId, imageFiles, galleryImagesMetadataMap)
}

export default defineEventHandler(async (event) => {
  const { albumId } = getQuery(event)

  if (typeof albumId !== 'string' || !albumId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'albumId is required.',
    })
  }

  return resolveGalleryImageAssets(albumId)
})
