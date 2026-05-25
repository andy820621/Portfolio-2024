import { describe, expect, it } from 'vitest'

import { normalizeRelatedLinks } from '../app/composables/useRelatedLinks.ts'

describe('related link normalization', () => {
  it('trims valid related links and marks internal destinations', () => {
    expect(normalizeRelatedLinks([
      {
        title: '  Nuxt SEO Learn: Sitemaps  ',
        href: '  https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/sitemaps  ',
        note: '  Dynamic sitemap strategy  ',
      },
      {
        title: ' Canonical URLs ',
        href: ' /posts/nuxt-canonical-i18n-internal-linking ',
      },
    ])).toEqual([
      {
        title: 'Nuxt SEO Learn: Sitemaps',
        href: 'https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/sitemaps',
        note: 'Dynamic sitemap strategy',
        isExternal: true,
      },
      {
        title: 'Canonical URLs',
        href: '/posts/nuxt-canonical-i18n-internal-linking',
        note: undefined,
        isExternal: false,
      },
    ])
  })

  it('drops entries missing a usable title or href', () => {
    expect(normalizeRelatedLinks([
      null,
      undefined,
      {},
      { title: 'Missing href' },
      { href: 'https://nuxtseo.com/learn-seo/nuxt/mastering-meta/titles' },
      { title: '   ', href: 'https://nuxtseo.com/learn-seo/nuxt/mastering-meta/titles' },
      { title: 'Valid', href: 'https://nuxtseo.com/learn-seo/nuxt/mastering-meta/titles' },
    ])).toEqual([
      {
        title: 'Valid',
        href: 'https://nuxtseo.com/learn-seo/nuxt/mastering-meta/titles',
        note: undefined,
        isExternal: true,
      },
    ])
  })
})
