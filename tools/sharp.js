/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

// 獲取當前文件的目錄
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置
const CONFIG = {
  inputFolder: path.join(__dirname, 'original'),
  outputFolder: path.join(__dirname, 'output'),
  coverFolder: path.join(__dirname, 'cover'),
  maxWidth: 1920,
  maxHeight: 1200,
  coverMaxWidth: 650,
  coverMaxHeight: 650,
  quality: 80,
  coverQuality: 100,
}

// 確保資料夾存在
function ensureFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }
}

// 計算等比例縮放尺寸（通用函數）
async function calculateResizeDimensions(inputPath, maxWidth, maxHeight) {
  const metadata = await sharp(inputPath).metadata()
  const { width, height } = metadata

  let newWidth, newHeight

  // 判斷是橫幅還是直幅
  if (width > height) {
    // 橫幅照片：按最大寬度縮放
    newWidth = Math.min(width, maxWidth)
    newHeight = Math.round((newWidth / width) * height)
  }
  else {
    // 直幅照片：按最大高度縮放
    newHeight = Math.min(height, maxHeight)
    newWidth = Math.round((newHeight / height) * width)
  }

  return { width: newWidth, height: newHeight }
}

// 轉換單一圖片（通用函數）
async function convertImage(inputPath, outputPath, maxWidth, maxHeight, quality) {
  try {
    // 計算縮放尺寸
    const { width, height } = await calculateResizeDimensions(inputPath, maxWidth, maxHeight)

    await sharp(inputPath)
      .resize({
        width,
        height,
        fit: 'contain',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toFile(outputPath)

    console.log(`轉換成功: ${path.basename(inputPath)} → WebP (${width}x${height})`)
  }
  catch (error) {
    console.error(`轉換失敗 ${inputPath}:`, error)
  }
}

// 生成圖片組
async function generateImageSet() {
  ensureFolder(CONFIG.outputFolder)

  const files = fs.readdirSync(CONFIG.inputFolder)
  const supportedFormats = ['.tiff', '.tif', '.jpg', '.jpeg', '.png']

  for (const file of files) {
    const ext = path.extname(file).toLowerCase()

    if (supportedFormats.includes(ext)) {
      const inputPath = path.join(CONFIG.inputFolder, file)
      const outputFileName = `${path.basename(file, ext)}.webp`
      const outputPath = path.join(CONFIG.outputFolder, outputFileName)

      await convertImage(
        inputPath,
        outputPath,
        CONFIG.maxWidth,
        CONFIG.maxHeight,
        CONFIG.quality,
      )
    }
  }

  console.log('圖片組生成完成！')
}

// 生成封面
// 生成封面
async function generateCover(specificFile = null) {
  ensureFolder(CONFIG.coverFolder)

  const files = fs.readdirSync(CONFIG.outputFolder)
    .filter(file => file.endsWith('.webp'))

  // 如果 output 資料夾中沒有 WebP 檔案
  if (files.length === 0) {
    console.error('output 資料夾中沒有 WebP 檔案')
    return
  }

  let selectedFile
  if (specificFile) {
    // 如果指定了特定文件
    selectedFile = files.find(file =>
      file.toLowerCase().startsWith(specificFile.toLowerCase()),
    )

    if (!selectedFile) {
      console.error(`未找到名為 ${specificFile} 的文件`)
      console.log('可用的檔案:', files)
      return
    }
  }
  else {
    // 隨機選擇
    selectedFile = files[Math.floor(Math.random() * files.length)]
  }

  // 確保 selectedFile 存在
  if (!selectedFile) {
    console.error('無法選擇檔案')
    return
  }

  const inputPath = path.join(CONFIG.outputFolder, selectedFile)
  const outputPath = path.join(CONFIG.coverFolder, selectedFile)

  // 檢查輸入路徑是否存在
  if (!fs.existsSync(inputPath)) {
    console.error(`輸入檔案不存在: ${inputPath}`)
    return
  }

  await convertImage(
    inputPath,
    outputPath,
    CONFIG.coverMaxWidth,
    CONFIG.coverMaxHeight,
    CONFIG.coverQuality,
  )

  console.log(`封面生成完成：${selectedFile}`)
}

// 主函數
async function main() {
  // 獲取命令行參數
  const args = process.argv.slice(2)

  try {
    switch (args[0]) {
      case undefined:
        // 默認行為：只生成圖片組
        await generateImageSet()
        break
      case 'all':
        // 生成圖片組和封面
        await generateImageSet()
        await generateCover()
        break
      case 'cover':
        if (args[1]) {
          // 生成指定名稱的封面
          await generateCover(args[1])
        }
        else {
          // 隨機生成封面
          await generateCover()
        }
        break
      default:
        console.log('無效的參數')
    }
  }
  catch (error) {
    console.error('發生錯誤:', error)
  }
}

// 執行主函數
main().catch(console.error)

/*
使用方法：

1. 生成原始圖片組（默認行為）：
   node tools/sharp.js

2. 生成圖片組和封面：
   node tools/sharp.js all

3. 隨機生成封面：
   node tools/sharp.js cover

4. 根據特定文件名生成封面：
   node tools/sharp.js cover filename（不需要包含副檔名）

注意事項：
- 確保 'original' 資料夾中有原始圖片
- 封面將從 'output' 資料夾中的 WebP 文件中選擇
- 封面將保存在 'cover' 資料夾中
*/
