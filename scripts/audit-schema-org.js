#!/usr/bin/env node

import { access, readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const projectRoot = resolve(__dirname, '..')
const defaultOutputDir = join(projectRoot, '.output', 'public')

const SUPPORTED_SCHEMA_TYPES = new Set([
  'Article',
  'NewsArticle',
  'BlogPosting',
  'ScholarlyArticle',
  'Product',
  'AggregateOffer',
  'Offer',
  'FAQPage',
  'Question',
  'HowTo',
  'HowToStep',
  'Recipe',
  'Event',
  'LocalBusiness',
  'Restaurant',
  'JobPosting',
  'Course',
  'Movie',
  'Book',
  'SoftwareApplication',
  'VideoObject',
  'Review',
  'AggregateRating',
  'BreadcrumbList',
  'SearchAction',
  'Dataset',
  'SpecialAnnouncement',
  'Person',
  'NewsMediaOrganization',
  'Organization',
])

const SCHEMA_VALIDATION_RULES = {
  Article: {
    required: [],
    recommended: ['author', 'author.name', 'dateModified', 'datePublished', 'headline', 'image'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/article',
  },
  NewsArticle: {
    required: [],
    recommended: ['author', 'author.name', 'dateModified', 'datePublished', 'headline', 'image'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/article',
  },
  BlogPosting: {
    required: [],
    recommended: ['author', 'author.name', 'dateModified', 'datePublished', 'headline', 'image'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/article',
  },
  Product: {
    required: ['name'],
    recommended: ['description', 'offers', 'offers.price', 'offers.priceCurrency', 'offers.availability', 'aggregateRating', 'review', 'image'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/product',
  },
  FAQPage: {
    required: ['mainEntity'],
    recommended: [],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/faqpage',
  },
  Recipe: {
    required: ['name', 'image'],
    recommended: ['aggregateRating', 'author', 'cookTime', 'datePublished', 'description', 'keywords', 'nutrition', 'prepTime', 'recipeCategory', 'recipeCuisine', 'recipeIngredient', 'recipeInstructions', 'recipeYield', 'totalTime', 'video'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/recipe',
  },
  Event: {
    required: ['name', 'location', 'startDate'],
    recommended: ['description', 'endDate', 'eventStatus', 'image', 'offers', 'performer', 'organizer'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/event',
  },
  LocalBusiness: {
    required: ['name', 'address'],
    recommended: ['aggregateRating', 'department', 'geo', 'openingHoursSpecification', 'priceRange', 'telephone', 'url'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/local-business',
  },
  Restaurant: {
    required: ['name', 'address'],
    recommended: ['aggregateRating', 'servesCuisine', 'hasMenu', 'geo', 'openingHoursSpecification', 'priceRange', 'telephone', 'url'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/local-business',
  },
  Review: {
    required: ['author', 'itemReviewed', 'reviewRating'],
    recommended: ['datePublished', 'reviewRating.bestRating', 'reviewRating.worstRating'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/review-snippet',
  },
  AggregateRating: {
    required: ['itemReviewed', 'ratingValue'],
    recommended: ['bestRating', 'worstRating', 'ratingCount', 'reviewCount'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/review-snippet',
  },
  BreadcrumbList: {
    required: ['itemListElement'],
    recommended: [],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/breadcrumb',
  },
  Organization: {
    required: [],
    recommended: ['name', 'logo', 'url', 'email', 'telephone', 'contactPoint', 'sameAs', 'address', 'description'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/organization',
  },
  Person: {
    required: [],
    recommended: ['name', 'url', 'image', 'sameAs', 'jobTitle', 'worksFor'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/person',
  },
  SoftwareApplication: {
    required: ['name', 'offers'],
    recommended: ['applicationCategory', 'operatingSystem', 'aggregateRating', 'review'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/software-app',
  },
  VideoObject: {
    required: ['name', 'thumbnailUrl', 'uploadDate'],
    recommended: ['contentUrl', 'description', 'duration', 'embedUrl'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/video',
  },
  JobPosting: {
    required: ['datePosted', 'description', 'hiringOrganization', 'jobLocation', 'title'],
    recommended: ['applicantLocationRequirements', 'baseSalary', 'employmentType', 'jobLocationType', 'validThrough'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/job-posting',
  },
  Course: {
    required: ['description', 'name'],
    recommended: ['provider'],
    documentationUrl: 'https://developers.google.com/search/docs/appearance/structured-data/course',
  },
}

const SKIPPED_HTML_FILES = new Set(['/200.html', '/404.html'])

const WINDOWS_PATH_SEPARATOR_RE = /\\/g
const HTML_SUFFIX_RE = /\.html$/i
const XML_ROUTE_RE = /(?:^|\/)sitemap[^/]*\.xml\/index\.html$/i
const MULTIPLE_WHITESPACE_RE = /\s+/g
const SCRIPT_TAG_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi
const ATTRIBUTE_RE = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g

function printHelp() {
  console.log(`
Schema.org audit script

Usage:
  node scripts/audit-schema-org.js
  node scripts/audit-schema-org.js --strict
  node scripts/audit-schema-org.js --details
  node scripts/audit-schema-org.js --json
  node scripts/audit-schema-org.js --dir .output/public

Options:
  --dir <path>   Specify the prerendered output directory to audit.
  --json         Print JSON output instead of a human-readable report.
  --details      Print page-by-page findings for pages with issues.
  --strict       Exit with code 1 when any warning or error is found.
  --verbose      Print all pages, including those without findings.
  --help         Show this message.
`)
}

function parseArgs(argv) {
  const options = {
    dir: defaultOutputDir,
    details: false,
    json: false,
    strict: false,
    verbose: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--')
      continue

    if (arg === '--dir') {
      const next = argv[index + 1]
      if (!next)
        throw new Error('Missing value for --dir')
      options.dir = resolve(process.cwd(), next)
      index += 1
      continue
    }

    if (arg === '--json') {
      options.json = true
      continue
    }

    if (arg === '--details') {
      options.details = true
      continue
    }

    if (arg === '--strict') {
      options.strict = true
      continue
    }

    if (arg === '--verbose') {
      options.verbose = true
      continue
    }

    if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

async function ensureDirectoryExists(dirPath) {
  try {
    await access(dirPath)
  }
  catch {
    throw new Error(`找不到可掃描的輸出目錄: ${dirPath}\n請先執行 pnpm build；若要改用完整靜態快照再執行 pnpm generate。`)
  }
}

async function findHtmlFiles(dir, baseDir = dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await findHtmlFiles(fullPath, baseDir))
    }
    else if (entry.name.endsWith('.html')) {
      const relativePath = `/${relative(baseDir, fullPath).replace(WINDOWS_PATH_SEPARATOR_RE, '/')}`
      files.push(relativePath)
    }
  }

  return files
}

function shouldSkipHtmlFile(relativePath) {
  return SKIPPED_HTML_FILES.has(relativePath)
    || XML_ROUTE_RE.test(relativePath)
    || relativePath.startsWith('/_')
    || relativePath.startsWith('/__')
    || relativePath.startsWith('/.well-known/')
}

function htmlFileToRoute(relativePath) {
  if (relativePath === '/index.html')
    return '/'

  if (relativePath.endsWith('/index.html'))
    return relativePath.slice(0, -'index.html'.length)

  return relativePath.replace(HTML_SUFFIX_RE, '')
}

function normalizeText(value = '') {
  return String(value).replace(MULTIPLE_WHITESPACE_RE, ' ').trim()
}

function truncateText(value, maxLength = 120) {
  if (value.length <= maxLength)
    return value

  return `${value.slice(0, maxLength - 1)}…`
}

function parseAttributes(tagSource) {
  const attributes = {}

  for (const match of tagSource.matchAll(ATTRIBUTE_RE)) {
    const [, rawName, doubleQuoted, singleQuoted, bareValue] = match
    const name = rawName.toLowerCase()

    if (name === 'script')
      continue

    const value = doubleQuoted ?? singleQuoted ?? bareValue ?? ''
    attributes[name] = value
  }

  return attributes
}

function extractSchemaGraphScripts(htmlSource) {
  const matches = []

  for (const match of htmlSource.matchAll(SCRIPT_TAG_RE)) {
    const tagSource = `<script${match[1]}>`
    const attributes = parseAttributes(tagSource)
    if (attributes.type?.toLowerCase() !== 'application/ld+json')
      continue
    if (!('data-nuxt-schema-org' in attributes))
      continue

    matches.push(match[2])
  }

  return matches
}

function createFinding(level, code, message, extra = {}) {
  return { level, code, message, ...extra }
}

function getSchemaType(node) {
  if (!node || !node['@type'])
    return 'Unknown'

  return Array.isArray(node['@type']) ? node['@type'][0] : node['@type']
}

function isRichResultType(type) {
  return SUPPORTED_SCHEMA_TYPES.has(type)
}

function getNodeLabel(node) {
  const type = getSchemaType(node)

  if (node.name)
    return node.name
  if (node.headline)
    return node.headline
  if (node.title)
    return node.title
  if (node.description) {
    return typeof node.description === 'string'
      ? node.description.substring(0, 100) + (node.description.length > 100 ? '...' : '')
      : ''
  }
  if (node['@id'])
    return node['@id']
  if (node.url)
    return node.url

  return `${type} Schema`
}

function collectSchemaNodes(value, collectedNodes, visitedObjects) {
  if (!value || typeof value !== 'object' || visitedObjects.has(value))
    return

  visitedObjects.add(value)

  if (value['@type'] && Object.keys(value).length > 1)
    collectedNodes.push(value)

  for (const child of Object.values(value)) {
    if (Array.isArray(child)) {
      for (const item of child)
        collectSchemaNodes(item, collectedNodes, visitedObjects)
    }
    else if (typeof child === 'object') {
      collectSchemaNodes(child, collectedNodes, visitedObjects)
    }
  }
}

function resolveNodeReferences(node, nodeMap) {
  const resolvedNode = { ...node }

  Object.keys(resolvedNode).forEach((key) => {
    const value = resolvedNode[key]
    if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 1 && value['@id'] && nodeMap.has(value['@id'])) {
      resolvedNode[key] = { ...nodeMap.get(value['@id']) }
      return
    }

    if (Array.isArray(value)) {
      resolvedNode[key] = value.map(item => item && typeof item === 'object' && Object.keys(item).length === 1 && item['@id'] && nodeMap.has(item['@id'])
        ? { ...nodeMap.get(item['@id']) }
        : item)
      return
    }

    if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 1)
      resolvedNode[key] = resolveNodeReferences(value, nodeMap)
  })

  return resolvedNode
}

function dedupeNodesById(nodes) {
  const dedupedNodes = []
  const seenIds = new Set()

  for (const node of nodes) {
    const nodeId = node['@id']
    if (nodeId) {
      if (seenIds.has(nodeId))
        continue
      seenIds.add(nodeId)
    }

    dedupedNodes.push(node)
  }

  return dedupedNodes
}

function flattenSchemaNodes(schemaGraph) {
  const collectedNodes = []
  if (!schemaGraph)
    return collectedNodes

  const visitedObjects = new Set()

  if (Array.isArray(schemaGraph)) {
    for (const node of schemaGraph) {
      if (node && typeof node === 'object' && node['@type'])
        collectSchemaNodes(node, collectedNodes, visitedObjects)
    }

    return dedupeNodesById(collectedNodes)
  }

  if (schemaGraph['@graph'] && Array.isArray(schemaGraph['@graph'])) {
    const nodeMap = new Map()
    schemaGraph['@graph'].forEach((node) => {
      if (node && typeof node === 'object' && node['@id'])
        nodeMap.set(node['@id'], node)
    })

    const processedGraphNodeIds = new Set()
    schemaGraph['@graph'].forEach((node) => {
      if (!node || typeof node !== 'object')
        return

      if (Object.keys(node).length === 1 && node['@id'])
        return

      if (node['@id'] && processedGraphNodeIds.has(node['@id']))
        return

      collectSchemaNodes(resolveNodeReferences(node, nodeMap), collectedNodes, visitedObjects)
      if (node['@id'])
        processedGraphNodeIds.add(node['@id'])
    })

    return dedupeNodesById(collectedNodes)
  }

  if (schemaGraph['@type'])
    collectSchemaNodes(schemaGraph, collectedNodes, visitedObjects)

  return dedupeNodesById(collectedNodes)
}

function getNestedPropertyValue(node, path) {
  const pathSegments = path.split('.')
  let currentValue = node

  for (const segment of pathSegments) {
    if (currentValue && typeof currentValue === 'object' && segment in currentValue) {
      currentValue = currentValue[segment]
    }
    else {
      return undefined
    }
  }

  return currentValue
}

function validateSchemaNode(node) {
  const type = getSchemaType(node)
  const rules = SCHEMA_VALIDATION_RULES[type]

  if (!rules) {
    return {
      missingRequired: [],
      missingRecommended: [],
      presentProperties: {},
      documentationUrl: undefined,
    }
  }

  const missingRequired = []
  const missingRecommended = []
  const presentProperties = {}

  rules.required.forEach((path) => {
    const value = getNestedPropertyValue(node, path)
    if (value == null || value === '')
      missingRequired.push(path)
    else
      presentProperties[path] = value
  })

  rules.recommended.forEach((path) => {
    const value = getNestedPropertyValue(node, path)
    if (value == null || value === '')
      missingRecommended.push(path)
    else
      presentProperties[path] = value
  })

  return {
    missingRequired,
    missingRecommended,
    presentProperties,
    documentationUrl: rules.documentationUrl,
  }
}

function buildSchemaValidationResult(schemaGraph) {
  const nodes = flattenSchemaNodes(schemaGraph)
  let totalErrors = 0
  let totalWarnings = 0
  let richResultNodes = 0

  const nodeSummaries = nodes.map((node) => {
    const type = getSchemaType(node)
    if (isRichResultType(type))
      richResultNodes += 1

    const validation = validateSchemaNode(node)
    totalErrors += validation.missingRequired.length
    totalWarnings += validation.missingRecommended.length

    return {
      type,
      label: getNodeLabel(node),
      isRichResultType: isRichResultType(type),
      missingRequired: validation.missingRequired,
      missingRecommended: validation.missingRecommended,
      documentationUrl: validation.documentationUrl,
    }
  })

  return {
    nodes: nodeSummaries,
    summary: {
      totalNodes: nodes.length,
      richResultNodes,
      totalErrors,
      totalWarnings,
    },
  }
}

function buildSummaryMessage(summary) {
  if (summary.totalNodes === 0)
    return '沒有偵測到可檢查的 Schema.org 節點。'

  if (summary.totalErrors > 0)
    return `找到 ${summary.totalErrors} 個必填欄位缺漏，分布於 ${summary.totalNodes} 個節點。`

  if (summary.totalWarnings > 0)
    return `找到 ${summary.totalWarnings} 個建議欄位缺漏，但所有必填欄位都已存在。`

  return `${summary.totalNodes} 個節點皆通過檢查。`
}

function formatNodeDisplay(nodeSummary) {
  const label = normalizeText(String(nodeSummary.label || ''))
  if (!label || label === `${nodeSummary.type} Schema`)
    return nodeSummary.type

  return `${nodeSummary.type} "${truncateText(label, 80)}"`
}

function auditSchemaGraph(htmlSource, route) {
  const schemaScripts = extractSchemaGraphScripts(htmlSource)
  const report = {
    route,
    schemaTagCount: schemaScripts.length,
    graphFound: schemaScripts.length > 0,
    totalNodes: 0,
    richResultNodes: 0,
    errorCount: 0,
    warningCount: 0,
    summaryMessage: '',
    nodesWithIssues: [],
    findings: [],
  }

  if (schemaScripts.length === 0) {
    report.findings.push(createFinding('warning', 'missing-schema-graph', '頁面沒有找到 data-nuxt-schema-org 的 JSON-LD。'))
    report.warningCount = 1
    report.summaryMessage = '此頁沒有可供驗證的 Schema.org graph。'
    return report
  }

  if (schemaScripts.length > 1) {
    report.findings.push(createFinding('warning', 'multiple-schema-graphs', `找到 ${schemaScripts.length} 個 data-nuxt-schema-org script，僅檢查第一個。`))
  }

  let parsedGraph
  try {
    parsedGraph = JSON.parse(schemaScripts[0])
  }
  catch (error) {
    report.findings.push(createFinding('error', 'invalid-schema-json', `Schema.org JSON-LD 無法解析: ${error.message}`))
    report.errorCount = 1
    report.summaryMessage = 'Schema.org JSON-LD 解析失敗。'
    return report
  }

  const validationResult = buildSchemaValidationResult(parsedGraph)
  report.totalNodes = validationResult.summary.totalNodes
  report.richResultNodes = validationResult.summary.richResultNodes
  report.summaryMessage = buildSummaryMessage(validationResult.summary)

  if (validationResult.summary.totalNodes === 0) {
    report.findings.push(createFinding('warning', 'empty-schema-graph', 'Schema.org graph 可解析，但沒有可檢查的節點。'))
  }

  for (const nodeSummary of validationResult.nodes) {
    if (nodeSummary.missingRequired.length > 0) {
      report.findings.push(createFinding(
        'error',
        'schema-required-properties',
        `${formatNodeDisplay(nodeSummary)} 缺少必填欄位: ${nodeSummary.missingRequired.join(', ')}`,
        {
          schemaType: nodeSummary.type,
          schemaLabel: nodeSummary.label,
          missingProperties: nodeSummary.missingRequired,
          documentationUrl: nodeSummary.documentationUrl,
        },
      ))
    }

    if (nodeSummary.missingRecommended.length > 0) {
      report.findings.push(createFinding(
        'warning',
        'schema-recommended-properties',
        `${formatNodeDisplay(nodeSummary)} 缺少建議欄位: ${nodeSummary.missingRecommended.join(', ')}`,
        {
          schemaType: nodeSummary.type,
          schemaLabel: nodeSummary.label,
          missingProperties: nodeSummary.missingRecommended,
          documentationUrl: nodeSummary.documentationUrl,
        },
      ))
    }

    if (nodeSummary.missingRequired.length > 0 || nodeSummary.missingRecommended.length > 0)
      report.nodesWithIssues.push(nodeSummary)
  }

  report.errorCount = report.findings.filter(finding => finding.level === 'error').length
  report.warningCount = report.findings.filter(finding => finding.level === 'warning').length

  return report
}

function summarizeReports(reports) {
  const findingsByCode = new Map()
  const missingPropertiesByPath = new Map()

  let pagesWithFindings = 0
  let pagesWithSchema = 0
  let pagesWithoutSchema = 0
  let totalNodes = 0
  let totalRichResultNodes = 0
  let errorCount = 0
  let warningCount = 0

  for (const report of reports) {
    if (report.findings.length > 0)
      pagesWithFindings += 1

    if (report.graphFound)
      pagesWithSchema += 1
    else
      pagesWithoutSchema += 1

    totalNodes += report.totalNodes
    totalRichResultNodes += report.richResultNodes
    errorCount += report.errorCount
    warningCount += report.warningCount

    for (const finding of report.findings) {
      const codeBucket = findingsByCode.get(finding.code) || {
        count: 0,
        level: finding.level,
        message: finding.message,
        routes: new Set(),
      }

      codeBucket.count += 1
      codeBucket.routes.add(report.route)
      findingsByCode.set(finding.code, codeBucket)

      for (const property of finding.missingProperties || []) {
        const propertyBucket = missingPropertiesByPath.get(property) || {
          count: 0,
          levels: new Set(),
          routes: new Set(),
          schemaTypes: new Set(),
        }

        propertyBucket.count += 1
        propertyBucket.levels.add(finding.level)
        propertyBucket.routes.add(report.route)
        if (finding.schemaType)
          propertyBucket.schemaTypes.add(finding.schemaType)
        missingPropertiesByPath.set(property, propertyBucket)
      }
    }
  }

  return {
    auditedPages: reports.length,
    pagesWithFindings,
    pagesWithSchema,
    pagesWithoutSchema,
    totalNodes,
    totalRichResultNodes,
    errorCount,
    warningCount,
    findingsByCode: Object.fromEntries(
      Array.from(findingsByCode.entries())
        .sort((left, right) => right[1].count - left[1].count || left[0].localeCompare(right[0]))
        .map(([code, bucket]) => [code, {
          count: bucket.count,
          level: bucket.level,
          message: bucket.message,
          routes: Array.from(bucket.routes).sort((leftRoute, rightRoute) => leftRoute.localeCompare(rightRoute)),
        }]),
    ),
    missingPropertiesByPath: Object.fromEntries(
      Array.from(missingPropertiesByPath.entries())
        .sort((left, right) => right[1].count - left[1].count || left[0].localeCompare(right[0]))
        .map(([property, bucket]) => [property, {
          count: bucket.count,
          levels: Array.from(bucket.levels).sort(),
          routes: Array.from(bucket.routes).sort((leftRoute, rightRoute) => leftRoute.localeCompare(rightRoute)),
          schemaTypes: Array.from(bucket.schemaTypes).sort((leftType, rightType) => leftType.localeCompare(rightType)),
        }]),
    ),
  }
}

function joinRoutes(routes, maxItems = 3) {
  if (routes.length <= maxItems)
    return routes.join(', ')

  return `${routes.slice(0, maxItems).join(', ')} ... +${routes.length - maxItems}`
}

function getPriorityBuckets(summary) {
  return Object.entries(summary.findingsByCode)
    .sort((left, right) => {
      if (left[1].level !== right[1].level)
        return left[1].level === 'error' ? -1 : 1

      return right[1].count - left[1].count || left[0].localeCompare(right[0])
    })
}

function getMissingPropertyBuckets(summary) {
  return Object.entries(summary.missingPropertiesByPath)
    .sort((left, right) => right[1].count - left[1].count || left[0].localeCompare(right[0]))
}

function printPrioritySections(summary, reports) {
  const reportsWithErrors = reports
    .filter(report => report.errorCount > 0)
    .sort((left, right) => right.errorCount - left.errorCount || left.route.localeCompare(right.route))

  if (reportsWithErrors.length > 0) {
    console.log('\n優先修復:')
    for (const report of reportsWithErrors.slice(0, 12)) {
      const issues = report.findings
        .filter(finding => finding.level === 'error')
        .map(finding => finding.message)
        .slice(0, 3)
        .join('、')
      console.log(`  [error] ${report.route} -> ${issues}`)
    }
  }

  const warningBuckets = getPriorityBuckets(summary)
    .filter(([, bucket]) => bucket.level === 'warning')

  if (warningBuckets.length > 0) {
    console.log('\n主要警告群組:')
    for (const [code, bucket] of warningBuckets.slice(0, 8)) {
      console.log(`  [warning] ${code}: ${bucket.count} 項，${bucket.routes.length} 頁`)
      console.log(`    例: ${joinRoutes(bucket.routes)}`)
    }
  }

  const propertyBuckets = getMissingPropertyBuckets(summary)
  if (propertyBuckets.length > 0) {
    console.log('\n常見缺漏欄位:')
    for (const [property, bucket] of propertyBuckets.slice(0, 10)) {
      console.log(`  ${property}: ${bucket.count} 次，${bucket.routes.length} 頁，type: ${bucket.schemaTypes.join(', ') || 'unknown'}`)
    }
  }
}

function printCompactReport({ summary, reports }) {
  if (summary.errorCount === 0 && summary.warningCount === 0) {
    console.log('\n✅ 沒有發現 Schema.org 缺漏或解析問題。')
    return
  }

  printPrioritySections(summary, reports)

  const highImpactWarnings = reports
    .filter(report => report.errorCount === 0 && report.warningCount > 0)
    .sort((left, right) => right.warningCount - left.warningCount || left.route.localeCompare(right.route))
    .slice(0, 8)

  if (highImpactWarnings.length > 0) {
    console.log('\n建議接著檢查:')
    for (const report of highImpactWarnings) {
      const issueSummary = report.findings.map(finding => finding.code).join(', ')
      console.log(`  ${report.route} -> ${issueSummary}`)
    }
  }

  console.log('\n提示: 想看逐頁明細請加 --details；想看所有頁面請加 --verbose。')
}

function printDetailedReport(reports) {
  const filteredReports = reports.filter(report => report.findings.length > 0)

  if (filteredReports.length === 0) {
    console.log('\n✅ 沒有發現 Schema.org 缺漏或解析問題。')
    return
  }

  console.log('\n頁面明細:')
  for (const report of filteredReports) {
    console.log(`\n[${report.errorCount} error / ${report.warningCount} warning] ${report.route}`)
    console.log(`  schema tags: ${report.schemaTagCount}`)
    console.log(`  nodes: ${report.totalNodes} total / ${report.richResultNodes} rich-result relevant`)
    console.log(`  summary: ${report.summaryMessage}`)

    for (const finding of report.findings)
      console.log(`  - [${finding.level}] ${finding.message}`)
  }
}

function printVerboseReport(reports) {
  console.log('\n頁面明細:')
  for (const report of reports) {
    console.log(`\n[${report.errorCount} error / ${report.warningCount} warning] ${report.route}`)
    console.log(`  schema tags: ${report.schemaTagCount}`)
    console.log(`  nodes: ${report.totalNodes} total / ${report.richResultNodes} rich-result relevant`)
    console.log(`  summary: ${report.summaryMessage}`)

    for (const finding of report.findings)
      console.log(`  - [${finding.level}] ${finding.message}`)
  }
}

function printHumanReport({ outputDir, reports, summary, details, verbose }) {
  console.log('🔍 Schema.org audit\n')
  console.log(`掃描目錄: ${outputDir}`)
  console.log(`已掃描頁面: ${summary.auditedPages}`)
  console.log(`有 schema graph 的頁面: ${summary.pagesWithSchema}`)
  console.log(`沒有 schema graph 的頁面: ${summary.pagesWithoutSchema}`)
  console.log(`有發現問題的頁面: ${summary.pagesWithFindings}`)
  console.log(`總節點數: ${summary.totalNodes}`)
  console.log(`Rich result 相關節點數: ${summary.totalRichResultNodes}`)
  console.log(`錯誤: ${summary.errorCount}`)
  console.log(`警告: ${summary.warningCount}`)

  if (Object.keys(summary.findingsByCode).length > 0) {
    console.log('\n問題統計:')
    for (const [code, bucket] of getPriorityBuckets(summary))
      console.log(`  ${code}: ${bucket.count}`)
  }

  if (verbose) {
    printVerboseReport(reports)
    return
  }

  if (details) {
    printDetailedReport(reports)
    return
  }

  printCompactReport({ summary, reports })
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2))
    await ensureDirectoryExists(options.dir)

    const htmlFiles = (await findHtmlFiles(options.dir))
      .filter(relativePath => !shouldSkipHtmlFile(relativePath))
      .sort((left, right) => htmlFileToRoute(left).localeCompare(htmlFileToRoute(right)))

    const reports = []

    for (const relativePath of htmlFiles) {
      const fullPath = join(options.dir, relativePath.slice(1))
      const htmlSource = await readFile(fullPath, 'utf8')
      reports.push(auditSchemaGraph(htmlSource, htmlFileToRoute(relativePath)))
    }

    const summary = summarizeReports(reports)
    const payload = {
      outputDir: options.dir,
      generatedAt: new Date().toISOString(),
      summary,
      reports,
    }

    if (options.json)
      console.log(JSON.stringify(payload, null, 2))
    else
      printHumanReport({ outputDir: options.dir, reports, summary, details: options.details, verbose: options.verbose })

    if (options.strict && (summary.errorCount > 0 || summary.warningCount > 0))
      process.exit(1)
  }
  catch (error) {
    console.error(`❌ ${error.message}`)
    process.exit(1)
  }
}

main()
