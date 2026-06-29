import * as Sentry from '@sentry/nuxt'
import { createSentryInitOptions } from './app/utils/sentry'

const runtimeConfig = useRuntimeConfig()
const publicRuntimeConfig = runtimeConfig.public as Record<string, unknown>

function readString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function readBoolean(value: unknown) {
  if (typeof value === 'boolean')
    return value

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true')
      return true
    if (normalized === 'false')
      return false
  }

  return false
}

const sentryDsn = readString(publicRuntimeConfig.sentryDsn)
const sentryEnabled = readBoolean(publicRuntimeConfig.sentryEnabled)
const sentryEnvironment = readString(publicRuntimeConfig.sentryEnvironment)
const sentryRelease = readString(publicRuntimeConfig.sentryRelease)

Sentry.init({
  ...createSentryInitOptions({
    dsn: sentryDsn,
    enabled: sentryEnabled,
    environment: sentryEnvironment,
    release: sentryRelease,
  }),
  integrations: sentryEnabled
    ? [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ]
    : [],
  // In production, keep a low baseline replay sampling rate and capture full sessions on errors.
  replaysSessionSampleRate: sentryEnabled ? 0.1 : 0,
  replaysOnErrorSampleRate: sentryEnabled ? 1 : 0,
})
