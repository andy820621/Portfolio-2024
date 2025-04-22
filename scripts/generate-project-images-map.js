import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pkg from 'glob'

const { glob } = pkg

// 獲取當前文件的目錄路徑
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const projectImagesDir = path.join(projectRoot, 'public/project-images')
const imageMap = {}

// 使用 glob 找到所有圖片文件
const imageFiles = await glob('**/*.{jpg,jpeg,png,gif,webp}', {
  cwd: projectImagesDir,
  nodir: true, // 確保只匹配文件，不匹配目錄
})

// 按目錄分組
imageFiles.forEach((file) => {
  const dir = path.dirname(file)
  const filename = path.basename(file)

  // 如果是根目錄，使用特殊標記
  const dirKey = dir === '.' ? '' : dir

  if (!imageMap[dirKey]) {
    imageMap[dirKey] = []
  }

  imageMap[dirKey].push(filename)
})

// 寫入到 JSON 檔案
fs.writeFileSync(
  path.join(projectRoot, 'public', 'projects-image-map.json'),
  JSON.stringify(imageMap, null, 2),
)

console.log('Image map generated successfully!')
