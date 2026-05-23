// Be lenient with input types to accommodate Nuxt/head link types (e.g. BaseUrlResolveHandler) and optional values.
export function trailingSlashUrlOrNot(urlInput: unknown, addTrailingSlash = true): string {
  const url = typeof urlInput === 'string' ? urlInput : ''

  if (!url)
    return ''

  // Keep query/hash intact while normalizing only the pathname slash.
  if (/^[a-z][\w+\-.]*:\/\//i.test(url)) {
    try {
      const parsed = new URL(url)
      const pathname = normalizePathSlash(parsed.pathname, addTrailingSlash)
      return `${parsed.origin}${pathname}${parsed.search}${parsed.hash}`
    }
    catch {
      return normalizePathSlash(url, addTrailingSlash)
    }
  }

  try {
    const parsed = new URL(url, 'https://local.test')
    const pathname = normalizePathSlash(parsed.pathname, addTrailingSlash)
    return `${pathname}${parsed.search}${parsed.hash}`
  }
  catch {
    return normalizePathSlash(url, addTrailingSlash)
  }
}

function normalizePathSlash(path: string, addTrailingSlash: boolean) {
  if (!path)
    return addTrailingSlash ? '/' : ''

  if (addTrailingSlash)
    return path.endsWith('/') ? path : `${path}/`

  if (path === '/')
    return '/'

  return path.endsWith('/') ? path.slice(0, -1) : path
}
