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
    ? [Sentry.browserTracingIntegration()]
    : [],
})
