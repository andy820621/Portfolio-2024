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

it('seo config disables canonical lowercasing for mixed-case routes', async () => {
  const config = await loadConfigWithEnv()
  const seoConfig = config.seo

  expect(seoConfig).not.toBe(false)

  if (!seoConfig)
    throw new Error('Expected seo module options to be enabled.')

  expect(seoConfig.canonicalLowercase).toBe(false)
})

it('llms config is enabled with key sections for AI tooling', async () => {
  const config = await loadConfigWithEnv()
  const modules = config.modules
  const llmsConfig = config.llms

  expect(Array.isArray(modules)).toBe(true)
  expect(modules).toContain('nuxt-llms')
  expect(llmsConfig).toBeTruthy()

  if (!llmsConfig)
    throw new Error('Expected llms config to be enabled.')

  expect(llmsConfig.domain).toMatch(/^https?:\/\//)
  expect(llmsConfig.title).toContain('Knowledge Map')
  expect(llmsConfig.full).toBeTruthy()

  if (!llmsConfig.full)
    throw new Error('Expected llms.full config to enable /llms-full.txt route.')

  expect(llmsConfig.full.title).toContain('Full Documentation')
  expect(Array.isArray(llmsConfig.sections)).toBe(true)
  expect(llmsConfig.sections.length).toBeGreaterThan(0)
  expect(llmsConfig.sections.map(section => section.title)).toEqual([
    'Start Here',
    'Core Technical Guides',
    'Featured Projects',
    'Media & Licensing',
    'Optional Chinese',
  ])
})

it('robots config keeps AI search access while blocking AI training crawlers', async () => {
  const config = await loadConfigWithEnv()
  const robotsConfig = config.robots

  expect(robotsConfig).toBeTruthy()

  if (!robotsConfig)
    throw new Error('Expected robots config to be enabled.')

  expect(robotsConfig.blockAiBots).toBe(false)

  const groups = robotsConfig.groups ?? []
  const searchGroup = groups.find(group => group.comment?.includes('Allow AI search bots'))
  const userFetchGroup = groups.find(group => group.comment?.includes('Allow user-triggered AI fetchers'))
  const trainingGroup = groups.find(group => group.comment?.includes('Block AI training crawlers'))

  expect(searchGroup?.allow).toEqual(['/'])
  expect(searchGroup?.disallow).toEqual(['/gallery-images/'])
  expect(userFetchGroup?.allow).toEqual(['/'])
  expect(userFetchGroup?.disallow).toEqual(['/gallery-images/'])
  expect(trainingGroup?.disallow).toEqual(['/'])
})

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
