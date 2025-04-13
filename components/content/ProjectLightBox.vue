<script setup lang="ts">
import type { Photo } from '~/components/LightBox.global.vue'

const { folder } = defineProps<{
  folder: string
}>()

const { data: photos, error } = await useFetch<Photo[]>('/api/project-images', {
  query: { folder },
})
</script>

<template>
  <LightBox v-if="photos && photos.length" :photos="photos" />
  <div v-else-if="photos && !photos.length">
    No images found.
  </div>
  <div v-else>
    ProjectLightBox Component has an error: {{ error }}
  </div>
</template>
