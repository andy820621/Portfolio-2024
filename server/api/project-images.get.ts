import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

export default defineEventHandler((event) => {
  const projectFolder = getQuery(event).folder as string
  const publicPath = path.join(process.cwd(), 'public', 'project-images', projectFolder)

  try {
    const files = fs.readdirSync(publicPath)
    const imageFiles = files.filter(file =>
      ['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext =>
        file.toLowerCase().endsWith(ext),
      ),
    )

    const photos = imageFiles.map((file) => {
      // 取得檔名（不含副檔名）
      const nameWithoutExt = file.substring(0, file.lastIndexOf('.'))
      // 如果檔名中還有點號，取最後一個點號之前的部分
      const title = nameWithoutExt.includes('.')
        ? nameWithoutExt.substring(nameWithoutExt.lastIndexOf('.') + 1)
        : nameWithoutExt

      return {
        src: `/project-images/${projectFolder}/${file}`,
        title,
        description: `${projectFolder} ${file} image`,
      }
    })

    return photos
  }
  catch (error) {
    console.error('Error reading project images:', error)
    return []
  }
})
