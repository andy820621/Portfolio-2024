import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const locale = String(q.locale || 'en')
  const base = String(q.base || 'posts')
  const slug = String(q.slug || '')

  const collection = `${base}_${locale}`

  // Build candidate paths to try
  const prefix = locale === 'en' ? '' : `/${locale}`
  const candidates = [
    `${prefix}/${base}/${slug}`,
    `${prefix}/${base}/${slug}/`,
    `/${base}/${slug}`,
    `/${base}/${slug}/`,
  ]

  const triedPaths: string[] = []
  let matchedPath: string | null = null
  let item: any = null
  let errorMessage: string | null = null

  try {
    for (const p of candidates) {
      const normalized = p.endsWith('/') ? p.slice(0, -1) : p
      triedPaths.push(normalized)
      // @ts-expect-error runtime content query
      const found = await queryCollection(collection).path(normalized).first()
      if (found) {
        matchedPath = normalized
        item = found
        break
      }
    }
  }
  catch (e: any) {
    errorMessage = e?.message || String(e)
  }

  // List first few items for quick inspection
  let examples: any[] = []
  let count = 0
  try {
    // @ts-expect-error runtime content query
    const all = await queryCollection(collection).select(['path', 'title', 'id']).all()
    count = Array.isArray(all) ? all.length : 0
    examples = Array.isArray(all) ? all.slice(0, 20) : []
  }
  catch {
    // ignore listing errors
  }

  return {
    ok: !!item,
    collection,
    base,
    locale,
    slug,
    triedPaths,
    matchedPath,
    item: item ? { path: item.path, title: item.title, id: item.id } : null,
    count,
    examples,
    errorMessage,
  }
})
