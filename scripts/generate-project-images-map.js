import fs from 'node:fs'
// 使用 CommonJS 風格導入 glob
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const glob = require('glob')

const globSync = glob.sync

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const projectImagesDir = path.join(projectRoot, 'public/project-images')
const imageMap = {}

function main() {
  const imageFiles = globSync('**/*.{jpg,jpeg,png,gif,webp}', {
    cwd: projectImagesDir,
    nodir: true,
  })

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
      // 按數字大小排序
      return numA - numB
    })
  })

  fs.writeFileSync(
    path.join(projectRoot, 'public', 'project-images-map.json'),
    JSON.stringify(imageMap, null, 2),
  )

  console.log('Image map generated successfully!')
}

main()
