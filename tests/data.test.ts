import { describe, expect, it } from 'vitest'

import { createPersonIdentity, seoData } from '../data/index.ts'

describe('data helpers', () => {
  it('builds valid person identity URLs from the configured site data', () => {
    const normalizedSiteUrl = seoData.mySite.replace(/\/$/, '')
    const identity = createPersonIdentity({
      baseUrl: `${normalizedSiteUrl}/`,
      imagePath: '/custom-profile.webp',
    })

    expect(identity).toMatchObject({
      url: normalizedSiteUrl,
      image: `${normalizedSiteUrl}/custom-profile.webp`,
      description: expect.any(String),
      worksFor: {
        '@id': `${normalizedSiteUrl}#organization`,
        'url': normalizedSiteUrl,
        'logo': `${normalizedSiteUrl}${seoData.icon}`,
      },
    })
    expect(identity.sameAs.every(url => URL.canParse(url))).toBe(true)
    expect(identity.knowsAbout.every(topic => topic.trim().length > 0)).toBe(true)
  })
})
