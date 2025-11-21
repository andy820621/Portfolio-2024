export function normalizePath(path: string) {
  if (!path)
    return ''

  return path.startsWith('/') ? path : `/${path}`
}

export function encodeUrlPath(path: string) {
  if (!path)
    return ''

  const hasProtocol = /^[a-z][\w+\-.]*:\/\//i.test(path)

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
    return encodeURIComponent(segment)
  }).join('/')
}
