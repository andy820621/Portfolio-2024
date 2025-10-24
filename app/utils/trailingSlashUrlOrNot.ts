// Be lenient with input types to accommodate Nuxt/head link types (e.g. BaseUrlResolveHandler) and optional values.
export function trailingSlashUrlOrNot(urlInput: unknown, addTrailingSlash = true): string {
  const url = typeof urlInput === 'string' ? urlInput : ''

  if (addTrailingSlash)
    return url.endsWith('/') ? url : `${url}/`

  return url.endsWith('/') ? url.slice(0, -1) : url
}
