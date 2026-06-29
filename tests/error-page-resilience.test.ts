import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

describe('error page resilience', () => {
  it('does not depend on a dynamically loaded error layout', () => {
    const errorPage = readFileSync(`${projectRoot}/app/error.vue`, 'utf8')

    expect(errorPage).not.toContain('<NuxtLayout')
    expect(existsSync(`${projectRoot}/app/layouts/error.vue`)).toBe(false)
  })
})
