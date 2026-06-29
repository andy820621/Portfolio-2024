#!/usr/bin/env node

import { execFile } from 'node:child_process'
import { chmod, mkdir, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const REDACTED = '[REDACTED]'
const MAX_CLI_OUTPUT_BYTES = 64 * 1024 * 1024
const PROJECT_FILE_PATTERN = /(?:^|\/)(?:app|server|modules|scripts)\/|(?:^|\/)nuxt\.config\.[cm]?[jt]s$|(?:^|\/)content\.config\.[cm]?[jt]s$/i
const IDENTITY_PATH_PARTS = new Set(['actor', 'assignedto', 'assignee', 'contact', 'member', 'owner', 'person', 'profile', 'user'])

function normalizeKey(key) {
  return String(key).toLowerCase().replaceAll(/[^a-z0-9]/g, '')
}

function isSensitiveKey(key, pathParts) {
  const normalized = normalizeKey(key)

  if (
    normalized.includes('authorization')
    || normalized.includes('cookie')
    || normalized.includes('password')
    || normalized.includes('secret')
    || normalized.includes('token')
    || normalized.includes('apikey')
    || normalized === 'jwt'
    || normalized === 'email'
    || normalized === 'emailaddress'
    || normalized === 'phone'
    || normalized === 'phonenumber'
    || normalized === 'telephone'
    || normalized === 'mobile'
    || normalized === 'ip'
    || normalized === 'ipaddress'
    || normalized === 'remoteaddr'
  ) {
    return true
  }

  if (['firstname', 'fullname', 'lastname', 'realname'].includes(normalized)) {
    return true
  }

  return ['name', 'username'].includes(normalized)
    && pathParts.some(part => IDENTITY_PATH_PARTS.has(normalizeKey(part)))
}

function redactSensitiveString(value) {
  return value
    .replace(/\bBearer\s+[\w.~+/=-]+/gi, 'Bearer [REDACTED]')
    .replace(/\bsntrys_[\w-]+\b/g, '[REDACTED_TOKEN]')
    .replace(/\beyJ[\w-]{5,}\.[\w-]{5,}\.[\w-]{5,}\b/g, '[REDACTED_JWT]')
    .replace(/\b(?:access[_-]?token|refresh[_-]?token|auth(?:orization)?|jwt|token)\s*[:=]\s*[^&\s,;]+/gi, match => `${match.split(/[:=]/, 1)[0]}=[REDACTED]`)
    .replace(/\b(?:cookie|set-cookie)\s*[:=]\s*[^\s,;]+/gi, match => `${match.split(/[:=]/, 1)[0]}=[REDACTED]`)
    .replace(/[\w.%+-]+@[\w.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
    .replace(/\+\d[\d\s().-]{7,}\d/g, '[REDACTED_PHONE]')
    .replace(/\b0\d{1,3}[-\s]\d{3,4}[-\s]\d{3,4}\b/g, '[REDACTED_PHONE]')
}

function sanitizeUrl(value) {
  try {
    const url = new URL(value)
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/$/, value.endsWith('/') ? '/' : '')
  }
  catch {
    return redactSensitiveString(value)
  }
}

function redactHeaders(headers, pathParts) {
  if (!Array.isArray(headers)) {
    return redactSensitiveData(headers, pathParts)
  }

  return headers.map((header) => {
    if (!Array.isArray(header) || header.length < 2) {
      return redactSensitiveData(header, pathParts)
    }

    const [name, value, ...rest] = header
    const redactedValue = isSensitiveKey(name, pathParts)
      ? REDACTED
      : redactSensitiveData(value, [...pathParts, String(name)])

    return [name, redactedValue, ...rest.map(item => redactSensitiveData(item, pathParts))]
  })
}

export function redactSensitiveData(value, pathParts = []) {
  if (typeof value === 'string') {
    const currentKey = normalizeKey(pathParts.at(-1) ?? '')
    return ['url', 'requesturl'].includes(currentKey)
      ? sanitizeUrl(value)
      : redactSensitiveString(value)
  }

  if (Array.isArray(value)) {
    return value.map(item => redactSensitiveData(item, pathParts))
  }

  if (value === null || typeof value !== 'object') {
    return value
  }

  const isRequestEntry = normalizeKey(value.type ?? '') === 'request'
  const result = {}

  for (const [key, childValue] of Object.entries(value)) {
    const normalized = normalizeKey(key)
    const inRequest = pathParts.includes('$request')
    const childPath = [...pathParts, key]

    if (isSensitiveKey(key, pathParts)) {
      result[key] = REDACTED
      continue
    }

    if (inRequest && ['body', 'data', 'formdata', 'json'].includes(normalized)) {
      result[key] = REDACTED
      continue
    }

    if (normalized === 'headers') {
      result[key] = redactHeaders(childValue, childPath)
      continue
    }

    if (normalized === 'request') {
      result[key] = redactSensitiveData(childValue, [...childPath, '$request'])
      continue
    }

    if (isRequestEntry && normalized === 'data') {
      result[key] = redactSensitiveData(childValue, [...childPath, '$request'])
      continue
    }

    result[key] = redactSensitiveData(childValue, childPath)
  }

  return result
}

function getEntries(event) {
  return Array.isArray(event?.entries) ? event.entries : []
}

function getEntry(event, type) {
  return getEntries(event).find(entry => normalizeKey(entry?.type) === normalizeKey(type))
}

function getTagMap(event) {
  if (Array.isArray(event?.tags)) {
    return Object.fromEntries(event.tags
      .filter(tag => tag && typeof tag === 'object' && 'key' in tag)
      .map(tag => [normalizeKey(tag.key), tag.value]))
  }

  if (event?.tags && typeof event.tags === 'object') {
    return Object.fromEntries(Object.entries(event.tags).map(([key, value]) => [normalizeKey(key), value]))
  }

  return {}
}

function getExceptions(event) {
  const exceptionEntry = getEntry(event, 'exception')
  const values = exceptionEntry?.data?.values
    ?? event?.exception?.values
    ?? event?.exceptions

  return Array.isArray(values) ? values : []
}

function getLatestException(event) {
  return getExceptions(event).at(-1) ?? {}
}

function getFrames(event) {
  return getExceptions(event).flatMap((exception) => {
    const frames = exception?.stacktrace?.frames ?? exception?.stackTrace?.frames
    return Array.isArray(frames) ? frames : []
  })
}

function isInAppFrame(frame) {
  return frame?.inApp === true || frame?.in_app === true
}

function getFrameFilename(frame) {
  return frame?.filename ?? frame?.absPath ?? frame?.abs_path ?? frame?.module ?? 'unknown'
}

function selectRelevantFrames(event) {
  const frames = getFrames(event)
  const inAppFrames = frames.filter(isInAppFrame)

  if (inAppFrames.length > 0) {
    return inAppFrames.slice(-15)
  }

  const projectFrames = frames.filter(frame => PROJECT_FILE_PATTERN.test(getFrameFilename(frame)))
  return (projectFrames.length > 0 ? projectFrames : frames.slice(-10)).slice(-15)
}

function formatFrame(frame) {
  const functionName = frame?.function ?? frame?.functionName ?? frame?.function_name ?? '<anonymous>'
  const filename = getFrameFilename(frame)
  const line = frame?.lineNo ?? frame?.lineno ?? frame?.line
  const column = frame?.colNo ?? frame?.colno ?? frame?.column
  const location = [filename, line, column].filter(value => value !== undefined && value !== null && value !== '').join(':')
  return `at ${functionName} (${location})`
}

function getBreadcrumbs(event) {
  const breadcrumbEntry = getEntry(event, 'breadcrumbs')
  const values = breadcrumbEntry?.data?.values
    ?? event?.breadcrumbs?.values
    ?? event?.breadcrumbs

  return Array.isArray(values) ? values.slice(-20) : []
}

function getRequest(event) {
  return getEntry(event, 'request')?.data ?? event?.request ?? {}
}

function joinContextName(context) {
  if (!context || typeof context !== 'object') {
    return undefined
  }

  return [context.name, context.version].filter(Boolean).join(' ') || undefined
}

function stringValue(value, fallback = 'n/a') {
  if (value === false || value === 0) {
    return String(value)
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  return fallback
}

function inline(value) {
  return stringValue(value).replaceAll(/\s+/g, ' ').replaceAll('|', '\\|').trim()
}

function getRelease(event, tags) {
  if (typeof event?.release === 'string') {
    return event.release
  }

  return event?.release?.version ?? event?.release?.name ?? tags.release
}

function getStatusCode(event, request) {
  return request?.statusCode
    ?? request?.status_code
    ?? event?.response?.statusCode
    ?? event?.response?.status_code
    ?? event?.contexts?.response?.statusCode
    ?? event?.contexts?.response?.status_code
}

function normalizeEvents(events) {
  if (Array.isArray(events)) {
    return events
  }

  for (const key of ['events', 'data', 'results']) {
    if (Array.isArray(events?.[key])) {
      return events[key]
    }
  }

  return events && typeof events === 'object' ? [events] : []
}

function normalizeEvent(event) {
  if (!event?.event || typeof event.event !== 'object' || Array.isArray(event.event)) {
    return event
  }

  return {
    ...event,
    ...event.event,
    eventID: event.eventID ?? event.event.eventID,
    tags: event.event.tags ?? event.tags,
  }
}

function hasDiagnosticDetails(event) {
  return getEntries(event).length > 0
    || Boolean(event?.exception || event?.breadcrumbs || event?.request)
}

function normalizeIssue(issue) {
  return issue?.issue ?? issue?.data ?? issue
}

export function buildAiMarkdown(issueInput, eventsInput) {
  const issue = redactSensitiveData(normalizeIssue(issueInput) ?? {})
  const suppliedEvents = normalizeEvents(redactSensitiveData(eventsInput)).map(normalizeEvent)
  const fallbackEvent = normalizeEvent(issue?.event ?? issue?.latestEvent ?? issue?.latest_event)
  const events = fallbackEvent && !hasDiagnosticDetails(suppliedEvents[0])
    ? [fallbackEvent, ...suppliedEvents]
    : suppliedEvents
  const latestEvent = events[0] ?? {}
  const tags = getTagMap(latestEvent)
  const exception = getLatestException(latestEvent)
  const request = getRequest(latestEvent)
  const mechanism = exception?.mechanism ?? {}
  const shortId = issue?.shortId ?? issue?.shortID ?? issue?.short_id ?? issue?.id ?? 'unknown'
  const issueId = issue?.id ?? issue?.issueId ?? issue?.issue_id
  const environment = latestEvent?.environment ?? tags.environment
  const release = getRelease(latestEvent, tags)
  const transaction = latestEvent?.transaction ?? latestEvent?.route ?? tags.transaction
  const browser = tags.browser ?? joinContextName(latestEvent?.contexts?.browser)
  const os = tags.os ?? joinContextName(latestEvent?.contexts?.os)
  const device = tags.device ?? joinContextName(latestEvent?.contexts?.device)
  const level = latestEvent?.level ?? tags.level
  const handled = mechanism.handled ?? tags.handled
  const mechanismType = mechanism.type ?? tags.mechanism
  const statusCode = getStatusCode(latestEvent, request)
  const requestUrl = typeof request?.url === 'string' ? sanitizeUrl(request.url) : undefined
  const stackSections = events.slice(0, 5).map((event) => {
    const frames = selectRelevantFrames(event)
    if (frames.length === 0) {
      return undefined
    }

    const eventId = event?.eventID ?? event?.eventId ?? event?.id ?? 'unknown event'
    return [`### ${inline(eventId)}`, '```text', ...frames.map(formatFrame), '```'].join('\n')
  }).filter(Boolean)
  const breadcrumbs = getBreadcrumbs(latestEvent)
  const lines = [
    `# Sentry Issue ${inline(shortId)}`,
    '',
    '> Sanitized export for local AI analysis. Sensitive values and request bodies are redacted.',
    '',
    '## Summary',
    '',
    `- Title: ${inline(issue?.title ?? issue?.culprit)}`,
    `- Issue ID: ${inline(issueId)}`,
    `- Short ID: ${inline(shortId)}`,
    `- Error type: ${inline(exception?.type ?? issue?.type)}`,
    `- Error message: ${inline(exception?.value ?? exception?.message ?? issue?.message ?? issue?.title)}`,
    `- Environment: ${inline(environment)}`,
    `- Release: ${inline(release)}`,
    `- Route / transaction: ${inline(transaction ?? requestUrl)}`,
    `- First seen: ${inline(issue?.firstSeen ?? issue?.first_seen)}`,
    `- Last seen: ${inline(issue?.lastSeen ?? issue?.last_seen)}`,
    `- Events: ${inline(issue?.count ?? issue?.eventCount ?? issue?.event_count)}`,
    `- Users affected: ${inline(issue?.userCount ?? issue?.usersAffected ?? issue?.user_count)}`,
    '',
    '## Tags',
    '',
    `- Browser: ${inline(browser)}`,
    `- OS: ${inline(os)}`,
    `- Device: ${inline(device)}`,
    `- Level: ${inline(level)}`,
    `- Handled: ${inline(handled)}`,
    `- Mechanism: ${inline(mechanismType)}`,
    '',
    '## Request',
    '',
    `- ${inline(request?.method)} ${inline(requestUrl)}`,
    `- Status code: ${inline(statusCode)}`,
    '',
    '## Stack trace',
    '',
    ...(stackSections.length > 0 ? stackSections : ['No stack trace available.']),
    '',
    '## Recent breadcrumbs',
    '',
    ...(breadcrumbs.length > 0
      ? breadcrumbs.map((breadcrumb) => {
          const timestamp = inline(breadcrumb?.timestamp ?? breadcrumb?.dateCreated)
          const levelAndCategory = [breadcrumb?.level, breadcrumb?.category ?? breadcrumb?.type].filter(Boolean).map(inline).join('/')
          const message = inline(breadcrumb?.message ?? breadcrumb?.data?.url ?? breadcrumb?.data?.to)
          return `- ${timestamp}${levelAndCategory ? ` [${levelAndCategory}]` : ''} ${message}`
        })
      : ['No breadcrumbs available.']),
    '',
  ]

  return redactSensitiveString(lines.join('\n'))
}

export function buildSentryCommands(issueSelector, limit) {
  return [
    ['issue', 'view', issueSelector, '--json'],
    ['event', 'list', issueSelector, '--full', '--limit', String(limit), '--json'],
  ]
}

export function parseCliArgs(argv) {
  let issueSelector
  let limit = 5

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]

    if (argument === '--limit') {
      const value = argv[index + 1]
      if (!value) {
        throw new Error('The --limit option requires a value between 1 and 10.')
      }
      limit = Number(value)
      index += 1
      continue
    }

    if (argument.startsWith('-')) {
      throw new Error(`Unknown option: ${argument}`)
    }

    if (issueSelector) {
      throw new Error('Only one Sentry issue selector can be provided.')
    }

    issueSelector = argument
  }

  if (!issueSelector) {
    throw new Error('Usage: pnpm sentry:issue-ai <ISSUE> [--limit 1-10]')
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 10) {
    throw new Error('The event limit must be an integer between 1 and 10.')
  }

  const hasControlCharacter = [...issueSelector].some((character) => {
    const codePoint = character.codePointAt(0)
    return codePoint !== undefined && (codePoint <= 31 || codePoint === 127)
  })

  if (issueSelector.length > 200 || hasControlCharacter) {
    throw new Error('The Sentry issue selector is invalid.')
  }

  return { issueSelector, limit }
}

export function buildOutputPaths(outputDirectory, issueInput) {
  const issue = normalizeIssue(issueInput) ?? {}
  const identifier = issue.shortId ?? issue.shortID ?? issue.short_id ?? issue.id
  const safeIdentifier = String(identifier ?? 'unknown')
    .toUpperCase()
    .replaceAll(/[^A-Z0-9_-]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .slice(0, 120) || 'UNKNOWN'

  return {
    jsonPath: path.join(outputDirectory, `${safeIdentifier}.sentry.json`),
    markdownPath: path.join(outputDirectory, `${safeIdentifier}.sentry.ai.md`),
  }
}

async function runSentryCommand(arguments_) {
  try {
    const { stdout } = await execFileAsync('sentry', arguments_, {
      encoding: 'utf8',
      env: process.env,
      maxBuffer: MAX_CLI_OUTPUT_BYTES,
      windowsHide: true,
    })

    try {
      return JSON.parse(stdout.replace(/^\uFEFF/, ''))
    }
    catch {
      throw new Error('Sentry CLI returned invalid JSON. No raw output was written.')
    }
  }
  catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error('Sentry CLI is unavailable. Run `pnpm install` and retry.')
    }

    if (error?.message === 'Sentry CLI returned invalid JSON. No raw output was written.') {
      throw error
    }

    const detail = redactSensitiveString(String(error?.stderr ?? error?.message ?? 'Unknown CLI error'))
      .replaceAll(/\s+/g, ' ')
      .slice(0, 500)
    throw new Error(`Sentry CLI request failed: ${detail}`)
  }
}

