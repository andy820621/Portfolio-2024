const URL_PROTOCOL_REGEX = /^[a-z][\w+\-.]*:\/\//i

export function normalizePath(path: string) {
  if (!path)
    return ''

  return path.startsWith('/') ? path : `/${path}`
}

export function canonicalizePagePath(path: string) {
  const normalizedPath = normalizePath(path)

  if (!normalizedPath || normalizedPath === '/')
    return normalizedPath || '/'

  return normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`
}

export function encodeCanonicalPagePath(path: string) {
  return encodeUrlPath(canonicalizePagePath(path))
}

export function decodeRouteParam(value: string) {
  try {
    return decodeURIComponent(value)
  }
  catch {
    return value
  }
}

export function buildCanonicalSiteUrl(baseUrl: string, path: string) {
  const normalizedBaseUrl = normalizeBaseSiteUrl(baseUrl)
  const canonicalPath = encodeCanonicalPagePath(path)

  if (!canonicalPath)
    return normalizedBaseUrl

  return `${normalizedBaseUrl}${canonicalPath}`
}

export function normalizeBaseSiteUrl(baseUrl: string) {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

export function buildSchemaNodeId(baseUrl: string, nodeName: string) {
  const normalizedNodeName = nodeName.startsWith('#') ? nodeName.slice(1) : nodeName
  return `${normalizeBaseSiteUrl(baseUrl)}#${normalizedNodeName}`
}

export function buildSchemaPageNodeId(baseUrl: string, path: string, nodeName: string) {
  const normalizedNodeName = nodeName.startsWith('#') ? nodeName.slice(1) : nodeName
  return `${buildCanonicalSiteUrl(baseUrl, path)}#${normalizedNodeName}`
}

export function encodeUrlPath(path: string) {
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
