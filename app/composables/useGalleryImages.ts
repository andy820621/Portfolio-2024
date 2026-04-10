export function useGalleryImages() {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const imagesByAlbum = shallowRef<Record<string, string[]>>({})

  // 獲取特定相簿的圖片
  async function getAlbumImages(albumId: string) {
    const cachedImages = imagesByAlbum.value[albumId]
    if (cachedImages?.length)
      return cachedImages

    loading.value = true
    error.value = null

    try {
      const images = await $fetch<string[]>('/api/gallery-images', {
        query: { albumId },
      })

      imagesByAlbum.value = {
        ...imagesByAlbum.value,
        [albumId]: images,
      }

      return images
    }
    catch (err) {
      const galleryError = err instanceof Error ? err : new Error(String(err))
      error.value = galleryError
      console.error('Error loading gallery images:', err)
      throw galleryError
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getAlbumImages,
  }
}
