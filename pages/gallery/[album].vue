<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import LightGallery from '~/components/LightGallery.vue'
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

// 動態獲取資料夾內的照片
const { data: images } = await useAsyncData(`gallery-${albumId}`, async () => {
  const imageModules = import.meta.glob('/public/gallery-images/**/*')

  return Object.keys(imageModules)
    .filter(path => path.includes(`/public/gallery-images/${albumId}/`))
    .map(path => path.replace('/public', ''))
})

const breakpoints = useBreakpoints(breakpointsTailwind)

// 根據斷點計算列數
const cols = computed(() => {
  if (breakpoints['2xl'].value)
    return 4
  if (breakpoints.xl.value || breakpoints.lg.value)
    return 3
  // 手機和平板都保持2列
  return 2
})

const parts = computed(() => {
  if (!images.value)
    return []

  return images.value.reduce((result, image, index) => {
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

const lightGalleryRef = ref<InstanceType<typeof LightGallery> | null>(null)

function openLightGallery(startIndex: number) {
  lightGalleryRef.value?.openLightGallery(startIndex)
}

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
      <LightGallery
        v-if="images && images.length"
        ref="lightGalleryRef"
        :images="images"
        :title="album.title"
      />

      <div
        v-if="images && images.length"
        grid="~ cols-2 sm:cols-2 lg:cols-3 2xl:cols-4 gap-1 sm:gap-2 lg:gap-[.55rem]"
        class="text-zinc-600"
      >
        <div v-for="(items, colIdx) in parts" :key="colIdx" flex="~ col gap-1 sm:gap-2 lg:gap-[.55rem]">
          <div
            v-for="(src, rowIdx) in items"
            :key="rowIdx"
            class="slide-enter cursor-zoom-in"
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
              quality="24"
            />
            <!-- <img
              :src="src"
              :alt="`${album.title} - Image ${rowIdx + 1}`"
              class="w-full h-auto object-cover"
            > -->
          </div>
        </div>
      </div>
      <div v-else class="text-center">
        No images found
      </div>
    </ClientOnly>
  </div>

  <div v-else class="container max-w-10xl mx-auto mt-8">
    <!-- <NotFound /> -->
    Loading...
  </div>
</template>

<style>
@media (max-width: 750px) {
  main {
    @apply !px-5.5;
  }
}
</style>
