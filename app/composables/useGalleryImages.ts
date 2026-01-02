export function useGalleryImages() {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const imageMap = shallowRef<Record<string, string[]>>({})
  const hasLoadedMap = ref(false)
  const mapPath = '/gallery-images-map.json'

  async function readImageMapFromFile() {
    const { readFile, access } = await import('node:fs/promises')
    const { join } = await import('node:path')
    const { cwd } = await import('node:process')

    const rootDir = cwd()
    const candidates = [
      join(rootDir, 'public', 'gallery-images-map.json'),
      join(rootDir, '.output', 'public', 'gallery-images-map.json'),
      join(rootDir, '..', 'public', 'gallery-images-map.json'),
    ]

    for (const filePath of candidates) {
      try {
        await access(filePath)
        const raw = await readFile(filePath, 'utf8')
        return JSON.parse(raw) as Record<string, string[]>
      }
      catch {
        continue
      }
    }

    throw new Error('Failed to locate gallery image map on server.')
  }

  // 載入圖片映射檔案
  async function loadImageMap() {
    if (hasLoadedMap.value)
      return

    loading.value = true
    error.value = null

    try {
      if (import.meta.server) {
        imageMap.value = await readImageMapFromFile()
      }
      else {
        const response = await fetch(mapPath)
        if (!response.ok)
          throw new Error(`Failed to load gallery image map: ${response.statusText}`)
        imageMap.value = await response.json()
      }
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
