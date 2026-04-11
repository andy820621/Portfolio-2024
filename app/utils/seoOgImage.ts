import { encodeUrlPath } from './pathUtils'

const ABSOLUTE_URL_REGEX = /^[a-z][\w+\-.]*:\/\//i

export interface SeoOgImageObject {
  alt?: string
  component?: string
  props?: Record<string, unknown>
  url?: string
}

export type SeoOgImageValue = string | SeoOgImageObject | boolean | null | undefined

export function isOgImageDisabled(ogImage: SeoOgImageValue) {
  return ogImage === false
}

export function resolveStaticOgImageUrl(baseUrl: string, ogImage?: SeoOgImageValue, fallbackImage?: string) {
  if (isOgImageDisabled(ogImage))
    return undefined

  if (typeof ogImage === 'string')
    return resolveAbsoluteSeoImageUrl(baseUrl, ogImage)

  if (ogImage && typeof ogImage === 'object') {
    if (typeof ogImage.component === 'string' && ogImage.component)
      return undefined

    return resolveAbsoluteSeoImageUrl(baseUrl, ogImage.url)
  }

  return resolveAbsoluteSeoImageUrl(baseUrl, fallbackImage)
}

export function resolveOgImageAlt(ogImage: SeoOgImageValue, fallbackAlt?: string, fallbackTitle?: string) {
  if (ogImage && typeof ogImage === 'object' && typeof ogImage.alt === 'string' && ogImage.alt.trim())
    return ogImage.alt.trim()

  if (fallbackAlt?.trim())
    return fallbackAlt.trim()

  if (fallbackTitle?.trim())
    return fallbackTitle.trim()

  return undefined
}

export function resolveDynamicOgImageDefinition(ogImage: SeoOgImageValue) {
  if (!ogImage || typeof ogImage !== 'object' || Array.isArray(ogImage))
    return undefined

  if (typeof ogImage.component !== 'string' || !ogImage.component)
    return undefined

  return {
    component: ogImage.component,
    props: isRecord(ogImage.props) ? ogImage.props : {},
  }
}

function resolveAbsoluteSeoImageUrl(baseUrl: string, image?: string) {
  if (!image)
    return undefined

  if (ABSOLUTE_URL_REGEX.test(image))
    return encodeUrlPath(image)

  const normalizedBaseUrl = trailingSlashUrlOrNot(baseUrl, false)
  const normalizedImagePath = image.startsWith('/') ? image : `/${image}`
  return `${normalizedBaseUrl}${encodeUrlPath(normalizedImagePath)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}
