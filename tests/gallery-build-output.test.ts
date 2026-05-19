import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { isValidGallerySlug } from '../app/utils/gallerySlug.ts'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const outputPublicDir = join(projectRoot, '.output/public')
const galleryOutputDir = join(outputPublicDir, 'gallery')

const runBuildOutputAudit = process.env.AUDIT_BUILD_OUTPUT === '1'
const describeIf = runBuildOutputAudit ? describe : describe.skip

function collectXmlFiles(dir: string): string[] {
  if (!existsSync(dir))
    return []

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)

    if (entry.isDirectory())
      return collectXmlFiles(path)

    return entry.name.endsWith('.xml') ? [path] : []
  })
}

describeIf('gallery build output', () => {
  it('only prerenders lowercase slug directories for gallery albums', () => {
    expect(existsSync(galleryOutputDir)).toBe(true)

    const routeDirs = readdirSync(galleryOutputDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)

    expect(routeDirs.length).toBeGreaterThan(0)
    expect(routeDirs.every(isValidGallerySlug)).toBe(true)
  })

  it('does not expose legacy mixed-case gallery URLs in sitemaps', () => {
    const sitemapPageLocs = collectXmlFiles(outputPublicDir)
      .map(file => readFileSync(file, 'utf8'))
      .flatMap(content => [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1] ?? ''))
      .join('\n')

    expect(sitemapPageLocs).not.toContain('Chasing%20Blossoms')
    expect(sitemapPageLocs).not.toContain('Blossoms%20%26%20Kids')
    expect(sitemapPageLocs).not.toContain('Blossoms%20%2526%20Kids')
  })
})
