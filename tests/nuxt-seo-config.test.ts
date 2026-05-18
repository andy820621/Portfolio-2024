/* eslint-disable test/no-import-node-test */
import assert from 'node:assert/strict'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { loadNuxtConfig } from '@nuxt/kit'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

test('seo config disables canonical lowercasing for mixed-case routes', async () => {
  const config = await loadNuxtConfig({ cwd: projectRoot })

  assert.equal(config.seo?.canonicalLowercase, false)
})
