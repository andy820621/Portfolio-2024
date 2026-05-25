import { describe, expect, it } from 'vitest'

import { normalizeRelatedLinks } from '../app/composables/useRelatedLinks.ts'

describe('related link normalization', () => {
  it('keeps trimmed external related links and note text', () => {
    expect(normalizeRelatedLinks([
      {
        title: '  Nuxt SEO Learn: Sitemaps  ',
        href: '  https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/sitemaps  ',
        note: '  Dynamic sitemap strategy  ',
      },
    ])).toEqual([
      {
        title: 'Nuxt SEO Learn: Sitemaps',
        href: 'https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/sitemaps',
        note: 'Dynamic sitemap strategy',
      },
    ])
  })

  it('drops entries missing a usable title, href, or external url', () => {
    expect(normalizeRelatedLinks([
      null,
      undefined,
      {},
      { title: 'Missing href' },
      { title: 'Internal page', href: '/posts/nuxt-canonical-i18n-internal-linking' },
      { title: 'Relative path', href: 'docs/nuxt-seo-learn' },
      { href: 'https://nuxtseo.com/learn-seo/nuxt/mastering-meta/titles' },
      { title: '   ', href: 'https://nuxtseo.com/learn-seo/nuxt/mastering-meta/titles' },
      { title: 'Valid', href: 'https://nuxtseo.com/learn-seo/nuxt/mastering-meta/titles' },
    ])).toEqual([
      {
        title: 'Valid',
        href: 'https://nuxtseo.com/learn-seo/nuxt/mastering-meta/titles',
        note: undefined,
      },
    ])
  })
})
