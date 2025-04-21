// TODO: Consider deleting this unused API
import fs from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export default defineEventHandler((event) => {
  const projectFolder = getQuery(event).folder as string

  const isProduction = process.env.NODE_ENV === 'production'

  // 取得目前檔案的目錄路徑
  const currentDir = fileURLToPath(new URL('.', import.meta.url))
  const publicDir = isProduction
    ? join(currentDir, '../../../', 'dist/project-images')
    : join(process.cwd(), 'public/project-images')

  const publicPath = join(publicDir, projectFolder)

  try {
    const files = fs.readdirSync(publicPath)
    const imageFiles = files.filter(file =>
      ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext =>
        file.toLowerCase().endsWith(ext),
      ),
    )

    const photos = imageFiles.map((file) => {
      const nameWithoutExt = file.substring(0, file.lastIndexOf('.'))
      const title = nameWithoutExt.includes('.')
        ? nameWithoutExt.substring(nameWithoutExt.lastIndexOf('.') + 1)
        : nameWithoutExt

      return {
        src: `/project-images/${projectFolder}/${file}`,
        title,
        description: `${projectFolder} ${title} image`,
      }
    })

    return photos
  }
  catch (error) {
    console.error('Error reading project images:', error)
    throw createError({
      statusCode: 404,
      message: `Unable to find images in folder: ${projectFolder}`,
    })
  }
})
