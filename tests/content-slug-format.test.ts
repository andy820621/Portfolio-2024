import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const SLUG_FILENAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const contentGroups = [
  'en/posts',
  'zh/posts',
  'en/projects',
  'zh/projects',
] as const

function getMarkdownSlugStems(group: string) {
  const dir = join(projectRoot, 'content', group)

  return readdirSync(dir)
    .filter(file => file.endsWith('.md'))
    .map(file => file.slice(0, -3))
}

describe('content slug format', () => {
  it('keeps post and project filenames in lowercase kebab-case', () => {
    const invalidByGroup = contentGroups.reduce<Record<string, string[]>>((acc, group) => {
      const invalid = getMarkdownSlugStems(group).filter(stem => !SLUG_FILENAME_REGEX.test(stem))

      if (invalid.length)
        acc[group] = invalid

      return acc
    }, {})

    expect(invalidByGroup).toEqual({})
  })
})
