import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

function main() {
  try {
    // 讀取已有的專案圖片映射檔
    const imageMapPath = path.join(projectRoot, 'public', 'project-images-map.json')
    const imageMapContent = fs.readFileSync(imageMapPath, 'utf8')
    const imageMap = JSON.parse(imageMapContent)

    // 嘗試讀取已有的元數據檔案 (如果存在)
    const metadataPath = path.join(projectRoot, 'public', 'project-images-metadata.json')
    let existingMetadata = {}

    try {
      if (fs.existsSync(metadataPath)) {
        const metadataContent = fs.readFileSync(metadataPath, 'utf8')
        existingMetadata = JSON.parse(metadataContent)
        console.log('找到現有的元數據檔案，將保留已存在的自定義值')
      }
    }
    catch (readErr) {
      console.warn('讀取現有元數據檔案失敗，將創建新檔案', readErr)
    }

    // 初始化元數據物件 (以現有資料為基礎)
    const metadata = { ...existingMetadata }

    // 為每個專案資料夾建立元數據
    Object.entries(imageMap).forEach(([folder, images]) => {
      // 確保資料夾存在於元數據中
      if (!metadata[folder]) {
        metadata[folder] = {}
      }

      images.forEach((image) => {
        // 檢查此圖片是否已有自定義元數據
        if (metadata[folder]?.[image]) {
          // 已有自定義元數據，保留不修改
          console.log(`保留現有元數據: ${folder}/${image}`)
          return // 跳過此圖片
        }

        // 否則生成新的元數據
        const nameWithoutExt = image.substring(0, image.lastIndexOf('.'))

        // 嘗試從檔名解析信息
        const orderNameMatch = nameWithoutExt.match(/^(\d+)\.([^.]+)(?:\.([^.]+))?$/)

        let title, description

        if (orderNameMatch) {
          const [, , id, customTitle] = orderNameMatch
          title = customTitle ? customTitle.replace(/-/g, ' ') : id.replace(/-/g, ' ')
        }
        else {
          title = nameWithoutExt.replace(/-/g, ' ')
        }

        // 首字大寫
        title = title.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        description = `${folder.replace(/-/g, ' ')} - ${title}`

        // 將專案名稱首字大寫
        description = description.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        // 設置新的元數據
        if (!metadata[folder]) {
          metadata[folder] = {}
        }
        metadata[folder][image] = { title, description }
      })
    })

    // 將元數據寫入檔案
    fs.writeFileSync(
      metadataPath,
      JSON.stringify(metadata, null, 2),
    )

    console.log('元數據檔案已生成：public/project-images-metadata.json')
  }
  catch (error) {
    console.error('Error generating image metadata:', error)
    process.exit(1)
  }
}

main()
