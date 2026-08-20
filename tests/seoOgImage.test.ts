import { describe, expect, it } from 'vitest'

import { resolveStaticOgImageUrl } from '../app/utils/seoOgImage.ts'

describe('seo OG image utilities', () => {
  it('joins the site root and a root-relative static image with one slash', () => {
    expect(
      resolveStaticOgImageUrl('https://barz.app/', {
        url: '/project-images/nuxt-content-mermaid-wide.webp',
      }),
    ).toBe('https://barz.app/project-images/nuxt-content-mermaid-wide.webp')
  })
})
