import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const glob = require('glob')

const globSync = glob.sync

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const galleryImagesDir = path.join(projectRoot, 'public/gallery-images')
const imageMap = {}

function main() {
  const imageFiles = globSync('**/*.{jpg,jpeg,png,gif,webp,avif}', {
    cwd: galleryImagesDir,
    nodir: true,
  })

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

  const outputPath = path.join(projectRoot, 'public', 'gallery-images-map.json')
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(imageMap, null, 2)}\n`,
  )

  console.log('Gallery image map generated successfully!')
  console.log(`Albums found: ${Object.keys(imageMap).length}`)
  Object.entries(imageMap).forEach(([album, images]) => {
    console.log(`  - ${album}: ${images.length} images`)
  })
}

main()
