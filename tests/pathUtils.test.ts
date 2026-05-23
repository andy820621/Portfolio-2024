import { describe, expect, it } from 'vitest'

import { buildCanonicalSiteUrl, buildCanonicalSiteUrlWithQuery, canonicalizePagePath, decodeRouteParam, encodeCanonicalPagePath } from '../app/utils/pathUtils.ts'
import { seoData } from '../data/index.ts'

describe('path utilities', () => {
  it('appends a trailing slash to content paths', () => {
    expect(canonicalizePagePath('/zh/projects/nuxt-content-mermaid')).toBe('/zh/projects/nuxt-content-mermaid/')
  })

  it('preserves the root path', () => {
    expect(canonicalizePagePath('/')).toBe('/')
  })

  it('builds canonical gallery slug URLs', () => {
    expect(
      buildCanonicalSiteUrl(seoData.mySite, '/gallery/blossoms-and-kids'),
    ).toBe(`${seoData.mySite.replace(/\/$/, '')}/gallery/blossoms-and-kids/`)
  })

  it('builds canonical paginated URLs without page query for page 1', () => {
    expect(
      buildCanonicalSiteUrlWithQuery(seoData.mySite, '/posts', { page: undefined }),
    ).toBe(`${seoData.mySite.replace(/\/$/, '')}/posts/`)
  })

  it('builds canonical paginated URLs with page query for page > 1', () => {
    expect(
      buildCanonicalSiteUrlWithQuery(seoData.mySite, '/posts', { page: 2 }),
    ).toBe(`${seoData.mySite.replace(/\/$/, '')}/posts/?page=2`)
  })

  it('encodes canonical gallery slug paths', () => {
    expect(encodeCanonicalPagePath('/gallery/blossoms-and-kids')).toBe('/gallery/blossoms-and-kids/')
  })

  it('decodes encoded gallery route params', () => {
    expect(decodeRouteParam('Blossoms%20%26%20Kids')).toBe('Blossoms & Kids')
  })
})
