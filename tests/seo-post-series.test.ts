import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

const seriesFiles = {
  en: {
    hub: 'content/en/posts/nuxt-seo-guide.md',
    spokes: [
      'content/en/posts/nuxt-sitemaps-robots-indexing.md',
      'content/en/posts/nuxt-meta-og-schema.md',
      'content/en/posts/nuxt-canonical-i18n-internal-linking.md',
    ],
  },
  zh: {
    hub: 'content/zh/posts/nuxt-seo-guide.md',
    spokes: [
      'content/zh/posts/nuxt-sitemaps-robots-indexing.md',
      'content/zh/posts/nuxt-meta-og-schema.md',
      'content/zh/posts/nuxt-canonical-i18n-internal-linking.md',
    ],
  },
}

function readFrontmatter(relativePath: string) {
  const raw = readFileSync(new URL(relativePath, `file://${projectRoot}/`), 'utf8')
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/)

  if (!match)
    throw new Error(`Missing frontmatter in ${relativePath}`)

  const frontmatter = match[1] ?? ''

  return parse(frontmatter) as {
    relatedLinks?: Array<{ title?: string, href?: string, note?: string }>
    relatedPages?: Array<{ path?: string, title?: string }>
  }
}

describe('seo post series cluster', () => {
  it('includes the planned bilingual hub-and-spoke article files', () => {
    for (const localeFiles of Object.values(seriesFiles)) {
      expect(existsSync(new URL(localeFiles.hub, `file://${projectRoot}/`))).toBe(true)

      for (const spoke of localeFiles.spokes)
        expect(existsSync(new URL(spoke, `file://${projectRoot}/`))).toBe(true)
    }
  })

  it('connects the hub article to every spoke with related pages', () => {
    for (const localeFiles of Object.values(seriesFiles)) {
      const hub = readFrontmatter(localeFiles.hub)
      const hubPaths = (hub.relatedPages || []).map(page => page.path)

      for (const spoke of localeFiles.spokes) {
        const spokeFrontmatter = readFrontmatter(spoke)
        const expectedPath = `/${spoke.replace(/^content\/(?:en|zh)\//, '').replace(/\.md$/, '')}`
          .replace(/^\/posts\//, localeFiles.hub.includes('/zh/') ? '/zh/posts/' : '/posts/')
        const guidePath = localeFiles.hub.includes('/zh/') ? '/zh/posts/nuxt-seo-guide' : '/posts/nuxt-seo-guide'
        const spokePaths = (spokeFrontmatter.relatedPages || []).map(page => page.path)

        expect(hubPaths).toContain(expectedPath)
        expect(spokePaths).toContain(guidePath)
      }
    }
  })

  it('adds reference links to every article in the series', () => {
    for (const localeFiles of Object.values(seriesFiles)) {
      const files = [localeFiles.hub, ...localeFiles.spokes]

      for (const file of files) {
        const frontmatter = readFrontmatter(file)
        const relatedLinks = frontmatter.relatedLinks || []

        expect(relatedLinks.length).toBeGreaterThanOrEqual(3)
        expect(relatedLinks.every(link => typeof link.title === 'string' && link.title.trim().length > 0)).toBe(true)
        expect(relatedLinks.every(link => typeof link.href === 'string' && link.href.trim().length > 0)).toBe(true)
      }
    }
  })
})
