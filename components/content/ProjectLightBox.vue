<script setup lang="ts">
import type { Photo } from '~/components/LightBox.global.vue'

const { folder } = defineProps<{
  folder: string
}>()

const { data: photos } = await useFetch<Photo[]>('/api/project-images', {
  query: { folder },
})
</script>

<template>
  <LightBox v-if="photos && photos.length" :photos="photos" />
</template>
