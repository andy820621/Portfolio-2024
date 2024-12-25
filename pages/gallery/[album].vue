<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import lightGallery from 'lightgallery'
import lgShare from 'lightgallery/plugins/share'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'
import { galleryGroups } from '~/data/galleryData'

definePageMeta({
  documentDriven: {
    page: false,
    surround: false,
  },
})

const route = useRoute()
const albumId = route.params.album as string

const album = computed(() =>
  galleryGroups.find(group => group.id === albumId),
)

const breakpoints = useBreakpoints(breakpointsTailwind)

// 根據斷點計算列數
const cols = computed(() => {
  if (breakpoints['2xl'].value)
    return 4
  if (breakpoints.xl.value || breakpoints.lg.value)
    return 3
  if (breakpoints.md.value || breakpoints.sm.value)
    return 2
  if (breakpoints.smaller('sm'))
    return 1
  return 1
})

// const parts = computed(() => {
//   if (!album.value)
//     return []
//   const images = album.value.images
//   return Array.from({ length: cols.value }, (_, i) =>
//     images.filter((_, j) => j % cols.value === i))
// })
// Try to use more efficient way
const parts = computed(() => {
  if (!album.value)
    return []

  const images = album.value.images
  return images.reduce((result, image, index) => {
    const col = index % cols.value
    if (!result[col])
      result[col] = []
    result[col].push(image)
    return result
  }, [] as string[][])
})

useSeoMeta({
  title: album.value?.title,
  ogTitle: album.value?.title,
})

// LightGallery 相關
const lightGalleryContainer = ref<HTMLDivElement | null>(null)
const lightGalleryInstance = ref<ReturnType<typeof lightGallery> | null>(null)
const lightGalleryDynamicEl = computed(() => {
  if (!album.value)
    return []
  return album.value.images.map(src => ({
    src,
    thumb: src,
    subHtml: `<h4>${album.value?.title}</h4>`,
  }))
})

function openLightGallery(startIndex: number) {
  if (!album.value)
    return

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

// 計算每個列中的圖像索引在原始數組中的位置
function calculateOriginalIndex(colIdx: number, rowIdx: number) {
  return rowIdx * cols.value + colIdx
}
</script>

<template>
  <div v-if="album" class="container max-w-10xl mx-auto mt-8">
    <h1 class="text-2xl font-bold mb-24 text-center">
      {{ album.title }}
    </h1>

    <ClientOnly>
      <div
        ref="lightGalleryContainer"
        grid="~ cols-1 sm:cols-2 lg:cols-3 2xl:cols-4 gap-[.55rem]"
        class="text-zinc-600"
      >
        <div v-for="(items, colIdx) in parts" :key="colIdx" flex="~ col gap-[.55rem]">
          <div
            v-for="(src, rowIdx) in items"
            :key="rowIdx"
            class="slide-enter cursor-pointer"
            :style="{ '--enter-stage': colIdx + 1 }"
            @click="openLightGallery(calculateOriginalIndex(colIdx, rowIdx))"
          >
            <NuxtImg
              :src="src"
              :alt="`${album.title} - 第 ${calculateOriginalIndex(colIdx, rowIdx) + 1} 张图片`"
              class="w-full h-auto object-cover"
              placeholder
              loading="lazy"
              format="webp"
              quality="81"
            />
            <!-- <img
              :src="src"
              :alt="`${album.title} - Image ${rowIdx + 1}`"
              class="w-full h-auto object-cover"
            > -->
          </div>
        </div>
      </div>
    </ClientOnly>
  </div>

  <div v-else class="container max-w-10xl mx-auto mt-8">
    <!-- <NotFound /> -->
    Loading...
  </div>
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
