import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const netlifyConfig = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8')

it('/zh/sitemap.xml is redirected to /sitemap_index.xml', () => {
  const redirectRule = /\[\[redirects\]\]\s+from = "\/zh\/sitemap\.xml"\s+to = "\/sitemap_index\.xml"\s+status = 308\s+force = true/

  expect(netlifyConfig).toMatch(redirectRule)
})
