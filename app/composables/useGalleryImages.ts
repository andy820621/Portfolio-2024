export function useGalleryImages() {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const imageMap = ref<Record<string, string[]>>({})
  const hasLoadedMap = ref(false)

  // 載入圖片映射檔案
  async function loadImageMap() {
    if (hasLoadedMap.value)
      return

    loading.value = true
    error.value = null

    try {
      const response = await fetch('/gallery-images-map.json')
      if (!response.ok) {
        throw new Error(`Failed to load gallery image map: ${response.statusText}`)
      }

      imageMap.value = await response.json()
      hasLoadedMap.value = true
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('Error loading gallery images map:', err)
    }
    finally {
      loading.value = false
    }
  }

  // 獲取特定相簿的圖片
  async function getAlbumImages(albumId: string) {
    if (!hasLoadedMap.value) {
      await loadImageMap()
    }

    const imageFiles = imageMap.value[albumId]

    if (!imageFiles || imageFiles.length === 0) {
      throw new Error(`No images found for album: ${albumId}`)
    }

    return imageFiles.map((file: string) => encodeUrlPath(`/gallery-images/${albumId}/${file}`))
  }

  return {
    loading,
    error,
    loadImageMap,
    getAlbumImages,
  }
}
