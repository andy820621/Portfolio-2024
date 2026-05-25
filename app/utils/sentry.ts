import type { ErrorEvent, EventHint } from '@sentry/nuxt'

interface SentryEnvironmentInput {
  context?: string
  nodeEnv?: string
}

interface SentryReleaseInput {
  commitRef?: string
  sentryRelease?: string
}

interface SentryRuntimeConfigInput extends SentryEnvironmentInput, SentryReleaseInput {
  sentryDsn?: string
}

interface SentryServerRuntimeConfigInput extends SentryReleaseInput {
  nodeEnv?: string
  sentryDsn?: string
  sentryEnvironment?: string
}

interface SentrySourceMapUploadInput extends SentryRuntimeConfigInput {
  sentryAuthToken?: string
  sentryOrg?: string
  sentryProject?: string
}

interface SentryInitOptionsInput {
  dsn?: string
  enabled?: boolean
  environment?: string
  release?: string
}

type SentryErrorEventLike = Partial<ErrorEvent>

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object')
    return undefined

  return value as Record<string, unknown>
}

function readNumber(record: Record<string, unknown> | undefined, key: string) {
  const value = record?.[key]

  if (typeof value === 'number')
    return value

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  return undefined
}

function readString(record: Record<string, unknown> | undefined, key: string) {
  const value = record?.[key]
  return typeof value === 'string' ? value : undefined
}

function extractStatusCode(event?: SentryErrorEventLike, hint?: EventHint) {
  const originalException = asRecord(hint?.originalException)
  const eventExtra = asRecord(event?.extra)
  const eventResponseContext = asRecord(asRecord(event?.contexts)?.response)

  return (
    readNumber(originalException, 'statusCode')
    ?? readNumber(originalException, 'status')
    ?? readNumber(asRecord(originalException?.response), 'statusCode')
    ?? readNumber(asRecord(originalException?.response), 'status')
    ?? readNumber(eventExtra, 'statusCode')
    ?? readNumber(eventResponseContext, 'status_code')
    ?? readNumber(eventResponseContext, 'statusCode')
    ?? readNumber(eventResponseContext, 'status')
    ?? readNumber(event?.tags ? { statusCode: event.tags['http.status_code'] } : undefined, 'statusCode')
  )
}

function extractMessages(event?: SentryErrorEventLike, hint?: EventHint) {
  const originalException = asRecord(hint?.originalException)
  const exceptionValues = event?.exception?.values ?? []

  return [
    event?.message,
    ...exceptionValues.flatMap(value => [value.type, value.value]),
    readString(originalException, 'message'),
    readString(originalException, 'statusMessage'),
  ]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
}

export function resolveSentryRelease({ commitRef, sentryRelease }: SentryReleaseInput) {
  return sentryRelease || commitRef || undefined
}

export function resolveSentryEnvironment({ context, nodeEnv }: SentryEnvironmentInput) {
  return context || nodeEnv || 'development'
}

export function isSentryServerEnabled({ nodeEnv, sentryDsn }: Pick<SentryServerRuntimeConfigInput, 'nodeEnv' | 'sentryDsn'>) {
  return nodeEnv === 'production'
    && typeof sentryDsn === 'string'
    && sentryDsn.length > 0
}

export function isSentryEnabled({ context, nodeEnv, sentryDsn }: SentryRuntimeConfigInput) {
  return isSentryServerEnabled({ nodeEnv, sentryDsn })
    && context === 'production'
}

export function buildSentryRuntimePublicConfig(input: SentryRuntimeConfigInput) {
  return {
    sentryDsn: input.sentryDsn,
    sentryEnabled: isSentryEnabled(input),
    sentryEnvironment: resolveSentryEnvironment(input),
    sentryRelease: resolveSentryRelease(input),
  }
}

export function buildSentryServerRuntimeConfig(input: SentryServerRuntimeConfigInput) {
  return {
    sentryDsn: input.sentryDsn,
    sentryEnabled: isSentryServerEnabled(input),
    sentryEnvironment: input.sentryEnvironment || input.nodeEnv || 'development',
    sentryRelease: resolveSentryRelease(input),
  }
}

export function isSentrySourceMapUploadEnabled(input: SentrySourceMapUploadInput) {
  return isSentryEnabled(input)
    && typeof input.sentryAuthToken === 'string'
    && input.sentryAuthToken.length > 0
    && typeof input.sentryOrg === 'string'
    && input.sentryOrg.length > 0
    && typeof input.sentryProject === 'string'
    && input.sentryProject.length > 0
}

export function shouldFilterSentry404(event?: SentryErrorEventLike, hint?: EventHint) {
  const statusCode = extractStatusCode(event, hint)

  if (statusCode === 404)
    return true

  return extractMessages(event, hint).some(message =>
    message === 'Page Not Found'
    || message.includes('404 - Page Not Found')
    || /^404\b/.test(message)
    || /not found/i.test(message),
  )
}

export function sentryBeforeSend<T extends ErrorEvent>(event: T, hint?: EventHint) {
  return shouldFilterSentry404(event, hint) ? null : event
}

export function createSentryInitOptions(input: SentryInitOptionsInput) {
  return {
    beforeSend: sentryBeforeSend,
    dsn: input.dsn,
    enabled: !!input.enabled,
    environment: input.environment,
    release: input.release,
    sendDefaultPii: false,
    tracesSampleRate: input.enabled ? 1 : 0,
  }
}
