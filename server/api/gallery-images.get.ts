import galleryImagesMap from '../../public/gallery-images-map.json' with { type: 'json' }

const URL_PROTOCOL_REGEX = /^[a-z][\w+\-.]*:\/\//i

function encodeUrlPath(path: string) {
  if (!path)
    return ''

  const hasProtocol = URL_PROTOCOL_REGEX.test(path)

  if (hasProtocol) {
    try {
      const url = new URL(path)
      const encodedPathname = encodePathSegments(url.pathname)
      return `${url.origin}${encodedPathname}${url.search}${url.hash}`
    }
    catch {
      return encodePathSegments(path)
    }
  }

  return encodePathSegments(path)
}

function encodePathSegments(path: string) {
  return path.split('/').map((segment, index) => {
    if (segment === '' && index === 0)
      return ''
    return encodePathSegment(segment)
  }).join('/')
}

function encodePathSegment(segment: string) {
  try {
    return encodeURIComponent(decodeURIComponent(segment))
  }
  catch {
    return encodeURIComponent(segment)
  }
}

export function resolveGalleryImageUrls(albumId: string) {
  const imageFiles = (galleryImagesMap as Record<string, string[]>)[albumId]

  if (!imageFiles || imageFiles.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: `No images found for album: ${albumId}`,
    })
  }

  return imageFiles.map(file => encodeUrlPath(`/gallery-images/${albumId}/${file}`))
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

  return resolveGalleryImageUrls(albumId)
})