async function writePrivateFile(filePath, content) {
  const temporaryPath = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.tmp`)
  await writeFile(temporaryPath, content, { encoding: 'utf8', mode: 0o600 })
  await rename(temporaryPath, filePath)
  await chmod(filePath, 0o600)
}

export async function main(argv = process.argv.slice(2)) {
  const { issueSelector, limit } = parseCliArgs(argv)
  const [issueArguments, eventArguments] = buildSentryCommands(issueSelector, limit)
  const [rawIssue, rawEvents] = await Promise.all([
    runSentryCommand(issueArguments),
    runSentryCommand(eventArguments),
  ])
  const issue = normalizeIssue(rawIssue) ?? {}
  const events = normalizeEvents(rawEvents)
  const sanitizedIssue = redactSensitiveData(issue)
  const sanitizedEvents = redactSensitiveData(events)
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  const outputDirectory = path.join(projectRoot, '.tmp', 'sentry')
  const outputPaths = buildOutputPaths(outputDirectory, sanitizedIssue)
  const exportedAt = new Date().toISOString()
  const json = JSON.stringify({
    exportedAt,
    redacted: true,
    source: { issueSelector, eventLimit: limit },
    issue: sanitizedIssue,
    events: sanitizedEvents,
  }, null, 2)
  const markdown = buildAiMarkdown(sanitizedIssue, sanitizedEvents)

  await mkdir(outputDirectory, { recursive: true, mode: 0o700 })
  await Promise.all([
    writePrivateFile(outputPaths.jsonPath, `${json}\n`),
    writePrivateFile(outputPaths.markdownPath, markdown),
  ])

  console.log(`Sanitized Sentry JSON: ${path.relative(projectRoot, outputPaths.jsonPath)}`)
  console.log(`AI-ready Markdown: ${path.relative(projectRoot, outputPaths.markdownPath)}`)

  return outputPaths
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(redactSensitiveString(String(error?.message ?? error)))
    process.exitCode = 1
  })
}
