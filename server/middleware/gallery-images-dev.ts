import { createReadStream, existsSync } from 'node:fs'
import { extname, normalize, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineEventHandler, getRequestURL, sendStream, setHeader } from 'h3'

const galleryImagesDir = fileURLToPath(new URL('../../public/gallery-images/', import.meta.url))
const galleryImagesRoot = resolve(galleryImagesDir)
const GALLERY_IMAGES_PATH_PREFIX_RE = /^\/gallery-images\/?/

const IMAGE_CONTENT_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

function isDevServer() {
  return import.meta.dev || (typeof process !== 'undefined' && Boolean((process as NodeJS.Process & { dev?: boolean }).dev))
}

export function getGalleryImagesDevContentType(filePath: string) {
  return IMAGE_CONTENT_TYPES[extname(filePath).toLowerCase()]
}

export function resolveGalleryImagesDevFilePath(requestPath: string) {
  const pathname = requestPath.split('?')[0] || ''
  const encodedRelativePath = pathname.replace(GALLERY_IMAGES_PATH_PREFIX_RE, '')

  if (!encodedRelativePath || encodedRelativePath === pathname)
    return null

  const decodedSegments = encodedRelativePath.split('/').map((segment) => {
    try {
      return decodeURIComponent(segment)
    }
    catch {
      return segment
    }
  })

  const normalizedRelativePath = normalize(decodedSegments.join('/'))

  if (normalizedRelativePath.startsWith('..') || normalizedRelativePath.includes(`..${sep}`))
    return null

  const filePath = resolve(galleryImagesRoot, normalizedRelativePath)

  if (filePath !== galleryImagesRoot && !filePath.startsWith(`${galleryImagesRoot}${sep}`))
    return null

  return filePath
}

export default defineEventHandler((event) => {
  if (!isDevServer())
    return

  const pathname = getRequestURL(event).pathname

  if (!pathname.startsWith('/gallery-images/'))
    return

  const filePath = resolveGalleryImagesDevFilePath(pathname)
  const contentType = filePath ? getGalleryImagesDevContentType(filePath) : undefined

  if (!filePath || !contentType || !existsSync(filePath))
    return

  setHeader(event, 'content-type', contentType)
  setHeader(event, 'cache-control', 'public, max-age=0, must-revalidate')

  return sendStream(event, createReadStream(filePath))
})
