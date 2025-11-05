import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  // Cast queryCollection to a server-friendly signature to satisfy typecheck
  const qc = queryCollection as unknown as (event: any, collection: string) => any
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
      const found = await qc(event, collection).path(normalized).first()
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
    const all = await qc(event, collection).all()
    count = Array.isArray(all) ? all.length : 0
    examples = Array.isArray(all)
      ? all.slice(0, 20).map((it: any) => ({ path: it.path, title: it.title, id: it.id }))
      : []
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
