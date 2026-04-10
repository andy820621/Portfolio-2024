import { access, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { createError, getQuery } from 'h3'
import { encodeUrlPath } from '~/utils/pathUtils'

const GALLERY_IMAGE_MAP_PATHS = [
  join(cwd(), 'public', 'gallery-images-map.json'),
  join(cwd(), '.output', 'public', 'gallery-images-map.json'),
  join(cwd(), '..', 'public', 'gallery-images-map.json'),
]

let cachedImageMap: Record<string, string[]> | null = null

async function readGalleryImageMap() {
  if (cachedImageMap)
    return cachedImageMap

  for (const filePath of GALLERY_IMAGE_MAP_PATHS) {
    try {
      await access(filePath)
      const raw = await readFile(filePath, 'utf8')
      cachedImageMap = JSON.parse(raw) as Record<string, string[]>
      return cachedImageMap
    }
    catch {
      continue
    }
  }

  throw createError({
    statusCode: 500,
    statusMessage: 'Internal Server Error',
    message: 'Failed to locate gallery image map on server.',
  })
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

  const imageMap = await readGalleryImageMap()
  const imageFiles = imageMap[albumId]

  if (!imageFiles || imageFiles.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: `No images found for album: ${albumId}`,
    })
  }

  return imageFiles.map(file => encodeUrlPath(`/gallery-images/${albumId}/${file}`))
})
