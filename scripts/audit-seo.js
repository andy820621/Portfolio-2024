#!/usr/bin/env node

import { access, readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const projectRoot = resolve(__dirname, '..')
const defaultOutputDir = join(projectRoot, '.output', 'public')

const SEO_UTILS_THRESHOLDS = {
  TITLE_MIN_CHARS: 30,
  TITLE_WARN_CHARS: 50,
  TITLE_MAX_CHARS: 60,
  TITLE_MAX_PIXELS: 580,
  DESCRIPTION_MIN_CHARS: 70,
  DESCRIPTION_WARN_CHARS: 150,
  DESCRIPTION_MAX_CHARS: 160,
  DESCRIPTION_MAX_PIXELS: 920,
}
const SKIPPED_HTML_FILES = new Set(['/200.html', '/404.html'])

const WINDOWS_PATH_SEPARATOR_RE = /\\/g
const HTML_SUFFIX_RE = /\.html$/i
const XML_ROUTE_RE = /(?:^|\/)sitemap[^/]*\.xml\/index\.html$/i
const HTML_LANG_RE = /<html[^>]*\slang=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i
const HEAD_RE = /<head[^>]*>([\s\S]*?)<\/head>/i
const TITLE_RE = /<title[^>]*>([\s\S]*?)<\/title>/i
const MULTIPLE_WHITESPACE_RE = /\s+/g
const ABSOLUTE_URL_RE = /^https?:\/\//i

const HTML_ENTITY_HEX_RE = /&#x([\da-f]+);/gi
const HTML_ENTITY_DEC_RE = /&#(\d+);/g
const HTML_ENTITY_NBSP_RE = /&nbsp;/g
const HTML_ENTITY_QUOT_RE = /&quot;/g
const HTML_ENTITY_APOS_RE = /&(apos|#39);/g
const HTML_ENTITY_AMP_RE = /&amp;/g
const HTML_ENTITY_LT_RE = /&lt;/g
const HTML_ENTITY_GT_RE = /&gt;/g

const ATTRIBUTE_RE = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g

const TAG_PATTERNS = {
  meta: /<meta\b[^>]*>/gi,
  link: /<link\b[^>]*>/gi,
}

function printHelp() {
  console.log(`
SEO meta audit script

Usage:
  node scripts/audit-seo.js
  node scripts/audit-seo.js --strict
  node scripts/audit-seo.js --details
  node scripts/audit-seo.js --json
  node scripts/audit-seo.js --dir .output/public

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

function decodeEntities(value) {
  return value
    .replace(HTML_ENTITY_HEX_RE, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(HTML_ENTITY_DEC_RE, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(HTML_ENTITY_NBSP_RE, ' ')
    .replace(HTML_ENTITY_QUOT_RE, '"')
    .replace(HTML_ENTITY_APOS_RE, '\'')
    .replace(HTML_ENTITY_AMP_RE, '&')
    .replace(HTML_ENTITY_LT_RE, '<')
    .replace(HTML_ENTITY_GT_RE, '>')
}

function normalizeText(value = '') {
  return decodeEntities(value).replace(MULTIPLE_WHITESPACE_RE, ' ').trim()
}

function truncateText(value, maxLength = 120) {
  if (value.length <= maxLength)
    return value

  return `${value.slice(0, maxLength - 1)}…`
}

function getCharacterCount(value = '') {
  return Array.from(value).length
}

function getEstimatedPixelWidth(value = '', fontSize = 16) {
  return Math.round(getCharacterCount(value) * fontSize * 0.55)
}

function getSeoUtilsTitleStatus(titleLength) {
  if (titleLength > SEO_UTILS_THRESHOLDS.TITLE_MAX_CHARS)
    return 'error'

  if (titleLength < SEO_UTILS_THRESHOLDS.TITLE_MIN_CHARS)
    return 'warning'

  return 'success'
}

function getSeoUtilsDescriptionStatus(descriptionLength) {
  if (descriptionLength > SEO_UTILS_THRESHOLDS.DESCRIPTION_MAX_CHARS)
    return 'error'

  if (descriptionLength > SEO_UTILS_THRESHOLDS.DESCRIPTION_WARN_CHARS || descriptionLength < SEO_UTILS_THRESHOLDS.DESCRIPTION_MIN_CHARS)
    return 'warning'

  return 'success'
}

function buildSeoUtilsEssentialTags(report) {
  return [
    { category: 'Basic', name: 'title', present: !!report.title, value: report.title },
    { category: 'Basic', name: 'description', present: !!report.description, value: report.description },
    { category: 'Basic', name: 'canonical', present: !!report.canonical, value: report.canonical },
    { category: 'Open Graph', name: 'og:title', present: !!report.ogTitle, value: report.ogTitle },
    { category: 'Open Graph', name: 'og:description', present: !!report.ogDescription, value: report.ogDescription },
    { category: 'Open Graph', name: 'og:image', present: !!report.ogImage, value: report.ogImage },
    { category: 'Open Graph', name: 'og:url', present: !!report.ogUrl, value: report.ogUrl },
    { category: 'Open Graph', name: 'og:type', present: !!report.ogType, value: report.ogType },
    { category: 'Open Graph', name: 'og:site_name', present: !!report.ogSiteName, value: report.ogSiteName },
    { category: 'Twitter', name: 'twitter:card', present: !!report.twitterCard, value: report.twitterCard },
    {
      category: 'Twitter',
      name: 'twitter:title',
      present: !!report.twitterTitle,
      value: report.twitterTitle,
      fallback: report.ogTitle ? 'og:title' : undefined,
    },
    {
      category: 'Twitter',
      name: 'twitter:image',
      present: !!report.twitterImage,
      value: report.twitterImage,
      fallback: report.ogImage ? 'og:image' : undefined,
    },
  ]
}

function parseAttributes(tagSource) {
  const attributes = {}

  for (const match of tagSource.matchAll(ATTRIBUTE_RE)) {
    const [, rawName, doubleQuoted, singleQuoted, bareValue] = match
    const name = rawName.toLowerCase()

    if (name === 'meta' || name === 'link')
      continue

    const value = doubleQuoted ?? singleQuoted ?? bareValue ?? ''
    attributes[name] = decodeEntities(value)
  }

  return attributes
}

function collectTagAttributes(source, tagName) {
  const pattern = TAG_PATTERNS[tagName]
  if (!pattern)
    return []

  return Array.from(source.matchAll(pattern), match => parseAttributes(match[0]))
}

function findMetaContent(metas, key, value) {
  return metas.find(meta => meta[key] === value)?.content || ''
}

function countMetaTags(metas, key, value) {
  return metas.filter(meta => meta[key] === value).length
}

function hasRel(relValue, expected) {
  return String(relValue || '')
    .toLowerCase()
    .split(MULTIPLE_WHITESPACE_RE)
    .filter(Boolean)
    .includes(expected)
}

function createFinding(level, code, message) {
  return { level, code, message }
}

function auditHead(htmlSource, route) {
  const htmlLangMatch = htmlSource.match(HTML_LANG_RE)
  const htmlLang = normalizeText(htmlLangMatch?.[1] || htmlLangMatch?.[2] || htmlLangMatch?.[3] || '')

  const headMatch = htmlSource.match(HEAD_RE)
  if (!headMatch) {
    return {
      route,
      htmlLang,
      title: '',
      titleLength: 0,
      titlePixelWidth: 0,
      description: '',
      descriptionLength: 0,
      descriptionPixelWidth: 0,
      canonical: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogUrl: '',
      twitterCard: '',
      twitterTitle: '',
      twitterDescription: '',
      twitterImage: '',
      hreflangs: [],
      essentialTags: [],
      essentialTagsPresent: 0,
      essentialTagsTotal: 0,
      essentialTagScore: 0,
      findings: [createFinding('error', 'missing-head', '缺少 <head> 區塊')],
    }
  }

  const headSource = headMatch[1]
  const titleMatch = headSource.match(TITLE_RE)
  const title = normalizeText(titleMatch?.[1] || '')
  const metas = collectTagAttributes(headSource, 'meta')
  const links = collectTagAttributes(headSource, 'link')
  const description = normalizeText(findMetaContent(metas, 'name', 'description'))

  const canonicalLinks = links.filter(link => hasRel(link.rel, 'canonical'))
  const alternateLinks = links.filter(link => hasRel(link.rel, 'alternate') && link.hreflang)

  const report = {
    route,
    htmlLang,
    title,
    titleLength: getCharacterCount(title),
    titlePixelWidth: getEstimatedPixelWidth(title),
    description,
    descriptionLength: getCharacterCount(description),
    descriptionPixelWidth: getEstimatedPixelWidth(description),
    canonical: normalizeText(canonicalLinks[0]?.href || ''),
    ogTitle: normalizeText(findMetaContent(metas, 'property', 'og:title')),
    ogDescription: normalizeText(findMetaContent(metas, 'property', 'og:description')),
    ogImage: normalizeText(findMetaContent(metas, 'property', 'og:image')),
    ogUrl: normalizeText(findMetaContent(metas, 'property', 'og:url')),
    ogType: normalizeText(findMetaContent(metas, 'property', 'og:type')),
    ogSiteName: normalizeText(findMetaContent(metas, 'property', 'og:site_name')),
    twitterCard: normalizeText(findMetaContent(metas, 'name', 'twitter:card')),
    twitterTitle: normalizeText(findMetaContent(metas, 'name', 'twitter:title')),
    twitterDescription: normalizeText(findMetaContent(metas, 'name', 'twitter:description')),
    twitterImage: normalizeText(findMetaContent(metas, 'name', 'twitter:image')),
    hreflangs: alternateLinks
      .map(link => ({ hreflang: normalizeText(link.hreflang), href: normalizeText(link.href) }))
      .filter(link => link.hreflang && link.href),
    essentialTags: [],
    essentialTagsPresent: 0,
    essentialTagsTotal: 0,
    essentialTagScore: 0,
    findings: [],
  }

  report.essentialTags = buildSeoUtilsEssentialTags(report)
  report.essentialTagsPresent = report.essentialTags.filter(tag => tag.present || tag.fallback).length
  report.essentialTagsTotal = report.essentialTags.length
  report.essentialTagScore = report.essentialTagsTotal > 0
    ? Math.round((report.essentialTagsPresent / report.essentialTagsTotal) * 100)
    : 0

  if (!report.title) {
    report.findings.push(createFinding('error', 'missing-title', '缺少 <title>'))
  }
  else if (getSeoUtilsTitleStatus(report.titleLength) === 'warning') {
    report.findings.push(createFinding('warning', 'title-short', `title 偏短 (${report.titleLength} chars / ~${report.titlePixelWidth}px)`))
  }
  else if (getSeoUtilsTitleStatus(report.titleLength) === 'error') {
    report.findings.push(createFinding('warning', 'title-long', `title 可能過長 (${report.titleLength} chars / ~${report.titlePixelWidth}px)`))
  }

  if (!report.description) {
    report.findings.push(createFinding('warning', 'missing-description', '缺少 meta description'))
  }
  else if (getSeoUtilsDescriptionStatus(report.descriptionLength) === 'warning') {
    if (report.descriptionLength < SEO_UTILS_THRESHOLDS.DESCRIPTION_MIN_CHARS) {
      report.findings.push(createFinding('warning', 'description-short', `description 偏短 (${report.descriptionLength} chars / ~${report.descriptionPixelWidth}px)`))
    }
    else {
      report.findings.push(createFinding('warning', 'description-near-limit', `description 接近截斷區，建議控制在 ${SEO_UTILS_THRESHOLDS.DESCRIPTION_WARN_CHARS} 內 (${report.descriptionLength} chars / ~${report.descriptionPixelWidth}px)`))
    }
  }
  else if (getSeoUtilsDescriptionStatus(report.descriptionLength) === 'error') {
    report.findings.push(createFinding('warning', 'description-long', `description 可能過長 (${report.descriptionLength} chars / ~${report.descriptionPixelWidth}px)`))
  }

  if (!report.canonical)
    report.findings.push(createFinding('warning', 'missing-canonical', '缺少 canonical link'))
  else if (!ABSOLUTE_URL_RE.test(report.canonical))
    report.findings.push(createFinding('warning', 'canonical-not-absolute', 'canonical 不是絕對 URL'))

  if (canonicalLinks.length > 1)
    report.findings.push(createFinding('warning', 'duplicate-canonical', `找到 ${canonicalLinks.length} 個 canonical link`))

  const robotsDirective = normalizeText(findMetaContent(metas, 'name', 'robots'))

  if (!report.ogTitle)
    report.findings.push(createFinding('warning', 'missing-og-title', '缺少 og:title'))

  if (!report.ogDescription)
    report.findings.push(createFinding('warning', 'missing-og-description', '缺少 og:description'))

  if (!report.ogImage)
    report.findings.push(createFinding('warning', 'missing-og-image', '缺少 og:image'))

  if (!report.ogUrl)
    report.findings.push(createFinding('warning', 'missing-og-url', '缺少 og:url'))

  if (!report.ogType)
    report.findings.push(createFinding('warning', 'missing-og-type', '缺少 og:type'))

  if (!report.ogSiteName)
    report.findings.push(createFinding('warning', 'missing-og-site-name', '缺少 og:site_name'))

  if (!report.twitterCard)
    report.findings.push(createFinding('warning', 'missing-twitter-card', '缺少 twitter:card'))

  if (!report.twitterTitle && !report.ogTitle)
    report.findings.push(createFinding('warning', 'missing-twitter-title', '缺少 twitter:title'))

  if (!report.twitterImage && !report.ogImage)
    report.findings.push(createFinding('warning', 'missing-twitter-image', '缺少 twitter:image'))

  if (!report.twitterDescription && !report.ogDescription)
    report.findings.push(createFinding('warning', 'missing-twitter-description', '缺少 twitter:description'))

  if (!robotsDirective)
    report.findings.push(createFinding('warning', 'missing-robots', '缺少 robots'))

  if (countMetaTags(metas, 'name', 'description') > 1)
    report.findings.push(createFinding('warning', 'duplicate-description', '找到多個 meta description'))

  if (report.ogUrl && !ABSOLUTE_URL_RE.test(report.ogUrl))
    report.findings.push(createFinding('warning', 'og-url-not-absolute', 'og:url 不是絕對 URL'))

  if (report.ogImage && !ABSOLUTE_URL_RE.test(report.ogImage))
    report.findings.push(createFinding('warning', 'og-image-not-absolute', 'og:image 不是絕對 URL'))

  if (report.twitterImage && !ABSOLUTE_URL_RE.test(report.twitterImage))
    report.findings.push(createFinding('warning', 'twitter-image-not-absolute', 'twitter:image 不是絕對 URL'))

  if (!report.hreflangs.length)
    report.findings.push(createFinding('warning', 'missing-hreflang', '缺少 hreflang alternate links'))

  if (!report.htmlLang)
    report.findings.push(createFinding('warning', 'missing-html-lang', '缺少 html lang'))

  return report
}

function summarizeReports(reports) {
  const findings = reports.flatMap(report => report.findings)
  const pagesWithFindings = reports.filter(report => report.findings.length > 0)
  const errorCount = findings.filter(finding => finding.level === 'error').length
  const warningCount = findings.filter(finding => finding.level === 'warning').length
  const byCode = {}

  for (const report of reports) {
    for (const finding of report.findings) {
      const bucket = byCode[finding.code] || {
        count: 0,
        level: finding.level,
        message: finding.message,
        routes: new Set(),
      }

      bucket.count += 1
      bucket.routes.add(report.route)
      byCode[finding.code] = bucket
    }
  }

  return {
    auditedPages: reports.length,
    pagesWithFindings: pagesWithFindings.length,
    errorCount,
    warningCount,
    findingsByCode: byCode,
  }
}

function formatFindingCode(code) {
  return code.replace(/-/g, ' ')
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

      return right[1].count - left[1].count
    })
}

function printPrioritySections(summary, reports) {
  const reportsWithErrors = reports
    .filter(report => report.findings.some(finding => finding.level === 'error'))
    .sort((left, right) => {
      const leftErrors = left.findings.filter(finding => finding.level === 'error').length
      const rightErrors = right.findings.filter(finding => finding.level === 'error').length
      return rightErrors - leftErrors || left.route.localeCompare(right.route)
    })

  if (reportsWithErrors.length > 0) {
    console.log('\n優先修復:')
    for (const report of reportsWithErrors) {
      const issues = report.findings
        .filter(finding => finding.level === 'error')
        .map(finding => finding.message)
        .join('、')
      console.log(`  [error] ${report.route} -> ${issues}`)
    }
  }

  const warningBuckets = getPriorityBuckets(summary)
    .filter(([, bucket]) => bucket.level === 'warning')

  if (warningBuckets.length > 0) {
    console.log('\n主要警告群組:')
    for (const [code, bucket] of warningBuckets.slice(0, 8)) {
      const routes = Array.from(bucket.routes).sort((left, right) => left.localeCompare(right))
      console.log(`  [warning] ${formatFindingCode(code)}: ${bucket.count} 項，${routes.length} 頁`)
      console.log(`    例: ${joinRoutes(routes)}`)
    }
  }
}

function printCompactReport({ summary, reports }) {
  if (summary.errorCount === 0 && summary.warningCount === 0) {
    console.log('\n✅ 沒有發現 meta 缺漏或明顯長度異常。')
    return
  }

  printPrioritySections(summary, reports)

  const highImpactWarnings = reports
    .filter(report => report.findings.length > 0 && report.findings.every(finding => finding.level === 'warning'))
    .sort((left, right) => right.findings.length - left.findings.length || left.route.localeCompare(right.route))
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
    console.log('\n✅ 沒有發現 meta 缺漏或明顯長度異常。')
    return
  }

  console.log('\n頁面明細:')
  for (const report of filteredReports) {
    const errorTotal = report.findings.filter(finding => finding.level === 'error').length
    const warningTotal = report.findings.filter(finding => finding.level === 'warning').length

    console.log(`\n[${errorTotal} error / ${warningTotal} warning] ${report.route}`)
    console.log(`  essential tags (${report.essentialTagScore}%): ${report.essentialTagsPresent}/${report.essentialTagsTotal}`)
    if (report.title)
      console.log(`  title (${report.titleLength} chars / ~${report.titlePixelWidth}px): ${truncateText(report.title)}`)
    if (report.description)
      console.log(`  description (${report.descriptionLength} chars / ~${report.descriptionPixelWidth}px): ${truncateText(report.description, 160)}`)
    if (report.canonical)
      console.log(`  canonical: ${truncateText(report.canonical, 100)}`)

    for (const finding of report.findings) {
      console.log(`  - [${finding.level}] ${finding.message}`)
    }
  }
}

function printVerboseReport(reports) {
  console.log('\n頁面明細:')
  for (const report of reports) {
    const errorTotal = report.findings.filter(finding => finding.level === 'error').length
    const warningTotal = report.findings.filter(finding => finding.level === 'warning').length

    console.log(`\n[${errorTotal} error / ${warningTotal} warning] ${report.route}`)
    console.log(`  essential tags (${report.essentialTagScore}%): ${report.essentialTagsPresent}/${report.essentialTagsTotal}`)
    if (report.title)
      console.log(`  title (${report.titleLength} chars / ~${report.titlePixelWidth}px): ${truncateText(report.title)}`)
    if (report.description)
      console.log(`  description (${report.descriptionLength} chars / ~${report.descriptionPixelWidth}px): ${truncateText(report.description, 160)}`)
    if (report.canonical)
      console.log(`  canonical: ${truncateText(report.canonical, 100)}`)

    for (const finding of report.findings) {
      console.log(`  - [${finding.level}] ${finding.message}`)
    }
  }
}

function printHumanReport({ outputDir, reports, summary, details, verbose }) {
  console.log('🔍 SEO meta audit\n')
  console.log(`掃描目錄: ${outputDir}`)
  console.log(`已掃描頁面: ${summary.auditedPages}`)
  console.log(`有發現問題的頁面: ${summary.pagesWithFindings}`)
  console.log(`錯誤: ${summary.errorCount}`)
  console.log(`警告: ${summary.warningCount}`)

  if (Object.keys(summary.findingsByCode).length > 0) {
    console.log('\n問題統計:')
    for (const [code, bucket] of getPriorityBuckets(summary)) {
      console.log(`  ${code}: ${bucket.count}`)
    }
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
      reports.push(auditHead(htmlSource, htmlFileToRoute(relativePath)))
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
