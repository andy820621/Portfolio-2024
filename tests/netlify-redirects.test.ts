/* eslint-disable test/no-import-node-test */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const netlifyConfig = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8')

test('/zh/sitemap.xml is redirected to /sitemap_index.xml', () => {
  const redirectRule = /\[\[redirects\]\]\s+from = "\/zh\/sitemap\.xml"\s+to = "\/sitemap_index\.xml"\s+status = 308\s+force = true/

  assert.match(netlifyConfig, redirectRule)
})
