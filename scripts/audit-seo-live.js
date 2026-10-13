#!/usr/bin/env node

import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { matchPathToRule, parseRobotsTxt } from '@nuxtjs/robots/util'
import { collectSitemap } from '@nuxtjs/sitemap/utils'
import { collectTagAttributes, hasRel } from './audit-seo.js'

const NOINDEX_RE = /(?:^|[\s,;])(?:noindex|none)(?:$|[\s,;])/i
const SCOPED_HEADER_RE = /^([\w-]+):(.*)$/
const VALUED_DIRECTIVES = new Set(['max-snippet', 'max-image-preview', 'max-video-preview', 'unavailable_after'])
const HEAD_RE = /<head\b[^>]*>([\s\S]*?)<\/head>/i
const H1_RE = /<h1\b[^>]*>\s*\S/i
const HTML_END_RE = /<\/html>/gi
const REDIRECT_STATUSES = new Set([301, 308])
const LEGACY_REDIRECTS = [
  ['/en/', '/'],
  ['/gallery/Sakura%20Park/', '/gallery/sakura-park/'],
  ['/gallery/Blossom%20Passage/', '/gallery/blossom-passage/'],
  ['/gallery/blossom%20passage/', '/gallery/blossom-passage/'],
  ['/gallery/chasing%20blossoms/', '/gallery/chasing-blossoms/'],
  ['/zh/gallery/Blossom%20Passage/', '/zh/gallery/blossom-passage/'],
  ['/zh/gallery/blossom%20passage/', '/zh/gallery/blossom-passage/'],
  ['/zh/gallery/chasing%20blossoms/', '/zh/gallery/chasing-blossoms/'],
  ['/zh/gallery/Chasing%20Blossoms/', '/zh/gallery/chasing-blossoms/'],
  ['/projects/nuxt-content-mermaid', '/projects/nuxt-content-mermaid/'],
]

function requireCheck(condition, message) {
  if (!condition)
    throw new Error(message)
}

function headerBlocksIndexing(value) {
  let agent = ''
  return value.split(',').some((part) => {
    const scoped = part.trim().match(SCOPED_HEADER_RE)
    if (scoped && !VALUED_DIRECTIVES.has(scoped[1].toLowerCase()))
      agent = scoped[1].toLowerCase()
    return (!agent || agent === 'googlebot') && NOINDEX_RE.test(scoped?.[2] ?? part)
  })
}

async function request(url) {
  try {
    return await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20_000) })
  }
  catch (error) {
    throw new Error(`${url}: ${error.message}`, { cause: error })
  }
}

