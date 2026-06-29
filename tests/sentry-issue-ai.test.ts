import { describe, expect, it } from 'vitest'
import {
  buildAiMarkdown,
  buildOutputPaths,
  buildSentryCommands,
  parseCliArgs,
  redactSensitiveData,
} from '../scripts/sentry-issue-ai.js'

const issue = {
  id: '123456789',
  shortId: 'FRONTEND-123',
  title: 'TypeError: Cannot read properties of undefined',
  count: '42',
  userCount: 7,
  firstSeen: '2026-06-01T01:02:03Z',
  lastSeen: '2026-06-29T04:05:06Z',
}

function createEvent() {
  return {
    eventID: 'event-1',
    dateCreated: '2026-06-29T04:05:06Z',
    environment: 'production',
    release: { version: 'portfolio@abc123' },
    transaction: '/projects/[slug]',
    tags: [
      { key: 'browser', value: 'Chrome 137' },
      { key: 'os', value: 'macOS 15' },
      { key: 'device', value: 'Mac' },
      { key: 'level', value: 'error' },
      { key: 'handled', value: 'no' },
      { key: 'mechanism', value: 'onerror' },
    ],
    entries: [
      {
        type: 'exception',
        data: {
          values: [{
            type: 'TypeError',
            value: 'Cannot read properties of undefined',
            mechanism: { handled: false, type: 'onerror' },
            stacktrace: {
              frames: [
                { filename: 'node_modules/nuxt/dist/app.js', function: 'render', lineNo: 10, inApp: false },
                { filename: 'app/pages/projects/[slug].vue', function: 'loadProject', lineNo: 42, colNo: 7, inApp: true },
              ],
            },
          }],
        },
      },
      {
        type: 'breadcrumbs',
        data: {
          values: Array.from({ length: 22 }, (_, index) => ({
            timestamp: `2026-06-29T04:04:${String(index).padStart(2, '0')}Z`,
            category: 'navigation',
            level: 'info',
            message: `breadcrumb-${index + 1}`,
          })),
        },
      },
      {
        type: 'request',
        data: {
          method: 'GET',
          url: 'https://example.com/projects/demo?access_token=secret#private',
          status_code: 500,
          headers: [
            ['Authorization', 'Bearer secret-token'],
            ['Cookie', 'session=secret'],
            ['Accept', 'text/html'],
          ],
          data: { email: 'person@example.com', name: 'Real Person' },
        },
      },
    ],
  }
}

describe('redactSensitiveData', () => {
  it('redacts credentials and personal data without dropping useful diagnostics', () => {
    const result = redactSensitiveData({
      authorization: 'Bearer top-secret',
      refresh_token: 'refresh-secret',
      user: {
        id: 'anonymous-123',
        email: 'person@example.com',
        phone: '+886 912 345 678',
        name: 'Real Person',
      },
      request: {
        method: 'POST',
        url: 'https://example.com/path?jwt=secret#fragment',
        headers: [
          ['Cookie', 'session=secret'],
          ['Accept', 'application/json'],
        ],
        body: { private: 'value' },
      },
      message: 'Contact person@example.com or +886 912 345 678 with token=abc123; CLI token sntrys_exampleSecret',
      environment: 'production',
    })

    expect(result).toEqual({
      authorization: '[REDACTED]',
      refresh_token: '[REDACTED]',
      user: {
        id: 'anonymous-123',
        email: '[REDACTED]',
        phone: '[REDACTED]',
        name: '[REDACTED]',
      },
      request: {
        method: 'POST',
        url: 'https://example.com/path',
        headers: [
          ['Cookie', '[REDACTED]'],
          ['Accept', 'application/json'],
        ],
        body: '[REDACTED]',
      },
      message: 'Contact [REDACTED_EMAIL] or [REDACTED_PHONE] with token=[REDACTED]; CLI token [REDACTED_TOKEN]',
      environment: 'production',
    })
  })
})

describe('buildAiMarkdown', () => {
  it('renders the required issue fields while preferring project stack frames and recent breadcrumbs', () => {
    const markdown = buildAiMarkdown(issue, [createEvent()])

    expect(markdown).toContain('# Sentry Issue FRONTEND-123')
    expect(markdown).toContain('TypeError: Cannot read properties of undefined')
    expect(markdown).toContain('production')
    expect(markdown).toContain('portfolio@abc123')
    expect(markdown).toContain('/projects/[slug]')
    expect(markdown).toContain('Events: 42')
    expect(markdown).toContain('Users affected: 7')
    expect(markdown).toContain('app/pages/projects/[slug].vue:42:7')
    expect(markdown).not.toContain('node_modules/nuxt/dist/app.js')
    expect(markdown).toContain('Chrome 137')
    expect(markdown).toContain('macOS 15')
    expect(markdown).toContain('GET https://example.com/projects/demo')
    expect(markdown).toContain('Status code: 500')
    expect(markdown).not.toContain('breadcrumb-1\n')
    expect(markdown).not.toContain('breadcrumb-2\n')
    expect(markdown).toContain('breadcrumb-3')
    expect(markdown).toContain('breadcrumb-22')
    expect(markdown).not.toContain('secret-token')
    expect(markdown).not.toContain('person@example.com')
  })

  it('uses the full event embedded by the issue view command as a fallback', () => {
    const markdown = buildAiMarkdown({ ...issue, event: createEvent() }, [])

    expect(markdown).toContain('production')
    expect(markdown).toContain('app/pages/projects/[slug].vue:42:7')
  })

  it('prefers the embedded full event when an event list item only contains summary fields', () => {
    const markdown = buildAiMarkdown(
      { ...issue, event: createEvent() },
      [{ eventID: 'summary-only', title: issue.title }],
    )

    expect(markdown).toContain('production')
    expect(markdown).toContain('app/pages/projects/[slug].vue:42:7')
  })
})

describe('cli helpers', () => {
  it('builds non-shell Sentry CLI commands with full event JSON', () => {
    expect(buildSentryCommands('FRONTEND-123', 5)).toEqual([
      ['issue', 'view', 'FRONTEND-123', '--json'],
      ['event', 'list', 'FRONTEND-123', '--full', '--limit', '5', '--json'],
    ])
  })

  it('parses an issue selector and bounded event limit', () => {
    expect(parseCliArgs(['FRONTEND-123', '--limit', '3'])).toEqual({
      issueSelector: 'FRONTEND-123',
      limit: 3,
    })
    expect(() => parseCliArgs([])).toThrowError('Usage:')
    expect(() => parseCliArgs(['FRONTEND-123', '--limit', '0'])).toThrowError('between 1 and 10')
  })

  it('creates safe output filenames from canonical issue data', () => {
    expect(buildOutputPaths('/repo/.tmp/sentry', issue)).toEqual({
      jsonPath: '/repo/.tmp/sentry/FRONTEND-123.sentry.json',
      markdownPath: '/repo/.tmp/sentry/FRONTEND-123.sentry.ai.md',
    })
  })
})
