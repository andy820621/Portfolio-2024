import { fileURLToPath } from 'node:url'
import { loadNuxtConfig } from '@nuxt/kit'
import { expect, it } from 'vitest'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

it('seo config disables canonical lowercasing for mixed-case routes', async () => {
  const config = await loadNuxtConfig({ cwd: projectRoot })

  expect(config.seo?.canonicalLowercase).toBe(false)
})
