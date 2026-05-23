import { describe, expect, it } from 'vitest'

import { createPersonIdentity, seoData } from '../data/index.ts'

describe('data helpers', () => {
  it('builds the person identity schema with the expected expertise topics', () => {
    const identity = createPersonIdentity({ baseUrl: seoData.mySite })

    const normalizedSiteUrl = seoData.mySite.replace(/\/$/, '')
    const siteLogoUrl = `${normalizedSiteUrl}${seoData.icon}`

    expect(identity).toMatchObject({
      name: 'BarZ Hsieh',
      alternateName: 'Hsieh Yao Tsu',
      url: normalizedSiteUrl,
      description: expect.any(String),
      email: 'andy820621@gmail.com',
      jobTitle: 'Frontend Engineer',
      knowsLanguage: ['en-US', 'zh-TW', 'ja-JP'],
      image: siteLogoUrl,
    })

    expect(identity.url).toBe(normalizedSiteUrl)
    expect(identity.knowsAbout).toEqual([
      'Web Design',
      'Frontend Development',
      'Graphic Design',
      'Blogs',
      'SEO',
      'UI/UX',
      'Nuxt',
      'Vue',
      'TypeScript',
      'JavaScript',
      'HTML',
      'CSS',
    ])
    expect(identity.sameAs).toEqual([
      'https://x.com/Barz3064',
      'https://www.instagram.com/andy820621',
      'https://github.com/andy820621',
    ])
    expect(identity.worksFor).toMatchObject({
      '@id': `${normalizedSiteUrl}#organization`,
      'name': normalizedSiteUrl.replace(/^https?:\/\//, '').replace(/^www\./, ''),
      'url': normalizedSiteUrl,
      'logo': siteLogoUrl,
    })
  })
})
