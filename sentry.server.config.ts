import process from 'node:process'
import * as Sentry from '@sentry/nuxt'
import { buildSentryServerRuntimeConfig, createSentryInitOptions } from './app/utils/sentry'

const runtimeConfig = buildSentryServerRuntimeConfig({
  nodeEnv: process.env.NODE_ENV,
  sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
  sentryEnvironment: process.env.SENTRY_ENVIRONMENT,
  sentryRelease: process.env.SENTRY_RELEASE,
})

Sentry.init(createSentryInitOptions({
  dsn: runtimeConfig.sentryDsn,
  enabled: runtimeConfig.sentryEnabled,
  environment: runtimeConfig.sentryEnvironment,
  release: runtimeConfig.sentryRelease,
}))
