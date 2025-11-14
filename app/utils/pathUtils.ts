export function normalizePath(path: string) {
  if (!path)
    return ''

  return path.startsWith('/') ? path : `/${path}`
}
