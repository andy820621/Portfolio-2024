import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

const netlifyConfig = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8')

it('/posts/fetch-content-data-render-pages/ permanently redirects to new post URL', () => {
  const redirectRule = /\[\[redirects\]\]\s+from = "\/posts\/fetch-content-data-render-pages\/"\s+to = "\/posts\/nuxt-content-v3-i18n-bilingual-site\/"\s+status = 301\s+force = true/

  expect(netlifyConfig).toMatch(redirectRule)
})

it('/zh/sitemap.xml is redirected to /sitemap_index.xml', () => {
  const redirectRule = /\[\[redirects\]\]\s+from = "\/zh\/sitemap\.xml"\s+to = "\/sitemap_index\.xml"\s+status = 308\s+force = true/

  expect(netlifyConfig).toMatch(redirectRule)
})

it('malformed locale redirects are declared before the broad /en/* redirect', () => {
  const broadEnRedirectIndex = netlifyConfig.indexOf('from = "/en/*"')
  const malformedEnZhRedirectIndex = netlifyConfig.indexOf('from = "/en/zh/*"')
  const malformedEnEnRedirectIndex = netlifyConfig.indexOf('from = "/en/en/*"')

  expect(broadEnRedirectIndex).toBeGreaterThan(-1)
  expect(malformedEnZhRedirectIndex).toBeGreaterThan(-1)
  expect(malformedEnEnRedirectIndex).toBeGreaterThan(-1)
  expect(malformedEnZhRedirectIndex).toBeLessThan(broadEnRedirectIndex)
  expect(malformedEnEnRedirectIndex).toBeLessThan(broadEnRedirectIndex)
})

it('https://www.barz.app/zh directly redirects to canonical slash URL before broad www redirect', () => {
  const directZhWwwRedirectIndex = netlifyConfig.indexOf('from = "https://www.barz.app/zh"')
  const broadWwwRedirectIndex = netlifyConfig.indexOf('from = "https://www.barz.app/*"')

  expect(directZhWwwRedirectIndex).toBeGreaterThan(-1)
  expect(broadWwwRedirectIndex).toBeGreaterThan(-1)
  expect(directZhWwwRedirectIndex).toBeLessThan(broadWwwRedirectIndex)
  expect(netlifyConfig).toContain('to = "https://barz.app/zh/"')
})

it('http://www.barz.app/zh directly redirects to canonical slash URL before broad http www redirect', () => {
  const directZhHttpWwwRedirectIndex = netlifyConfig.indexOf('from = "http://www.barz.app/zh"')
  const broadHttpWwwRedirectIndex = netlifyConfig.indexOf('from = "http://www.barz.app/*"')

  expect(directZhHttpWwwRedirectIndex).toBeGreaterThan(-1)
  expect(broadHttpWwwRedirectIndex).toBeGreaterThan(-1)
  expect(directZhHttpWwwRedirectIndex).toBeLessThan(broadHttpWwwRedirectIndex)
  expect(netlifyConfig).toContain('to = "https://barz.app/zh/"')
})
