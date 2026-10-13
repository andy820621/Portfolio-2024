import { afterEach, describe, expect, it, vi } from 'vitest'
import { auditLiveSeo } from '../scripts/audit-seo-live.js'

const origin = 'https://example.com'
const paths = ['/', '/license/', '/gallery/sakura-park/', '/gallery/blossom-passage/', '/gallery/chasing-blossoms/', '/projects/nuxt-content-mermaid/']
const localizedPaths = paths.flatMap(path => [path, `/zh${path}`])
const sitemapNamespace = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'

interface Page {
  body: string
  status?: number
  headers?: Record<string, string>
}

function createSite() {
  const site = new Map<string, Page>()
  site.set(`${origin}/robots.txt`, { body: `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap_index.xml` })
  site.set(`${origin}/sitemap_index.xml`, {
    body: `<sitemapindex ${sitemapNamespace}><sitemap><loc>${origin}/pages.xml</loc></sitemap></sitemapindex>`,
  })
  site.set(`${origin}/pages.xml`, {
    body: `<urlset ${sitemapNamespace} xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${localizedPaths.map(path => `<url><loc>${origin}${path}</loc><image:image><image:loc>https://images.example.com/photo.webp</image:loc></image:image></url>`).join('')}</urlset>`,
  })
  for (const path of localizedPaths) {
    const englishPath = path.startsWith('/zh/') ? path.slice(3) : path
    site.set(`${origin}${path}`, {
      body: `<html><head>
        <link rel="canonical" href="${origin}${path}">
        <link rel="alternate" hreflang="en-US" href="${origin}${englishPath}">
        <link rel="alternate" hreflang="zh-TW" href="${origin}/zh${englishPath}">
        <meta name="robots" content="index, follow">
        </head><body><h1>Portfolio page</h1>
        ${localizedPaths.filter(target => target.startsWith('/zh/') === path.startsWith('/zh/')).map(target => `<a href="${target}">Page</a>`).join('')}
        </body></html>`,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  }
  const fetchMock = vi.fn(async (input: string | URL, options?: RequestInit) => {
    expect(options?.redirect).toBe('manual')
    const url = new URL(input)
    const page = site.get(url.href)
    if (page)
      return new Response(page.body, { status: page.status || 200, headers: page.headers })
    if (url.protocol === 'http:')
      return new Response(null, { status: 301, headers: { location: `https://${url.host}${url.pathname}` } })
    if (url.hostname.startsWith('www.'))
      return new Response(null, { status: 301, headers: { location: `${origin}${url.pathname}` } })
    const target = url.pathname === '/en/' ? '/' : `${decodeURIComponent(url.pathname).toLowerCase().replaceAll(' ', '-').replace(/\/$/, '')}/`
    if (target !== url.pathname && site.has(`${origin}${target}`))
      return new Response(null, { status: 301, headers: { location: target } })
    throw new Error(`Unexpected request: ${url.href}`)
  })
  vi.stubGlobal('fetch', fetchMock)
  return { site, fetchMock }
}

afterEach(() => vi.unstubAllGlobals())

describe('live SEO audit', () => {
  it('checks nested sitemaps, canonical pages and permanent redirects without crawling image URLs', async () => {
    const { fetchMock } = createSite()
    await expect(auditLiveSeo(origin)).resolves.toMatchObject({ pages: 12, sitemaps: 2, redirects: 13, maxLinkDepth: 1 })
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes('images.example.com'))).toBe(false)
  })

  it.each([
    ['redirected sitemap page', { status: 301, headers: { location: `${origin}/` } }, 'sitemap pages must not redirect'],
    ['non-HTML page', { headers: { 'content-type': 'application/json' } }, 'expected HTML'],
    ['generic X-Robots-Tag', { headers: { 'content-type': 'text/html', 'x-robots-tag': 'noindex' } }, 'X-Robots-Tag blocks indexing'],
    ['X-Robots-Tag with valued directives', { headers: { 'content-type': 'text/html', 'x-robots-tag': 'max-snippet: -1, noindex' } }, 'X-Robots-Tag blocks indexing'],
    ['Googlebot X-Robots-Tag', { headers: { 'content-type': 'text/html', 'x-robots-tag': 'googlebot: noindex, nofollow' } }, 'X-Robots-Tag blocks indexing'],
  ])('rejects %s', async (_name, changes, message) => {
    const { site } = createSite()
    Object.assign(site.get(`${origin}/license/`)!, changes)
    await expect(auditLiveSeo(origin)).rejects.toThrow(message)
  })

  it.each([
    ['wrong canonical', '<link rel="canonical" href="https://example.com/license/">', '<link rel="canonical" href="https://example.com/">', 'self-referencing canonical'],
    ['Googlebot meta noindex', '<meta name="robots" content="index, follow">', '<meta name="Googlebot" content="NOINDEX, follow">', 'meta robots blocks indexing'],
    ['missing SSR heading', '<h1>Portfolio page</h1>', '', 'missing rendered h1'],
    ['missing language alternate', 'hreflang="zh-TW"', 'hreflang="de-DE"', 'zh-TW hreflang'],
  ])('rejects %s', async (_name, before, after, message) => {
    const { site } = createSite()
    const page = site.get(`${origin}/license/`)!
    page.body = page.body.replace(before, after)
    await expect(auditLiveSeo(origin)).rejects.toThrow(message)
  })

  it('uses the Googlebot group and the longest matching rule, preferring Allow on a tie', async () => {
    const { site } = createSite()
    site.get(`${origin}/robots.txt`)!.body = `User-agent: *\nDisallow: /\nUser-agent: Googlebot\nDisallow: /\nAllow: /\nDisallow: /projects/\nAllow: /projects/\nSitemap: ${origin}/sitemap_index.xml`
    site.get(`${origin}/license/`)!.headers!['x-robots-tag'] = 'bingbot: noindex'
    await expect(auditLiveSeo(origin)).resolves.toHaveProperty('pages', 12)
  })

  it('rejects HTML with a second document tail left by overlapping prerender writes', async () => {
    const { site } = createSite()
    const page = site.get(`${origin}/zh/`)!
    page.body += '<link rel="canonical" href="https://example.com/zh/"></head><body>Stale tail</body></html>'
    await expect(auditLiveSeo(origin)).rejects.toThrow('/zh/: expected one complete HTML document')
  })

  it('rejects a Googlebot-blocked canonical page', async () => {
    const { site } = createSite()
    site.get(`${origin}/robots.txt`)!.body += '\nDisallow: /license/'
    await expect(auditLiveSeo(origin)).rejects.toThrow('/license/: robots.txt blocks Googlebot')
  })

  it.each([
    ['HTML fallback', '<html>Not a sitemap</html>', 'invalid or incomplete sitemap'],
    ['empty sitemap', `<urlset ${sitemapNamespace}></urlset>`, 'empty sitemap'],
    ['foreign origin', `<urlset ${sitemapNamespace}><url><loc>https://other.example.com/</loc></url></urlset>`, 'Non-canonical sitemap URL'],
  ])('rejects %s in sitemap responses', async (_name, body, message) => {
    const { site } = createSite()
    site.get(`${origin}/pages.xml`)!.body = body
    await expect(auditLiveSeo(origin)).rejects.toThrow(message)
  })

  it('detects an orphan license page even when sitemap and hreflang include it', async () => {
    const { site } = createSite()
    for (const path of localizedPaths) {
      const page = site.get(`${origin}${path}`)!
      page.body = page.body.replace('<a href="/license/">Page</a>', '')
    }
    await expect(auditLiveSeo(origin)).rejects.toThrow('/license/: no crawlable internal-link path')
  })

  it.each([
    ['loop', '/en/', 301, 'redirect loop'],
    ['wrong target', '/license/', 301, 'expected redirect to canonical page'],
    ['temporary redirect', '/', 302, 'invalid redirect'],
  ])('rejects a legacy redirect %s', async (_name, location, status, message) => {
    const { site } = createSite()
    site.set(`${origin}/en/`, { body: '', status, headers: { location } })
    await expect(auditLiveSeo(origin)).rejects.toThrow(message)
  })
})
