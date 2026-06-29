import { fileURLToPath } from 'node:url'
import { loadNuxtConfig } from '@nuxt/kit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildSentryRuntimePublicConfig,
  buildSentryServerRuntimeConfig,
  isSentrySourceMapUploadEnabled,
  sentryBeforeSend,
  shouldFilterSentry404,
} from '../app/utils/sentry'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))

afterEach(() => {
  vi.unstubAllEnvs()
})

async function loadConfigWithEnv(env: Record<string, string | undefined> = {}) {
  vi.resetModules()

  for (const [key, value] of Object.entries(env))
    vi.stubEnv(key, value)

  return await loadNuxtConfig({ cwd: projectRoot })
}

describe('sentry runtime config helpers', () => {
  it('enables Sentry only for production context with a DSN', () => {
    expect(buildSentryRuntimePublicConfig({
      nodeEnv: 'production',
      context: 'production',
      sentryDsn: 'https://public@example.ingest.sentry.io/1',
      sentryRelease: 'commit-sha',
    })).toEqual({
      sentryDsn: 'https://public@example.ingest.sentry.io/1',
      sentryEnabled: true,
      sentryEnvironment: 'production',
      sentryRelease: 'commit-sha',
    })

    expect(buildSentryRuntimePublicConfig({
      nodeEnv: 'production',
      context: 'deploy-preview',
      sentryDsn: 'https://public@example.ingest.sentry.io/1',
      sentryRelease: 'preview-sha',
    }).sentryEnabled).toBe(false)

    expect(buildSentryRuntimePublicConfig({
      nodeEnv: 'production',
      context: 'production',
      sentryDsn: undefined,
      sentryRelease: 'missing-dsn',
    }).sentryEnabled).toBe(false)
  })

  it('keeps server-side Sentry enabled in production when runtime has a DSN, even without Netlify CONTEXT', () => {
    expect(buildSentryServerRuntimeConfig({
      nodeEnv: 'production',
      sentryDsn: 'https://public@example.ingest.sentry.io/1',
      sentryEnvironment: 'production',
      sentryRelease: 'commit-sha',
    })).toEqual({
      sentryDsn: 'https://public@example.ingest.sentry.io/1',
      sentryEnabled: true,
      sentryEnvironment: 'production',
      sentryRelease: 'commit-sha',
    })

    expect(buildSentryServerRuntimeConfig({
      nodeEnv: 'production',
      sentryDsn: undefined,
      sentryRelease: 'missing-dsn',
    }).sentryEnabled).toBe(false)
  })

  it('only enables source map uploads for Netlify production builds with full Sentry credentials', () => {
    expect(isSentrySourceMapUploadEnabled({
      context: 'production',
      isNetlify: true,
      nodeEnv: 'production',
      sentryAuthToken: 'token',
      sentryDsn: 'https://public@example.ingest.sentry.io/1',
      sentryOrg: 'barz',
      sentryProject: 'portfolio-2024',
    })).toBe(true)

    expect(isSentrySourceMapUploadEnabled({
      context: 'production',
      isNetlify: false,
      nodeEnv: 'production',
      sentryAuthToken: 'token',
      sentryDsn: 'https://public@example.ingest.sentry.io/1',
      sentryOrg: 'barz',
      sentryProject: 'portfolio-2024',
    })).toBe(false)
  })

  it('filters expected 404 errors but keeps other errors', () => {
    expect(shouldFilterSentry404({}, {
      originalException: {
        statusCode: 404,
        statusMessage: 'Page Not Found',
        message: 'Post not found',
      },
    })).toBe(true)

    expect(shouldFilterSentry404({
      exception: {
        values: [
          {
            type: 'NuxtError',
            value: 'Page Not Found',
          },
        ],
      },
    }, {})).toBe(true)

    const serverErrorEvent = {
      type: undefined,
      exception: {
        values: [
          {
            type: 'Error',
            value: 'Internal Server Error',
          },
        ],
      },
    }

    expect(shouldFilterSentry404(serverErrorEvent, {
      originalException: {
        statusCode: 500,
        statusMessage: 'Internal Server Error',
      },
    })).toBe(false)
    expect(sentryBeforeSend(serverErrorEvent, {})).toBe(serverErrorEvent)
    expect(sentryBeforeSend(serverErrorEvent, {
      originalException: {
        statusCode: 404,
        statusMessage: 'Page Not Found',
      },
    })).toBeNull()
  })

  it('adds diagnostics to dynamic import failures', () => {
    const event = {
      type: undefined,
      exception: {
        values: [
          {
            type: 'TypeError',
            value: 'Failed to fetch dynamically imported module: https://barz.app/_nuxt/example.js',
          },
        ],
      },
    }

    expect(sentryBeforeSend(event, {})).toBe(event)
    expect(event).toMatchObject({
      tags: {
        'error.kind': 'chunk-load',
      },
      contexts: {
        chunk_load: {
          url: 'https://barz.app/_nuxt/example.js',
        },
      },
    })
  })
})

