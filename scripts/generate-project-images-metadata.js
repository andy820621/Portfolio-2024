import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const imageMapPath = path.join(projectRoot, 'public', 'project-images-map.json')
const metadataPathEn = path.join(projectRoot, 'public', 'project-images-metadata.json')
const metadataPathZh = path.join(projectRoot, 'public', 'project-images-metadata.zh.json')

function readJsonFileOrFallback(filePath, fallback = {}) {
  try {
    if (!fs.existsSync(filePath))
      return fallback
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  }
  catch (error) {
    console.warn(`讀取 JSON 失敗，將使用 fallback：${filePath}`, error)
    return fallback
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
}

function titleCase(text) {
  return text.split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function titleCasePath(folderPath) {
  return folderPath
    .split('/')
    .map(segment => titleCase(segment.replace(/-/g, ' ')))
    .join('/')
}

function buildDefaultMetadata({ folder, image }) {
  const nameWithoutExt = image.substring(0, image.lastIndexOf('.'))

  // 嘗試從檔名解析信息： "01.id.title" 或 "01.id"
  const orderNameMatch = nameWithoutExt.match(/^(\d+)\.([^.]+)(?:\.([^.]+))?$/)

  let titleRaw
  if (orderNameMatch) {
    const [, , id, customTitle] = orderNameMatch
    titleRaw = customTitle || id
  }
  else {
    titleRaw = nameWithoutExt
  }

  const title = titleCase(titleRaw.replace(/-/g, ' '))
  const folderLabel = folder ? titleCasePath(folder) : ''
  const description = folderLabel ? `${folderLabel} - ${title}` : title

  return { title, description }
}

function fillMissingMetadata({ imageMap, existingMetadata }) {
  const metadata = { ...existingMetadata }
  let addedCount = 0

  Object.entries(imageMap).forEach(([folder, images]) => {
    if (!metadata[folder])
      metadata[folder] = {}

    images.forEach((image) => {
      if (metadata[folder]?.[image])
        return

      metadata[folder][image] = buildDefaultMetadata({ folder, image })
      addedCount += 1
    })
  })

  return { metadata, addedCount }
}

function main() {
  try {
    // 讀取已有的專案圖片映射檔
    const imageMapContent = fs.readFileSync(imageMapPath, 'utf8')
    const imageMap = JSON.parse(imageMapContent)

    const existingMetadataEn = readJsonFileOrFallback(metadataPathEn, {})
    const existingMetadataZh = readJsonFileOrFallback(metadataPathZh, {})

    if (Object.keys(existingMetadataEn).length)
      console.log('找到現有的英文元數據檔案，將保留已存在的自定義值')
    if (Object.keys(existingMetadataZh).length)
      console.log('找到現有的中文元數據檔案，將保留已存在的自定義值')

    const { metadata: metadataEn, addedCount: addedEn } = fillMissingMetadata({
      imageMap,
      existingMetadata: existingMetadataEn,
    })
    const { metadata: metadataZh, addedCount: addedZh } = fillMissingMetadata({
      imageMap,
      existingMetadata: existingMetadataZh,
    })

    writeJsonFile(metadataPathEn, metadataEn)
    writeJsonFile(metadataPathZh, metadataZh)

    console.log('元數據檔案已生成/更新：')
    console.log(`- public/project-images-metadata.json (+${addedEn})`)
    console.log(`- public/project-images-metadata.zh.json (+${addedZh})`)
  }
  catch (error) {
    console.error('Error generating image metadata:', error)
    process.exit(1)
  }
}

main()
