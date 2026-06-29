import { fileURLToPath } from 'node:url'
import { loadNuxtConfig } from '@nuxt/kit'
import { afterEach, describe, expect, it, vi } from 'vitest'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

afterEach(() => {
  vi.unstubAllEnvs()
})

async function loadConfigWithEnv(env: Record<string, string>) {
  vi.resetModules()

  for (const [key, value] of Object.entries(env))
    vi.stubEnv(key, value)

  return await loadNuxtConfig({ cwd: projectRoot })
}

describe('nuxt image config', () => {
  it('avoids runtime-only image transforms during Netlify prerender', async () => {
    const config = await loadConfigWithEnv({
      NODE_ENV: 'production',
      NETLIFY: 'true',
    })

    if (!config.image)
      throw new Error('Expected Nuxt Image config to be enabled.')

    expect(config.image.provider).toBe('none')
    expect(config.nitro?.prerender?.failOnError).toBe(true)
  })
})