describe('nuxt sentry config', () => {
  it('enables production source map upload settings only on Netlify production', async () => {
    const config = await loadConfigWithEnv({
      NODE_ENV: 'production',
      NETLIFY: 'true',
      CONTEXT: 'production',
      COMMIT_REF: 'commit-sha',
      NUXT_PUBLIC_SENTRY_DSN: 'https://public@example.ingest.sentry.io/1',
      SENTRY_AUTH_TOKEN: 'token',
      SENTRY_ORG: 'barz',
      SENTRY_PROJECT: 'portfolio-2024',
    })

    expect(config.modules).toContain('@sentry/nuxt/module')
    expect(config.runtimeConfig?.public).toMatchObject({
      sentryDsn: 'https://public@example.ingest.sentry.io/1',
      sentryEnabled: true,
      sentryEnvironment: 'production',
      sentryRelease: 'commit-sha',
    })
    expect(config.sourcemap).toEqual({
      client: 'hidden',
      server: true,
    })
    expect(config.sentry).toMatchObject({
      authToken: 'token',
      org: 'barz',
      project: 'portfolio-2024',
    })
    const sentryModuleConfig = config.sentry
    expect(sentryModuleConfig).toBeTruthy()

    if (!sentryModuleConfig)
      throw new Error('Expected sentry module config to be enabled.')

    expect(sentryModuleConfig.sourcemaps?.disable).toBe(false)
    expect(sentryModuleConfig.sourcemaps?.filesToDeleteAfterUpload).toEqual(
      expect.arrayContaining([
        './**/*.map',
        '.nuxt/**/*.map',
        '.output/**/*.map',
      ]),
    )
    expect(config.nitro?.replace).toMatchObject({
      'process.env.SENTRY_RELEASE': JSON.stringify('commit-sha'),
    })
  })

  it('keeps Sentry runtime and source map upload disabled for deploy previews', async () => {
    const config = await loadConfigWithEnv({
      NODE_ENV: 'production',
      NETLIFY: 'true',
      CONTEXT: 'deploy-preview',
      COMMIT_REF: 'preview-sha',
      NUXT_PUBLIC_SENTRY_DSN: 'https://public@example.ingest.sentry.io/1',
      SENTRY_AUTH_TOKEN: 'token',
      SENTRY_ORG: 'barz',
      SENTRY_PROJECT: 'portfolio-2024',
    })

    expect(config.runtimeConfig?.public).toMatchObject({
      sentryEnabled: false,
      sentryEnvironment: 'deploy-preview',
      sentryRelease: 'preview-sha',
    })
    expect(config.sourcemap).toEqual({
      client: false,
      server: false,
    })
    const sentryModuleConfig = config.sentry

    if (!sentryModuleConfig)
      throw new Error('Expected sentry module config to be enabled.')

    expect(sentryModuleConfig.sourcemaps?.disable).toBe(true)
  })

  it('keeps automatic source map upload disabled outside Netlify production builds', async () => {
    const config = await loadConfigWithEnv({
      NODE_ENV: 'production',
      CONTEXT: 'production',
      COMMIT_REF: 'local-build-sha',
      NUXT_PUBLIC_SENTRY_DSN: 'https://public@example.ingest.sentry.io/1',
      SENTRY_AUTH_TOKEN: 'token',
      SENTRY_ORG: 'barz',
      SENTRY_PROJECT: 'portfolio-2024',
    })

    expect(config.runtimeConfig?.public).toMatchObject({
      sentryEnabled: true,
      sentryEnvironment: 'production',
      sentryRelease: 'local-build-sha',
    })
    expect(config.sourcemap).toEqual({
      client: false,
      server: false,
    })
    const sentryModuleConfig = config.sentry

    if (!sentryModuleConfig)
      throw new Error('Expected sentry module config to be enabled.')

    expect(sentryModuleConfig.sourcemaps?.disable).toBe(true)
  })
})
