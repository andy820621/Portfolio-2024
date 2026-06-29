import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

describe('error page resilience', () => {
  it('can raise a catch-all 404 without requiring i18n server context', () => {
    const catchAllPage = readFileSync(`${projectRoot}/app/pages/[...slug].vue`, 'utf8')

    expect(catchAllPage).not.toContain('useI18n()')
    expect(catchAllPage).not.toMatch(/\bt\('errorPage\.description'/)
    expect(catchAllPage).not.toContain('statusMessage:')
    expect(catchAllPage).not.toContain('message:')
    expect(catchAllPage).toContain('statusCode: 404')
  })

  it('uses the localized fallback description for catch-all 404 errors', () => {
    const catchAllPage = readFileSync(`${projectRoot}/app/pages/[...slug].vue`, 'utf8')
    const errorPage = readFileSync(`${projectRoot}/app/error.vue`, 'utf8')

    expect(catchAllPage).toContain('useLocalizedDescription: true')
    expect(errorPage).toContain('useLocalizedDescription')
  })

  it('does not depend on a dynamically loaded error layout', () => {
    const errorPage = readFileSync(`${projectRoot}/app/error.vue`, 'utf8')

    expect(errorPage).not.toContain('<NuxtLayout')
    expect(existsSync(`${projectRoot}/app/layouts/error.vue`)).toBe(false)
  })
})
