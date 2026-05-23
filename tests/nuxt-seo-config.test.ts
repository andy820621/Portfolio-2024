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

it('llms config is enabled with key sections for AI tooling', async () => {
  const config = await loadNuxtConfig({ cwd: projectRoot })
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
})
