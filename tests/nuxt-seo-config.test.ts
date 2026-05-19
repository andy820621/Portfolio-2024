import { fileURLToPath } from 'node:url'
import { loadNuxtConfig } from '@nuxt/kit'
import { expect, it } from 'vitest'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

it('seo config disables canonical lowercasing for mixed-case routes', async () => {
  const config = await loadNuxtConfig({ cwd: projectRoot })
  const seoConfig = config.seo

  expect(seoConfig).not.toBe(false)

  if (!seoConfig)
    throw new Error('Expected seo module options to be enabled.')

  expect(seoConfig.canonicalLowercase).toBe(false)
})
