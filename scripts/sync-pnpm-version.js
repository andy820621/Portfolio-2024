import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const packageJsonPath = path.join(projectRoot, 'package.json')
const targetFiles = [
  'README.md',
  'README.zh.md',
  'README.ja.md',
]

const PACKAGE_MANAGER_PATTERN = /^pnpm@(?<version>\d+\.\d+\.\d+)(?:\+sha512\.[a-f0-9]+)?$/i
const README_PACKAGE_MANAGER_PATTERN = /"packageManager": "pnpm@\d+\.\d+\.\d+\+sha512\.\.\."/g

export function getPnpmVersion(packageManager) {
  const match = packageManager.match(PACKAGE_MANAGER_PATTERN)

  if (!match?.groups?.version) {
    throw new Error(`Unsupported packageManager value: ${packageManager}`)
  }

  return match.groups.version
}

export function syncPnpmDocText(text, version) {
  return text.replaceAll(
    README_PACKAGE_MANAGER_PATTERN,
    `"packageManager": "pnpm@${version}+sha512..."`,
  )
}

export function readPnpmVersion() {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

  if (typeof packageJson.packageManager !== 'string') {
    throw new TypeError('package.json must contain a packageManager string')
  }

  return getPnpmVersion(packageJson.packageManager)
}

function getTargetPath(relativePath) {
  return path.join(projectRoot, relativePath)
}

function formatFileList(filePaths) {
  return filePaths.map(filePath => `- ${filePath}`).join('\n')
}

export function syncPnpmDocs({ check = false } = {}) {
  const version = readPnpmVersion()
  const staleFiles = []
  const updatedFiles = []

  for (const relativePath of targetFiles) {
    const filePath = getTargetPath(relativePath)
    const currentContent = fs.readFileSync(filePath, 'utf8')
    const expectedContent = syncPnpmDocText(currentContent, version)

    if (currentContent === expectedContent) {
      continue
    }

    if (check) {
      staleFiles.push(relativePath)
      continue
    }

    fs.writeFileSync(filePath, expectedContent)
    updatedFiles.push(relativePath)
  }

  if (check) {
    if (staleFiles.length > 0) {
      console.error(`pnpm documentation is out of sync with packageManager ${version}.`)
      console.error('Run `pnpm sync:pnpm` to refresh:')
      console.error(formatFileList(staleFiles))
      process.exitCode = 1
    }
    else {
      console.log(`pnpm documentation is in sync with packageManager ${version}.`)
    }

    return { version, staleFiles, updatedFiles: [] }
  }

  if (updatedFiles.length > 0) {
    console.log(`Synced pnpm version ${version} in:`)
    console.log(formatFileList(updatedFiles))
  }
  else {
    console.log(`pnpm documentation already matches packageManager ${version}.`)
  }

  return { version, staleFiles: [], updatedFiles }
}

function main(argv = process.argv.slice(2)) {
  syncPnpmDocs({ check: argv.includes('--check') })
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}
