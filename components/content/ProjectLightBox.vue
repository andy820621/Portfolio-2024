<script setup lang="ts">
import type { Photo } from '~/components/LightBox.vue'

const { folder } = defineProps<{
  folder: string
}>()

const { loading, error, getProjectImages } = useProjectImages()
const photos = ref<Photo[]>([])

onMounted(async () => {
  try {
    photos.value = await getProjectImages(folder)
  }
  catch (err) {
    console.error(err)
    // 處理錯誤
  }
})

// const { data: photos, error } = await useFetch<Photo[]>('/api/project-images', {
//   query: { folder },
//   onResponseError(error) {
//     console.error('API Response Error:', error)
//   },
// })
</script>

<template>
  <LightBox v-if="photos && photos.length" :photos="photos" />
  <div v-else-if="loading || (photos && !photos.length)">
    <img
      src="/video-loading.gif"
      alt="loading..."
      class="w-full border-b border-base"
    >
  </div>
  <div v-else-if="error" class="text-red-500">
    Error loading images: {{ error?.message || '未知錯誤' }}
  </div>
  <div v-else class="text-red-500">
    No images found in folder: {{ folder }}
  </div>
</template>
