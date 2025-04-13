export function useProjectImages() {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const imageMap = ref<Record<string, string[]>>({})
  const hasLoadedMap = ref(false)

  // 載入圖片映射檔案
  const loadImageMap = async () => {
    if (hasLoadedMap.value)
      return

    loading.value = true
    error.value = null

    try {
      const response = await fetch('/projects-image-map.json')
      if (!response.ok) {
        throw new Error(`Failed to load image map: ${response.statusText}`)
      }
      imageMap.value = await response.json()
      hasLoadedMap.value = true
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('Error loading project images map:', err)
    }
    finally {
      loading.value = false
    }
  }

  // 獲取特定專案資料夾的圖片
  const getProjectImages = async (projectFolder: string) => {
    if (!hasLoadedMap.value) {
      await loadImageMap()
    }

    const imageFiles = imageMap.value[projectFolder]

    if (!imageFiles || imageFiles.length === 0) {
      throw new Error(`No images found for folder: ${projectFolder}`)
    }

    return imageFiles.map((file: string) => {
      const nameWithoutExt: string = file.substring(0, file.lastIndexOf('.'))
      const title: string = nameWithoutExt.includes('.')
        ? nameWithoutExt.substring(nameWithoutExt.lastIndexOf('.') + 1)
        : nameWithoutExt

      return {
        src: `/project-images/${projectFolder}/${file}`,
        title,
        description: `${projectFolder} ${title} image`,
      }
    })
  }

  return {
    loading,
    error,
    loadImageMap,
    getProjectImages,
  }
}
