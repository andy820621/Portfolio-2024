import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const projectImagesDir = path.join(projectRoot, 'public/project-images')
const imageMap = {}

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp'])

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
  const imageFiles = collectImageFiles(projectImagesDir, projectImagesDir)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

  if (!Array.isArray(imageFiles)) {
    console.error('imageFiles is not an array:', imageFiles)
    process.exit(1)
  }

  // 先收集所有檔案
  imageFiles.forEach((file) => {
    const dir = path.dirname(file)
    const filename = path.basename(file)
    const dirKey = dir === '.' ? '' : dir
    if (!imageMap[dirKey])
      imageMap[dirKey] = []
    imageMap[dirKey].push(filename)
  })

  // 對每個目錄下的檔案進行數字順序排序
  Object.keys(imageMap).forEach((dirKey) => {
    imageMap[dirKey].sort((a, b) => {
      // 使用正則表達式從檔案名提取數字前綴
      const numA = Number.parseInt(a.match(/^(\d+)/)?.[1] || '0')
      const numB = Number.parseInt(b.match(/^(\d+)/)?.[1] || '0')
      // 按數字大小排序，若相同則自然排序
      if (numA !== numB)
        return numA - numB
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    })
  })

  const sortedImageMap = Object.fromEntries(
    Object.keys(imageMap)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map(key => [key, imageMap[key]]),
  )

  fs.writeFileSync(
    path.join(projectRoot, 'public', 'project-images-map.json'),
    `${JSON.stringify(sortedImageMap, null, 2)}\n`,
  )

  console.log('Image map generated successfully!')
}

main()
