export function useProjectImages() {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const imageMap = ref<Record<string, string[]>>({})
  const metadataMap = ref<Record<string, Record<string, { title: string, description: string }>>>({})
  const hasLoadedMap = ref(false)

  const { locale } = useI18n()

  // 載入圖片映射檔案與元數據
  async function loadImageMap() {
    if (hasLoadedMap.value)
      return

    loading.value = true
    error.value = null

    try {
    // 同時發起兩個請求並等待結果
      const [imageMapData, metadataMapData] = await Promise.allSettled([
        fetch('/project-images-map.json').then((res) => {
          if (!res.ok)
            throw new Error(`Failed to load image map: ${res.statusText}`)
          return res.json()
        }),
        fetch(locale.value === 'zh' ? '/project-images-metadata.zh.json' : '/project-images-metadata.json').then((res) => {
          if (!res.ok)
            return null // 元數據是可選的，不存在不拋出錯誤
          return res.json()
        }),
      ])

      // 處理結果
      if (imageMapData.status === 'fulfilled') {
        imageMap.value = imageMapData.value
      }
      else {
        throw imageMapData.reason // 圖片映射檔必須存在，否則拋出錯誤
      }

      // 處理元數據，如果成功獲取則設置，否則使用空對象
      if (metadataMapData.status === 'fulfilled' && metadataMapData.value) {
        metadataMap.value = metadataMapData.value
      }
      else {
        console.warn('Image metadata not available, falling back to generated values', metadataMapData.status === 'rejected' ? metadataMapData.reason : 'Metadata fetch returned empty result')
      }

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

  // 從檔案名稱解析信息
  function parseInfoFromFilename(file: string) {
    // 移除副檔名
    const nameWithoutExt = file.substring(0, file.lastIndexOf('.'))

    // 檢查是否使用命名慣例 "01.order-name.title"
    const orderNameMatch = nameWithoutExt.match(/^(\d+)\.([^.]+)(?:\.([^.]+))?$/)

    if (orderNameMatch) {
      // 有排序格式
      const [, order, id, title] = orderNameMatch
      return {
        order: order ? Number.parseInt(order, 10) : 999,
        id: id ? id.replace(/-/g, ' ') : nameWithoutExt,
        title: title ? title.replace(/-/g, ' ') : id ? id.replace(/-/g, ' ') : nameWithoutExt,
      }
    }

    // 一般格式，用破折號作為字詞分隔
    return {
      order: 999, // 預設順序在最後
      id: nameWithoutExt,
      title: nameWithoutExt.replace(/-/g, ' '),
    }
  }

  // 獲取特定專案資料夾的圖片
  async function getProjectImages(projectFolder: string) {
    if (!hasLoadedMap.value) {
      await loadImageMap()
    }

    const imageFiles = imageMap.value[projectFolder]

    if (!imageFiles || imageFiles.length === 0) {
      throw new Error(`No images found for folder: ${projectFolder}`)
    }

    return imageFiles.map((file: string) => {
      // 從專案元數據中獲取圖片資訊 (如果有)
      const metadata = metadataMap.value[projectFolder]?.[file]

      // 如果沒有元數據，則嘗試從檔名解析
      const { title: parsedTitle, id } = parseInfoFromFilename(file)

      const title = metadata?.title || parsedTitle
      const description = metadata?.description || `${projectFolder} - ${title}`

      return {
        src: `/project-images/${projectFolder}/${file}`,
        title,
        description,
        id,
      }
    }).sort((a, b) => {
      // 根據從檔案名解析的順序排序
      const orderA = parseInfoFromFilename(a.src.split('/').pop() || '').order
      const orderB = parseInfoFromFilename(b.src.split('/').pop() || '').order
      return orderA - orderB
    })
  }

  return {
    loading,
    error,
    loadImageMap,
    getProjectImages,
  }
}
