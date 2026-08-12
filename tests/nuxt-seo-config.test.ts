import { fileURLToPath } from 'node:url'
import { loadNuxtConfig } from '@nuxt/kit'
import { afterEach, expect, it, vi } from 'vitest'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

afterEach(() => {
  vi.unstubAllEnvs()
})

async function loadConfigWithEnv(env: Record<string, string | undefined> = {}) {
  vi.resetModules()

  for (const [key, value] of Object.entries(env))
    vi.stubEnv(key, value)

  return await loadNuxtConfig({ cwd: projectRoot })
}

it('api route rules include X-Robots-Tag noindex header', async () => {
  const config = await loadConfigWithEnv()
  const routeRules = config.routeRules as Record<string, { headers?: Record<string, string> }> | undefined

  expect(routeRules).toBeTruthy()

  const apiRule = routeRules?.['/api/**']
  expect(apiRule).toBeTruthy()

  const xRobotsTag = apiRule?.headers?.['X-Robots-Tag'] ?? apiRule?.headers?.['x-robots-tag']
  expect(xRobotsTag).toBe('noindex')
})

it('page route rules include baseline security headers without replacing cache headers', async () => {
  const config = await loadConfigWithEnv()
  const routeRules = config.routeRules as Record<string, { headers?: Record<string, string> }> | undefined
  const homeHeaders = routeRules?.['/']?.headers

  expect(homeHeaders).toMatchObject({
    'cache-control': 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  })
})

it('netlify deploy previews send a global noindex header', async () => {
  const config = await loadConfigWithEnv({
    NODE_ENV: 'production',
    NETLIFY: 'true',
    CONTEXT: 'deploy-preview',
  })
  const routeRules = config.routeRules as Record<string, { headers?: Record<string, string> }> | undefined

  expect(routeRules?.['/']?.headers?.['X-Robots-Tag']).toBe('noindex, nofollow')
})

it('netlify production deploys stay indexable and send HSTS', async () => {
  const config = await loadConfigWithEnv({
    NODE_ENV: 'production',
    NETLIFY: 'true',
    CONTEXT: 'production',
  })
  const routeRules = config.routeRules as Record<string, { headers?: Record<string, string> }> | undefined
  const homeHeaders = routeRules?.['/']?.headers

  expect(homeHeaders?.['X-Robots-Tag']).toBeUndefined()
  expect(homeHeaders?.['Strict-Transport-Security']).toBe('max-age=31536000; includeSubDomains')
})
