import * as Sentry from '@sentry/nuxt'
import { createSentryInitOptions } from './app/utils/sentry'

const runtimeConfig = useRuntimeConfig()

Sentry.init({
  ...createSentryInitOptions({
    dsn: runtimeConfig.public.sentryDsn,
    enabled: runtimeConfig.public.sentryEnabled,
    environment: runtimeConfig.public.sentryEnvironment,
    release: runtimeConfig.public.sentryRelease,
  }),
  integrations: runtimeConfig.public.sentryEnabled
    ? [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ]
    : [],
  // In production, keep a low baseline replay sampling rate and capture full sessions on errors.
  replaysSessionSampleRate: runtimeConfig.public.sentryEnabled ? 0.1 : 0,
  replaysOnErrorSampleRate: runtimeConfig.public.sentryEnabled ? 1 : 0,
})
