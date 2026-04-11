const URL_PROTOCOL_REGEX = /^[a-z][\w+\-.]*:\/\//i

export function normalizePath(path: string) {
  if (!path)
    return ''

  return path.startsWith('/') ? path : `/${path}`
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
