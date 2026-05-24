import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { imageSizeFromFile } from 'image-size/fromFile'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const galleryImagesDir = path.join(projectRoot, 'public/gallery-images')
const outputPath = path.join(projectRoot, 'public', 'gallery-images-metadata.json')

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'])
const NATURAL_SORT_OPTIONS = { numeric: true, sensitivity: 'base' }

function collectImageFiles(dir, baseDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectImageFiles(fullPath, baseDir))
      continue
    }

    const ext = path.extname(entry.name).toLowerCase()
    if (IMAGE_EXTENSIONS.has(ext)) {
      files.push(path.relative(baseDir, fullPath).replace(/\\/g, '/'))
    }
  }

  return files
}

async function resolveDimensions(filePath) {
  const dimensions = await imageSizeFromFile(filePath)

  if (!dimensions.width || !dimensions.height) {
    throw new Error(`Unable to determine intrinsic dimensions for ${filePath}`)
  }

  return {
    width: dimensions.width,
    height: dimensions.height,
  }
}

async function main() {
  const imageFiles = collectImageFiles(galleryImagesDir, galleryImagesDir)
    .sort((a, b) => a.localeCompare(b, undefined, NATURAL_SORT_OPTIONS))

  const metadataEntries = await Promise.all(
    imageFiles.map(async (relativePath) => {
      const absolutePath = path.join(galleryImagesDir, relativePath)
      const publicPath = `/gallery-images/${relativePath}`

      return [publicPath, await resolveDimensions(absolutePath)]
    }),
  )

  const metadata = Object.fromEntries(metadataEntries)

  fs.writeFileSync(outputPath, `${JSON.stringify(metadata, null, 2)}\n`)

  console.log('Gallery image metadata generated successfully!')
  console.log(`Images processed: ${metadataEntries.length}`)
}

main().catch((error) => {
  console.error('Error generating gallery image metadata:', error)
  process.exit(1)
})
