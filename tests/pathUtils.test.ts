import { describe, expect, it } from 'vitest'

import { buildCanonicalSiteUrl, canonicalizePagePath, decodeRouteParam, encodeCanonicalPagePath } from '../app/utils/pathUtils.ts'

describe('path utilities', () => {
  it('appends a trailing slash to content paths', () => {
    expect(canonicalizePagePath('/zh/projects/nuxt-content-mermaid')).toBe('/zh/projects/nuxt-content-mermaid/')
  })

  it('preserves the root path', () => {
    expect(canonicalizePagePath('/')).toBe('/')
  })

  it('builds canonical gallery slug URLs', () => {
    expect(
      buildCanonicalSiteUrl('https://barz.app/', '/gallery/blossoms-and-kids'),
    ).toBe('https://barz.app/gallery/blossoms-and-kids/')
  })

  it('encodes canonical gallery slug paths', () => {
    expect(encodeCanonicalPagePath('/gallery/blossoms-and-kids')).toBe('/gallery/blossoms-and-kids/')
  })

  it('decodes encoded gallery route params', () => {
    expect(decodeRouteParam('Blossoms%20%26%20Kids')).toBe('Blossoms & Kids')
  })
})