export async function auditLiveSeo(siteUrl) {
  const origin = new URL(siteUrl).origin
  requireCheck(origin.startsWith('https://'), 'The canonical site URL must use HTTPS')
  const sitemapUrl = `${origin}/sitemap_index.xml`
  const robotsResponse = await request(`${origin}/robots.txt`)
  requireCheck(robotsResponse.status === 200, `robots.txt: HTTP ${robotsResponse.status}`)
  const robots = parseRobotsTxt(await robotsResponse.text())
  requireCheck(robots.sitemaps.includes(sitemapUrl), `robots.txt must declare ${sitemapUrl}`)
  const googleGroups = robots.groups.filter(group => group.userAgent.some(agent => agent.toLowerCase() === 'googlebot'))
  const groups = googleGroups.length ? googleGroups : robots.groups.filter(group => group.userAgent.includes('*'))
  const rules = groups.flatMap(group => [
    ...group.allow.filter(Boolean).map(pattern => ({ pattern, allow: true })),
    ...group.disallow.filter(Boolean).map(pattern => ({ pattern, allow: false })),
  ])
  const sitemapQueue = [sitemapUrl]
  const sitemaps = new Set()
  const pageUrls = new Set()
  for (const url of sitemapQueue) {
    requireCheck(new URL(url).origin === origin, `Sitemap uses a different origin: ${url}`)
    if (sitemaps.has(url))
      continue
    sitemaps.add(url)
    const response = await request(url)
    requireCheck(response.status === 200, `${url}: HTTP ${response.status}`)
    const parsed = await collectSitemap(await response.text())
    requireCheck(parsed._tag === 'document' && parsed.completeness._tag === 'complete' && !parsed.issues.some(issue => issue.severity === 'error'), `${url}: invalid or incomplete sitemap`)
    requireCheck(parsed.document.entries.length > 0, `${url}: empty sitemap`)
    for (const entry of parsed.document.entries) {
      const target = new URL(entry.loc)
      requireCheck(target.origin === origin && !target.search && !target.hash, `Non-canonical sitemap URL: ${entry.loc}`)
      if (parsed.document._tag === 'index')
        sitemapQueue.push(target.href)
      else
        pageUrls.add(target.href)
    }
  }
  requireCheck(pageUrls.size > 0, 'Sitemaps contain no pages')

  const errors = []
  const pages = new Map()
  const urls = [...pageUrls]
  for (let offset = 0; offset < urls.length; offset += 4) {
    await Promise.all(urls.slice(offset, offset + 4).map(async (url) => {
      try {
        requireCheck(matchPathToRule(new URL(url).pathname, rules)?.allow !== false, `${url}: robots.txt blocks Googlebot`)
        const response = await request(url)
        requireCheck(response.status === 200, `${url}: HTTP ${response.status}; sitemap pages must not redirect`)
        requireCheck(response.headers.get('content-type')?.includes('text/html'), `${url}: expected HTML`)
        requireCheck(!headerBlocksIndexing(response.headers.get('x-robots-tag') || ''), `${url}: X-Robots-Tag blocks indexing`)
        const html = await response.text()
        requireCheck([...html.matchAll(HTML_END_RE)].length === 1, `${url}: expected one complete HTML document`)
        const head = html.match(HEAD_RE)?.[1] || ''
        const links = collectTagAttributes(head, 'link')
        const canonicals = links.filter(link => hasRel(link.rel, 'canonical'))
        requireCheck(canonicals.length === 1 && canonicals[0].href === url, `${url}: expected one self-referencing canonical`)
        const metas = collectTagAttributes(head, 'meta')
        requireCheck(!metas.some(meta => ['robots', 'googlebot'].includes(meta.name?.toLowerCase()) && NOINDEX_RE.test(meta.content || '')), `${url}: meta robots blocks indexing`)
        requireCheck(H1_RE.test(html), `${url}: missing rendered h1`)
        const alternatives = links.filter(link => hasRel(link.rel, 'alternate') && link.hreflang)
        for (const language of ['en-US', 'zh-TW']) {
          const alternate = alternatives.filter(link => link.hreflang === language)
          requireCheck(alternate.length === 1 && pageUrls.has(alternate[0].href), `${url}: ${language} hreflang must point to a sitemap page`)
        }
        const outgoing = new Set()
        for (const anchor of collectTagAttributes(html, 'a')) {
          if (!anchor.href || hasRel(anchor.rel, 'nofollow'))
            continue
          const target = new URL(anchor.href, url)
          target.hash = ''
          target.search = ''
          if (pageUrls.has(target.href))
            outgoing.add(target.href)
        }
        pages.set(url, { alternatives, outgoing })
      }
      catch (error) {
        errors.push(error.message)
      }
    }))
  }
  for (const [url, page] of pages) {
    for (const alternate of page.alternatives) {
      if (!pages.get(alternate.href)?.alternatives.some(link => link.href === url))
        errors.push(`${url}: hreflang does not link back from ${alternate.href}`)
    }
  }
  const reachable = new Map([[`${origin}/`, 0], [`${origin}/zh/`, 0]])
  for (const [url, depth] of reachable) {
    for (const target of pages.get(url)?.outgoing || []) {
      if (!reachable.has(target))
        reachable.set(target, depth + 1)
    }
  }
  for (const url of pageUrls) {
    if (!reachable.has(url))
      errors.push(`${url}: no crawlable internal-link path from either localized homepage`)
  }

  const { hostname } = new URL(origin)
  const redirects = [
    ...LEGACY_REDIRECTS.map(([from, to]) => [new URL(from, origin).href, new URL(to, origin).href]),
    [`http://${hostname}/`, `${origin}/`],
    [`http://www.${hostname}/`, `${origin}/`],
    [`https://www.${hostname}/`, `${origin}/`],
  ]
  for (const [from, expected] of redirects) {
    try {
      const visited = new Set()
      let current = from
      let reached = false
      for (let hop = 0; hop < 6; hop++) {
        requireCheck(!visited.has(current), `${from}: redirect loop at ${current}`)
        visited.add(current)
        const response = await request(current)
        await response.body?.cancel()
        if (response.status === 200) {
          requireCheck(current === expected && visited.size > 1 && pages.has(expected), `${from}: expected redirect to canonical page ${expected}, got ${current}`)
          reached = true
          break
        }
        const location = response.headers.get('location')
        requireCheck(REDIRECT_STATUSES.has(response.status) && location, `${current}: invalid redirect (HTTP ${response.status})`)
        current = new URL(location, current).href
      }
      requireCheck(reached, `${from}: too many redirects`)
    }
    catch (error) {
      errors.push(error.message)
    }
  }
  requireCheck(errors.length === 0, errors.join('\n'))
  return { pages: pages.size, sitemaps: sitemaps.size, redirects: redirects.length, maxLinkDepth: Math.max(...reachable.values()) }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  auditLiveSeo(process.argv[2] || process.env.NUXT_SITE_URL || 'https://barz.app')
    .then(result => console.log(`Live SEO audit passed: ${JSON.stringify(result)}`))
    .catch((error) => {
      console.error(error.message)
      process.exitCode = 1
    })
}
