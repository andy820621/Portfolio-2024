import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const galleryImagesDir = path.join(projectRoot, 'public/gallery-images')
const imageMap = {}

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'])

function collectImageFiles(dir, baseDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectImageFiles(fullPath, baseDir))
    }
    else {
      const ext = path.extname(entry.name).toLowerCase()
      if (IMAGE_EXTENSIONS.has(ext)) {
        files.push(path.relative(baseDir, fullPath).replace(/\\/g, '/'))
      }
    }
  }

  return files
}

function main() {
  const imageFiles = collectImageFiles(galleryImagesDir, galleryImagesDir)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

  if (!Array.isArray(imageFiles)) {
    console.error('imageFiles is not an array:', imageFiles)
    process.exit(1)
  }

  // 收集所有檔案，按資料夾分組
  imageFiles.forEach((file) => {
    const dir = path.dirname(file)
    const filename = path.basename(file)

    // 跳過封面圖片（在根目錄的 .webp 檔案）
    if (dir === '.') {
      return
    }

    const dirKey = dir
    if (!imageMap[dirKey]) {
      imageMap[dirKey] = []
    }
    imageMap[dirKey].push(filename)
  })

  // 對每個目錄下的檔案進行排序
  Object.keys(imageMap).forEach((dirKey) => {
    imageMap[dirKey].sort((a, b) => {
      // 自然排序
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    })
  })

  const sortedImageMap = Object.fromEntries(
    Object.keys(imageMap)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map(key => [key, imageMap[key]]),
  )

  const outputPath = path.join(projectRoot, 'public', 'gallery-images-map.json')
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(sortedImageMap, null, 2)}\n`,
  )

  console.log('Gallery image map generated successfully!')
  console.log(`Albums found: ${Object.keys(sortedImageMap).length}`)
  Object.entries(sortedImageMap).forEach(([album, images]) => {
    console.log(`  - ${album}: ${images.length} images`)
  })
}

main()
