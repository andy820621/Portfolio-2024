import fs from 'node:fs'
import path from 'node:path'

export default defineEventHandler((event) => {
  const album = getRouterParam(event, 'album')

  if (!album) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Album parameter is required',
    })
  }

  try {
    // eslint-disable-next-line node/prefer-global/process
    const publicDir = path.join(process.cwd(), 'public', 'gallery-images', album)

    // 檢查目錄是否存在
    if (!fs.existsSync(publicDir)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Album not found',
      })
    }

    // 讀取目錄中的所有文件
    const files = fs.readdirSync(publicDir)

    // 過濾出圖片文件（可根據需要調整支援的格式）
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']
    const images = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase()
        return imageExtensions.includes(ext)
      })
      .map(file => `/gallery-images/${album}/${file}`)
      .sort() // 按文件名排序

    return images
  }
  catch (error) {
    console.error('Error reading gallery images:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to read gallery images',
    })
  }
})
