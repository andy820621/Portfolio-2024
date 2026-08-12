import { describe, expect, it } from 'vitest'
import { resolveOutboundDestinationType } from '../app/utils/outboundDestination'

describe('resolveOutboundDestinationType', () => {
  it.each([
    ['https://github.com/andy820621/nuxt-content-mermaid', 'github'],
    ['https://docs.github.com/en', 'github'],
    ['https://www.npmjs.com/package/@barzhsieh/nuxt-content-mermaid', 'npm'],
    ['https://docs.npmjs.com/', 'npm'],
    ['https://mermaid.js.org/', 'tool'],
  ] as const)('classifies %s as %s', (href, expected) => {
    expect(resolveOutboundDestinationType(new URL(href))).toBe(expected)
  })
})
