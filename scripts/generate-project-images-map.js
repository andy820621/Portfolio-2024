import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import glob from 'glob'

// 使用正確的方法獲取 globSync 函數
const globSync = glob.sync || glob.globSync

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

  imageFiles.forEach((file) => {
    const dir = path.dirname(file)
    const filename = path.basename(file)
    const dirKey = dir === '.' ? '' : dir
    if (!imageMap[dirKey])
      imageMap[dirKey] = []
    imageMap[dirKey].push(filename)
  })

  fs.writeFileSync(
    path.join(projectRoot, 'public', 'projects-image-map.json'),
    JSON.stringify(imageMap, null, 2),
  )

  console.log('Image map generated successfully!')
}

main()
