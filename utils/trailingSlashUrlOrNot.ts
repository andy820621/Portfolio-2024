export function trailingSlashUrlOrNot(url: string, addTrailingSlash = true): string {
  if (addTrailingSlash)
    return url.endsWith('/') ? url : `${url}/`

  return url.endsWith('/') ? url.slice(0, -1) : url
}
