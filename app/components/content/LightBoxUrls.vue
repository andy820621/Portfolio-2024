<script setup lang="ts">
import type { Photo } from '~/components/LightBox.vue'

const { urls, titles, descriptions } = defineProps<{
  urls: string[] // 圖片 URL 陣列
  titles?: string[] // 可選的標題陣列
  descriptions?: string[] // 可選的描述陣列
}>()

const photos = ref<Photo[]>([])
const loading = ref(true)

// 從 URL 解析檔名作為預設標題
function getTitleFromUrl(url: string, index: number): string {
  if (titles && titles[index]) {
    return titles[index]
  }

  // 從 URL 提取檔名
  const filename = url.split('/').pop() || `Image ${index + 1}`
  // 移除副檔名並用空格取代破折號/底線
  return filename
    .substring(0, filename.lastIndexOf('.') || filename.length)
    .replace(/[-_]/g, ' ')
}

function getDescriptionFromUrl(url: string, index: number): string {
  if (descriptions && descriptions[index]) {
    return descriptions[index]
  }

  return getTitleFromUrl(url, index)
}

onMounted(() => {
  try {
    photos.value = urls.map((url, index) => ({
      src: url,
      title: getTitleFromUrl(url, index),
      description: getDescriptionFromUrl(url, index),
    }))
  }
  catch (err) {
    console.error('Error processing image URLs:', err)
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <LightBox v-if="photos && photos.length && !loading" :photos="photos" />
  <div v-else-if="loading" class="w-full border-b border-base">
    <img
      src="/video-loading.gif"
      alt="loading..."
      class="w-full"
    >
  </div>
  <div v-else class="text-red-500">
    No valid image URLs provided
  </div>
</template>
