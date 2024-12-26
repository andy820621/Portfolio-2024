<script setup lang="ts">
import lightGallery from 'lightgallery'
import lgShare from 'lightgallery/plugins/share'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'

const { images, title } = defineProps<{
  images: string[]
  title?: string
}>()

const lightGalleryContainer = ref<HTMLDivElement | null>(null)
const lightGalleryInstance = ref<ReturnType<typeof lightGallery> | null>(null)

const lightGalleryDynamicEl = computed(() =>
  images.map(src => ({
    src,
    thumb: src,
    subHtml: `<h4>${title || ''}</h4>`,
  })),
)

function openLightGallery(startIndex: number) {
  lightGalleryInstance.value = lightGallery(lightGalleryContainer.value!, {
    dynamic: true,
    dynamicEl: lightGalleryDynamicEl.value,
    index: startIndex,
    plugins: [lgThumbnail, lgZoom, lgShare],
    mode: 'lg-slide',
  })

  lightGalleryInstance.value.openGallery(startIndex)
}

onUnmounted(() => {
  if (lightGalleryInstance.value) {
    lightGalleryInstance.value.destroy()
    lightGalleryInstance.value = null
  }
})

defineExpose({
  openLightGallery,
})
</script>

<template>
  <div ref="lightGalleryContainer" />
</template>

<style>
@import 'lightgallery/css/lightgallery.css';
@import 'lightgallery/css/lg-thumbnail.css';
@import 'lightgallery/css/lg-zoom.css';
@import 'lightgallery/css/lg-share.css';
@import 'lightgallery/css/lg-transitions.css';

.lg-backdrop {
  background-color: hsla(0, 0%, 0%, 0.81);
  backdrop-filter: blur(8px);
}
</style>
